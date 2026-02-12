import { Chess, validateFen as chessValidateFen } from "chess.js";
import type { Evaluation, PVMove, StockfishConfig } from "../types";
import { InvalidFenError } from "./evaluation";

/**
 * Parsed info from a Stockfish info line.
 */
export interface ParsedInfo {
  multipv?: number;
  depth?: number;
  score?: Evaluation;
  pv?: string[];
  nodes?: number;
  nps?: number;
  tbHits?: number;
  time?: number;
}

/**
 * Validate a FEN string using chess.js.
 *
 * @param fen - The FEN string to validate
 * @throws {InvalidFenError} If the FEN is invalid
 *
 * @example
 * ```ts
 * validateFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"); // OK
 * validateFen("invalid"); // throws InvalidFenError
 * ```
 */
export function validateFen(fen: string): void {
  const validation = chessValidateFen(fen);
  if (!validation.ok) {
    throw new InvalidFenError(fen, validation.error ?? "Invalid FEN string");
  }
}

/**
 * Convert a UCI move to Standard Algebraic Notation (SAN).
 *
 * Uses chess.js to perform the move on the given position and retrieve
 * its SAN representation. This handles all chess notations including
 * castling (e1g1 → O-O), promotions (e7e8q → e8=Q), and disambiguation.
 *
 * @param uci - The UCI move string (e.g., "e2e4", "e7e8q")
 * @param fen - The FEN string representing the position before the move
 * @returns The SAN representation of the move (e.g., "e4", "e8=Q", "O-O")
 *
 * @example
 * ```ts
 * uciToSan("e2e4", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"); // "e4"
 * uciToSan("e1g1", "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");                   // "O-O"
 * uciToSan("e7e8q", "4k3/4P3/8/8/8/8/8/4K3 w - - 0 1");                        // "e8=Q"
 * ```
 */
export function uciToSan(uci: string, fen: string): string {
  const chess = new Chess(fen);
  try {
    const move = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.slice(4) || undefined,
    });
    return move ? move.san : uci;
  } catch {
    return uci;
  }
}

/**
 * Convert an array of UCI moves to PVMove objects with both UCI and SAN.
 *
 * @param uciMoves - Array of UCI move strings
 * @param fen - The starting position FEN
 * @returns Array of PVMove objects with both UCI and SAN notation
 *
 * @example
 * ```ts
 * uciToPvMoves(
 *   ["e2e4", "e7e5", "g1f3"],
 *   "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
 * );
 * // [
 * //   { uci: "e2e4", san: "e4" },
 * //   { uci: "e7e5", san: "e5" },
 * //   { uci: "g1f3", san: "Nf3" }
 * // ]
 * ```
 */
export function uciToPvMoves(uciMoves: string[], fen: string): PVMove[] {
  const result: PVMove[] = [];
  const chess = new Chess(fen);

  for (const uci of uciMoves) {
    try {
      const move = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.slice(4) || undefined,
      });

      if (move) {
        result.push({
          uci,
          san: move.san,
        });
      } else {
        // Fallback: if move fails (shouldn't happen with engine PVs),
        // still include the UCI move
        result.push({
          uci,
          san: uci,
        });
      }
    } catch {
      // If move throws (e.g., invalid move), still include the UCI move
      result.push({
        uci,
        san: uci,
      });
    }
  }

  return result;
}

/**
 * Parse a Stockfish UCI info line into structured data.
 *
 * Example lines:
 * "info depth 20 seldepth 35 score cp 123 nodes 1000000 nps 1000000 tbhits 0 time 1000 pv e2e4 e7e5"
 * "info depth 15 score mate 3 nodes 500000 nps 500000 tbhits 0 time 500 pv e2e4 e7e5 g1f3"
 * "info multipv 1 depth 20 score cp 123 pv e2e4 e7e5"
 *
 * @param line - The raw info line from Stockfish
 * @returns Parsed info object, or null if the line cannot be parsed
 */
export function parseUciInfoLine(line: string): ParsedInfo | null {
  const info: ParsedInfo = {};

  // Split into tokens
  const tokens = line.split(" ");
  const nextInt = (index: number, fallback = 0): number =>
    tokens[index] ? parseInt(tokens[index], 10) : fallback;

  let i = 1; // Skip "info"
  while (i < tokens.length) {
    const token = tokens[i];

    switch (token) {
      case "multipv":
        info.multipv = nextInt(i + 1, 1);
        i += 2;
        break;
      case "depth":
        info.depth = nextInt(i + 1);
        i += 2;
        break;
      case "score": {
        const scoreType = tokens[i + 1];
        const scoreValue = tokens[i + 2];

        if (scoreType && scoreValue) {
          const value = parseInt(scoreValue, 10);

          if (scoreType === "mate") {
            info.score = { type: "mate", value };
          } else if (scoreType === "cp") {
            info.score = { type: "cp", value };
          }
          // "lowerbound"/"upperbound" are ignored for now

          i += 3;
        } else {
          i += 2;
        }
        break;
      }
      case "nodes":
        info.nodes = nextInt(i + 1);
        i += 2;
        break;
      case "nps":
        info.nps = nextInt(i + 1);
        i += 2;
        break;
      case "tbhits":
        info.tbHits = nextInt(i + 1);
        i += 2;
        break;
      case "time":
        info.time = nextInt(i + 1);
        i += 2;
        break;
      case "pv":
        // Collect all remaining tokens as the PV
        info.pv = tokens.slice(i + 1);
        i = tokens.length;
        break;
      default:
        // Skip unknown tokens
        i += 1;
        break;
    }
  }

  return info;
}

/**
 * Build the UCI "go" command parameters from a StockfishConfig.
 *
 * @param config - The Stockfish configuration
 * @returns The go command parameter string (e.g., "depth 20" or "infinite")
 */
export function buildUciGoCommand(config: StockfishConfig): string {
  const { depth } = config;

  // If depth is specified, use it instead of infinite
  if (depth !== undefined && depth > 0) {
    return `depth ${depth}`;
  }

  return "infinite";
}
