import { createContext, useContext } from "react";
import type { ChessBotContextValue } from "../types";

export const ChessBotContext = createContext<ChessBotContextValue | null>(null);

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
