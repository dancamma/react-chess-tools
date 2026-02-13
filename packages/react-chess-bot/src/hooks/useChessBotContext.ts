/**
 * React Context for ChessBot state.
 *
 * This context is provided by ChessBot.Root and consumed by useChessBotContext.
 * It contains the bot's playAs color, thinking state, last move, and errors.
 *
 * @module useChessBotContext
 */

import { createContext, useContext } from "react";
import type { ChessBotContextValue } from "../types";

/**
 * React Context for ChessBot state.
 *
 * This context is created with a default value of null to allow
 * useChessBotContext to detect when it's used outside the provider
 * and throw a descriptive error.
 */
export const ChessBotContext = createContext<ChessBotContextValue | null>(null);

/**
 * Access ChessBot state from a parent ChessBot.Root provider.
 *
 * This hook provides access to:
 * - `playAs` - The color the bot plays as ("white" or "black")
 * - `isThinking` - Whether the bot is currently thinking
 * - `lastMove` - The last move the bot made
 * - `error` - Any error that occurred
 *
 * @throws {Error} If used outside of a ChessBot.Root provider
 *
 * @example
 * ```tsx
 * function BotStatus() {
 *   const { playAs, isThinking, lastMove, error } = useChessBotContext();
 *
 *   return (
 *     <div>
 *       <p>Bot plays: {playAs}</p>
 *       <p>Thinking: {isThinking ? 'Yes' : 'No'}</p>
 *       {lastMove && <p>Last move: {lastMove.san}</p>}
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns The ChessBot context value
 */
export function useChessBotContext(): ChessBotContextValue {
  const context = useContext(ChessBotContext);

  if (!context) {
    throw new Error(
      "useChessBotContext must be used within a ChessBot.Root provider. " +
        "Make sure your component is wrapped with <ChessBot.Root>.",
    );
  }

  return context;
}

export type { ChessBotContextValue };
