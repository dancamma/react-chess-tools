import React, { createContext, useContext } from "react";
import type { ChessPuzzleTheme } from "./types";
import { defaultPuzzleTheme } from "./defaults";

/**
 * Context for ChessPuzzle theme
 */
export const ChessPuzzleThemeContext =
  createContext<ChessPuzzleTheme>(defaultPuzzleTheme);

/**
 * Hook to access the current ChessPuzzle theme.
 * Returns the default puzzle theme if no ThemeProvider is present.
 */
export const useChessPuzzleTheme = (): ChessPuzzleTheme => {
  return useContext(ChessPuzzleThemeContext);
};

export interface PuzzleThemeProviderProps {
  theme: ChessPuzzleTheme;
  children: React.ReactNode;
}

/**
 * Internal provider component used by Puzzle Root when a theme prop is provided.
 */
export const PuzzleThemeProvider: React.FC<PuzzleThemeProviderProps> = ({
  theme,
  children,
}) => {
  return (
    <ChessPuzzleThemeContext.Provider value={theme}>
      {children}
    </ChessPuzzleThemeContext.Provider>
  );
};
