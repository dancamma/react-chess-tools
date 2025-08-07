import React from "react";
import { useChessPuzzle } from "./useChessPuzzle";

export const ChessPuzzleContext = React.createContext<ReturnType<
  typeof useChessPuzzle
> | null>(null);

export const useChessPuzzleContext = () => {
  const context = React.useContext(ChessPuzzleContext);
  if (!context) {
    throw new Error(
      `useChessPuzzleContext must be used within a ChessPuzzle component. Make sure your component is wrapped with <ChessPuzzle.Root> or ensure the ChessPuzzle component is properly rendered in the component tree.`,
    );
  }
  return context;
};
