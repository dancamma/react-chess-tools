import React from "react";
import { useChessGame } from "./useChessGame";

export const ChessGameContext = React.createContext<ReturnType<
  typeof useChessGame
> | null>(null);

export const useChessGameContext = () => {
  const context = React.useContext(ChessGameContext);
  if (!context) {
    throw new Error(
      "useChessGameContext must be used within a ChessGame component. " +
        "Make sure your component is wrapped with <ChessGame.Root> or ensure the ChessGame component is properly rendered in the component tree.",
    );
  }
  return context;
};

export type ChessGameContextType = ReturnType<typeof useChessGame>;
