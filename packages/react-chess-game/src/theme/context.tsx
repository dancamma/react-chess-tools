import React, { createContext, useContext } from "react";
import type { ChessGameTheme } from "./types";
import { defaultGameTheme } from "./defaults";

/**
 * Context for ChessGame theme
 */
export const ChessGameThemeContext =
  createContext<ChessGameTheme>(defaultGameTheme);

/**
 * Hook to access the current ChessGame theme.
 * Returns the default theme if no ThemeProvider is present.
 */
export const useChessGameTheme = (): ChessGameTheme => {
  return useContext(ChessGameThemeContext);
};

export interface ThemeProviderProps {
  theme: ChessGameTheme;
  children: React.ReactNode;
}

/**
 * Internal provider component used by Root when a theme prop is provided.
 * This is not exported directly - users pass theme via Root's theme prop.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme,
  children,
}) => {
  return (
    <ChessGameThemeContext.Provider value={theme}>
      {children}
    </ChessGameThemeContext.Provider>
  );
};
