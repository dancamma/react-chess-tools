import React from "react";
import { Color } from "chess.js";
import { useChessGame } from "../../../hooks/useChessGame";
import { ChessGameContext } from "../../../hooks/useChessGameContext";
import { ThemeProvider } from "../../../theme/context";
import { mergeTheme } from "../../../theme/utils";
import type { PartialChessGameTheme } from "../../../theme/types";
import type { TimeControlConfig } from "@react-chess-tools/react-chess-clock";

export interface RootProps {
  fen?: string;
  orientation?: Color;
  /** Optional theme configuration. Supports partial themes - only override the colors you need. */
  theme?: PartialChessGameTheme;
  /** Optional clock configuration to enable chess clock functionality */
  timeControl?: TimeControlConfig;
}

export const Root: React.FC<React.PropsWithChildren<RootProps>> = ({
  fen,
  orientation,
  theme,
  timeControl,
  children,
}) => {
  const context = useChessGame({ fen, orientation, timeControl });

  // Merge partial theme with defaults
  const mergedTheme = React.useMemo(() => mergeTheme(theme), [theme]);

  return (
    <ChessGameContext.Provider value={context}>
      <ThemeProvider theme={mergedTheme}>{children}</ThemeProvider>
    </ChessGameContext.Provider>
  );
};

Root.displayName = "ChessGame.Root";
