import type { Evaluation } from "../types";

/**
 * Lichess cp -> winning chance coefficient.
 */
const LICHESS_CP_WIN_CHANCE_COEFFICIENT = 0.00368208;

/**
 * Error thrown when an invalid FEN is provided.
 * This is a recoverable error — providing a valid FEN will clear the error state.
 */
export class InvalidFenError extends Error {
  readonly fen: string;

  constructor(fen: string, reason: string) {
    super(`Invalid FEN: ${reason}`);
    this.name = "InvalidFenError";
    this.fen = fen;
  }
}

/**
 * Format an evaluation value for display.
 *
 * Lichess-style formatting:
 * - Centipawn evaluations are formatted as "+1.2", "-0.5", "0.0"
 * - Mate evaluations are formatted as "#3" (white mates in 3) or "#-5" (black mates in 5)
 * - Null evaluations (no analysis yet) are formatted as "–"
 *
 * @param evaluation - The evaluation to format, or null if no analysis available
 * @returns Formatted string representation
 *
 * @example
 * ```ts
 * formatEvaluation({ type: "cp", value: 123 })  // "+1.2"
 * formatEvaluation({ type: "mate", value: 3 })  // "#3"
 * formatEvaluation({ type: "mate", value: -5 }) // "#-5"
 * formatEvaluation(null)                        // "–"
 * ```
 */
export function formatEvaluation(evaluation: Evaluation | null): string {
  if (!evaluation) return "–";
  if (evaluation.type === "mate") {
    return `#${evaluation.value}`;
  }
  const pawns = evaluation.value / 100;
  const capped = Math.max(-99, Math.min(99, pawns));
  const normalizedZero = Math.abs(capped) < 0.05 ? 0 : capped;
  const sign = normalizedZero > 0 ? "+" : "";
  return `${sign}${normalizedZero.toFixed(1)}`;
}

/**
 * Convert centipawns to Lichess-style winning chances in [-1, 1].
 */
export function cpToWinningChances(cp: number): number {
  return 2 / (1 + Math.exp(-LICHESS_CP_WIN_CHANCE_COEFFICIENT * cp)) - 1;
}

/**
 * Normalize an evaluation to a -1 to 1 range for visual display.
 *
 * Uses the Lichess winning-chances curve for cp scores.
 *
 * - Mate evaluations return ±1 (full advantage)
 * - Null evaluations return 0 (equal position)
 * - Centipawn evaluations are converted with Lichess cp->winning-chances mapping
 *
 * @param evaluation - The evaluation to normalize, or null if no analysis available
 * @returns Normalized value from -1 (black winning) to 1 (white winning)
 *
 * @example
 * ```ts
 * normalizeEvaluation({ type: "cp", value: 0 })      // 0
 * normalizeEvaluation({ type: "cp", value: 500 })    // ~0.73
 * normalizeEvaluation({ type: "cp", value: 1000 })   // ~0.95
 * normalizeEvaluation({ type: "mate", value: 3 })    // 1
 * normalizeEvaluation(null)                          // 0
 * ```
 */
export function normalizeEvaluation(evaluation: Evaluation | null): number {
  if (!evaluation) return 0;
  if (evaluation.type === "mate") {
    return Math.sign(evaluation.value);
  }
  return cpToWinningChances(evaluation.value);
}
