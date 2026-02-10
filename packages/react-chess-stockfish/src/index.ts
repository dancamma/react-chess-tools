// Placeholder - will be implemented in Task 11
// Re-export utilities for now to allow build
export {
  InvalidFenError,
  formatEvaluation,
  normalizeEvaluation,
} from "./utils/evaluation";
export { validateWorkerPath, DEFAULT_WORKER_PATH } from "./utils/workerPath";
export { validateFen, uciToSan, uciToPvMoves } from "./utils/uci";

export type {
  Evaluation,
  PVMove,
  PrincipalVariation,
  EngineStatus,
  StockfishConfig,
  AnalysisInfo,
  AnalysisMethods,
  WorkerOptions,
} from "./types";
