import React from "react";
import { Color } from "chess.js";
import { useChessGame } from "../../../hooks/useChessGame";
import { ChessGameContext } from "../../../hooks/useChessGameContext";
import { ThemeProvider } from "../../../hooks/useTheme";
import { ChessTheme } from "../../../theme";

export interface RootProps {
  fen?: string;
  orientation?: Color;
  theme?: ChessTheme;
}

export const Root: React.FC<React.PropsWithChildren<RootProps>> = ({
  fen,
  orientation,
  theme,
  children,
}) => {
  const context = useChessGame({ fen, orientation });
  return (
    <ThemeProvider initialTheme={theme}>
      <ChessGameContext.Provider value={context}>
        {children}
      </ChessGameContext.Provider>
    </ThemeProvider>
  );
};
