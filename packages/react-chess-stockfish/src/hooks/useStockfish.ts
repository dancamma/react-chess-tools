/**
 * Public hook for accessing Stockfish analysis state and methods.
 *
 * This hook must be used within a ChessStockfish.Root provider.
 * It throws a descriptive error if used outside the provider context.
 *
 */

import { useContext } from "react";
import { StockfishContext } from "./useStockfishContext";
import type { StockfishContextValue } from "./useStockfishContext";

/**
 * Access Stockfish analysis state and methods from a parent ChessStockfish.Root provider.
 *
 * This hook provides access to:
 * - `fen` - The current FEN string being analyzed
 * - `info` - Analysis information (evaluation, PV lines, depth, status, errors)
 * - `methods` - Control methods (startAnalysis, stopAnalysis, getBestMove, setConfig)
 *
 * The methods are stable references — components using only methods won't re-render
 * when analysis info changes.
 *
 * @throws {Error} If used outside of a ChessStockfish.Root provider
 *
 * @example
 * ```tsx
 * function AnalysisDisplay() {
 *   const { fen, info, methods } = useStockfish();
 *
 *   return (
 *     <div>
 *       <p>FEN: {fen}</p>
 *       <p>Evaluation: {info.evaluation?.type === 'cp' ? info.evaluation.value / 100 : 'Mate'}</p>
 *       <p>Depth: {info.depth}</p>
 *       <button onClick={methods.stopAnalysis}>Stop</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using only methods (won't re-render on analysis updates)
 * function ControlButtons() {
 *   const { methods } = useStockfish();
 *   return (
 *     <>
 *       <button onClick={methods.startAnalysis}>Start</button>
 *       <button onClick={methods.stopAnalysis}>Stop</button>
 *     </>
 *   );
 * }
 * ```
 *
 * @returns The Stockfish context value containing fen, info, and methods
 */
export function useStockfish(): StockfishContextValue {
  const context = useContext(StockfishContext);

  if (!context) {
    throw new Error(
      "useStockfish must be used within a ChessStockfish.Root provider. " +
        "Wrap your component in <ChessStockfish.Root> to use this hook.",
    );
  }

  return context;
}
