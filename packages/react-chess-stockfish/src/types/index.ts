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

export interface AnalysisMethods {
  startAnalysis: () => void;
  stopAnalysis: () => void;
  getBestMove: () => PVMove | null;
  setConfig: (config: Partial<StockfishConfig>) => void;
}

export const DEFAULT_WORKER_PATH =
  "https://unpkg.com/stockfish@17.1.0/src/stockfish-17.1-lite-single-03e3232.js";

export interface WorkerOptions {
  workerPath: string;
  throttleMs?: number;
  timeout?: number;
  onError?: (error: Error) => void;
}
