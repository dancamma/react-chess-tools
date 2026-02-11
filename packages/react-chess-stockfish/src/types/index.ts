import { Color } from "chess.js";

export type Evaluation =
  | { type: "cp"; value: number }
  | { type: "mate"; value: number };

export interface PVMove {
  uci: string;
  san: string;
}

export interface PrincipalVariation {
  rank: number;
  evaluation: Evaluation | null;
  moves: PVMove[];
}

export type EngineStatus = "initializing" | "ready" | "analyzing" | "error";

export interface StockfishConfig {
  skillLevel?: number;
  depth?: number;
  multiPV?: number;
}

export interface AnalysisInfo {
  evaluation: Evaluation | null;
  normalizedEvaluation: number;
  bestLine: PrincipalVariation | null;
  principalVariations: PrincipalVariation[];
  depth: number;
  status: EngineStatus;
  isEngineThinking: boolean;
  hasResults: boolean;
  error: Error | null;
}

/**
 * Internal state of the Stockfish engine.
 * This is the same type returned by getSnapshot() for useSyncExternalStore.
 */
export interface AnalysisState {
  fen: string;
  config: StockfishConfig;
  evaluation: Evaluation | null;
  normalizedEvaluation: number;
  bestLine: PrincipalVariation | null;
  principalVariations: PrincipalVariation[];
  depth: number;
  status: EngineStatus;
  isEngineThinking: boolean;
  hasResults: boolean;
  error: Error | null;
}

export interface AnalysisMethods {
  startAnalysis: () => void;
  stopAnalysis: () => void;
  getBestMove: () => PVMove | null;
  setConfig: (config: Partial<StockfishConfig>) => void;
}

export interface WorkerOptions {
  workerPath: string;
  throttleMs?: number;
  timeout?: number;
  onError?: (error: Error) => void;
}
