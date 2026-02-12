/**
 * React Context for Stockfish analysis state and methods.
 *
 * This context is provided by ChessStockfish.Root and consumed by useStockfish.
 * It contains the current FEN being analyzed, analysis info, and control methods.
 *
 * @module useStockfishContext
 */

import { createContext } from "react";
import type { AnalysisInfo, AnalysisMethods } from "../types";

/**
 * Value provided by StockfishContext to consumers.
 *
 * @property fen - The current FEN string being analyzed
 * @property info - Current analysis information (evaluation, PV lines, depth, etc.)
 * @property methods - Control methods for the Stockfish engine
 */
export interface StockfishContextValue {
  fen: string;
  info: AnalysisInfo;
  methods: AnalysisMethods;
}

/**
 * React Context for Stockfish engine state and methods.
 *
 * This context is created with a default value of null to allow
 * useStockfish to detect when it's used outside the provider
 * and throw a descriptive error.
 *
 * @example
 * ```tsx
 * // In ChessStockfish.Root
 * <StockfishContext.Provider value={{ fen, info, methods }}>
 *   {children}
 * </StockfishContext.Provider>
 *
 * // In child components
 * const { fen, info, methods } = useStockfish();
 * ```
 */
export const StockfishContext = createContext<StockfishContextValue | null>(
  null,
);
