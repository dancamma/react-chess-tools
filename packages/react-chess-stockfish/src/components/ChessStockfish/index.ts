/**
 * ChessStockfish compound component.
 *
 * Unstyled components for Stockfish chess engine integration.
 * Provides a Root provider that manages the worker, and child components
 * that consume the context to display analysis results.
 *
 * @example
 * ```tsx
 * import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";
 *
 * <ChessStockfish.Root fen={fen} workerOptions={{ workerPath: "/stockfish.js" }}>
 *   <ChessStockfish.EvaluationBar />
 *   <ChessStockfish.EngineLines />
 * </ChessStockfish.Root>
 * ```
 */

import { Root } from "./parts/index";
import { EvaluationBar } from "./parts/index";
import { EngineLines } from "./parts/index";

export const ChessStockfish = {
  Root,
  EvaluationBar,
  EngineLines,
};

export type { RootProps } from "./parts/Root";
export type { EvaluationBarProps } from "./parts/EvaluationBar";
export type { EngineLinesProps } from "./parts/EngineLines";
