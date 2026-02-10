import type { Evaluation } from "../types";

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
 * - Centipawn evaluations are formatted as "+1.23", "-0.50", "0.00"
 * - Mate evaluations are formatted as "M3" (white mates in 3) or "-M5" (black mates in 5)
 * - Null evaluations (no analysis yet) are formatted as "–"
 *
 * @param evaluation - The evaluation to format, or null if no analysis available
 * @returns Formatted string representation
 *
 * @example
 * ```ts
 * formatEvaluation({ type: "cp", value: 123 })  // "+1.23"
 * formatEvaluation({ type: "mate", value: 3 })  // "M3"
 * formatEvaluation({ type: "mate", value: -5 }) // "-M5"
 * formatEvaluation(null)                        // "–"
 * ```
 */
export function formatEvaluation(evaluation: Evaluation | null): string {
  if (!evaluation) return "–";
  if (evaluation.type === "mate") {
    return evaluation.value > 0
      ? `M${evaluation.value}`
      : `-M${Math.abs(evaluation.value)}`;
  }
  const sign = evaluation.value > 0 ? "+" : "";
  return `${sign}${(evaluation.value / 100).toFixed(2)}`;
}

/**
 * Normalize an evaluation to a -1 to 1 range for visual display.
 *
 * Uses a sigmoid-like curve (hyperbolic tangent) to compress the evaluation range.
 * This provides better visual differentiation for moderate advantages while still
 * showing clear differences for large advantages.
 *
 * - Mate evaluations return ±1 (full advantage)
 * - Null evaluations return 0 (equal position)
 * - Centipawn evaluations are clamped to the range and passed through tanh
 *
 * @param evaluation - The evaluation to normalize, or null if no analysis available
 * @param range - The centipawn range to clamp to (default: 1000 = 10 pawns)
 * @returns Normalized value from -1 (black winning) to 1 (white winning)
 *
 * @example
 * ```ts
 * normalizeEvaluation({ type: "cp", value: 0 })      // 0
 * normalizeEvaluation({ type: "cp", value: 500 })    // ~0.46
 * normalizeEvaluation({ type: "cp", value: 1000 })   // ~0.76
 * normalizeEvaluation({ type: "mate", value: 3 })    // 1
 * normalizeEvaluation(null)                          // 0
 * ```
 */
export function normalizeEvaluation(
  evaluation: Evaluation | null,
  range = 1000,
): number {
  if (!evaluation) return 0;
  if (evaluation.type === "mate") {
    return Math.sign(evaluation.value);
  }
  const clamped = Math.max(-range, Math.min(range, evaluation.value));
  return Math.tanh(clamped / range);
}
