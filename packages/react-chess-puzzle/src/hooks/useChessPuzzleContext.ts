import React from "react";
import { useChessPuzzle } from "./useChessPuzzle";

export const ChessPuzzleContext = React.createContext<ReturnType<
  typeof useChessPuzzle
> | null>(null);

export const useChessPuzzleContext = () => {
  const context = React.useContext(ChessPuzzleContext);
  if (!context) {
    throw new Error(
      "useChessGameContext must be used within a ChessGameProvider",
    );
  }
  return context;
};
