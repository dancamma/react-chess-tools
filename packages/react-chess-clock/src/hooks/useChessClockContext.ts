import { createContext, useContext } from "react";
import type { UseChessClockReturn } from "../types";

/**
 * Context for chess clock state
 * Provided by ChessClock.Root and consumed by child components
 */
export const ChessClockContext = createContext<UseChessClockReturn | null>(
  null,
);

/**
 * Hook to access chess clock context from child components
 * Must be used within a ChessClock.Root provider
 *
 * @throws Error if used outside of ChessClock.Root
 * @returns Chess clock state and methods
 */
export function useChessClockContext(): UseChessClockReturn {
  const context = useContext(ChessClockContext);

  if (!context) {
    throw new Error(
      "useChessClockContext must be used within a ChessClock.Root component. " +
        "Make sure your component is wrapped with <ChessClock.Root>.",
    );
  }

  return context;
}

/**
 * Type alias for the context value type
 */
export type ChessClockContextType = UseChessClockReturn;
