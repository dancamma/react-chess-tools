import { Chess, validateFen as chessValidateFen } from "chess.js";
import type { PVMove } from "../types";
import { InvalidFenError } from "./evaluation";

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
