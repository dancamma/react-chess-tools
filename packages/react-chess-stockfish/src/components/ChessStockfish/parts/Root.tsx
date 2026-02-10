"use client";

/**
 * ChessStockfish.Root - Provider component for Stockfish analysis.
 *
 * This component creates a Stockfish worker and provides context to children.
 * It manages the engine lifecycle and auto-starts analysis when the FEN changes.
 *
 * @example
 * ```tsx
 * <ChessStockfish.Root
 *   fen={fen}
 *   config={{ multiPV: 3, skillLevel: 20 }}
 *   workerOptions={{ workerPath: "/stockfish/worker.js" }}
 * >
 *   <ChessStockfish.EvaluationBar />
 *   <ChessStockfish.EngineLines />
 * </ChessStockfish.Root>
 * ```
 */

import type { ReactNode } from "react";
import { useMemo } from "react";
// Import React for JSX compatibility (required for Jest/React Testing Library)
import React from "react";
import { StockfishContext } from "../../../hooks/useStockfishContext";
import { useStockfishAnalysis } from "../../../hooks/useStockfishAnalysis";
import type { StockfishConfig, WorkerOptions } from "../../../types";

/**
 * Props for the ChessStockfish.Root provider component.
 *
 * @property fen - Valid FEN string to analyze. Invalid FENs set error in context (recoverable).
 * @property config - Optional engine configuration (skillLevel, depth, multiPV). Hoist or memoize to avoid unnecessary restarts.
 * @property workerOptions - Worker options including path to Stockfish worker JS file.
 * @property children - React components that consume Stockfish context.
 */
interface RootProps {
  /** FEN string to analyze. Validated with chess.js; invalid FEN sets error in context (recoverable). */
  fen: string;
  /** Optional engine configuration. Hoist or memoize to avoid unnecessary restarts. */
  config?: StockfishConfig;
  /** Worker options including path to Stockfish worker and optional callbacks. */
  workerOptions: WorkerOptions;
  /** React components that consume Stockfish context. */
  children: ReactNode;
}

/**
 * Root provider component for ChessStockfish compound component.
 *
 * Creates a Stockfish worker and provides analysis state and methods
 * to children via React Context.
 *
 * @param fen - Valid FEN string to analyze. Invalid FENs set error in context (recoverable).
 * @param config - Optional engine configuration (skillLevel, depth, multiPV). Hoist or memoize to avoid unnecessary restarts.
 * @param workerOptions - Worker options including path to Stockfish worker JS file.
 * @param children - React components that consume Stockfish context.
 */
export function Root({
  fen,
  config,
  workerOptions,
  children,
}: RootProps): ReactNode {
  const { info, methods } = useStockfishAnalysis({
    fen,
    config,
    workerOptions,
  });

  // Memoize context value to prevent unnecessary re-renders in children
  const context = useMemo(() => ({ fen, info, methods }), [fen, info, methods]);

  return (
    <StockfishContext.Provider value={context}>
      {children}
    </StockfishContext.Provider>
  );
}

Root.displayName = "ChessStockfish.Root";

export type { RootProps };
