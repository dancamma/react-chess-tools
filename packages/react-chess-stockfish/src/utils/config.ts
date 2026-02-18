import type { AnalysisState, StockfishConfig } from "../types";

/**
 * Default throttle delay in milliseconds (~20 updates per second).
 */
export const DEFAULT_THROTTLE_MS = 50;

/**
 * Default initialization timeout in milliseconds.
 */
export const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Compare two StockfishConfig objects for equality using shallow comparison.
 * This is more efficient and reliable than JSON.stringify.
 */
export function configCompareEqual(
  a: StockfishConfig,
  b: StockfishConfig,
): boolean {
  return (
    a.skillLevel === b.skillLevel &&
    a.depth === b.depth &&
    a.multiPV === b.multiPV &&
    a.moveTime === b.moveTime
  );
}

/**
 * Initial state when engine is first created.
 */
export function getInitialState(): AnalysisState {
  return {
    fen: "",
    config: {},
    evaluation: null,
    normalizedEvaluation: 0,
    bestLine: null,
    principalVariations: [],
    depth: 0,
    status: "initializing",
    isEngineThinking: false,
    hasResults: false,
    error: null,
  };
}
