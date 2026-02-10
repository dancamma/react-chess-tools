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

export { Root } from "./parts/index";
export type { RootProps } from "./parts/Root";
