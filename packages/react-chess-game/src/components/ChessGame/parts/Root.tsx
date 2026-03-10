import React from "react";
import { Color } from "chess.js";
import { useChessGame } from "../../../hooks/useChessGame";
import { ChessGameBoardContainerContext } from "../../../hooks/useChessGameBoardContainerContext";
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
  /** Auto-switch clock on move (default: true) */
  autoSwitchOnMove?: boolean;
}

export const Root: React.FC<React.PropsWithChildren<RootProps>> = ({
  fen,
  orientation,
  theme,
  timeControl,
  autoSwitchOnMove,
  children,
}) => {
  const context = useChessGame({
    fen,
    orientation,
    timeControl,
    autoSwitchOnMove,
  });
  const boardContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [boardContainerElement, setBoardContainerElement] =
    React.useState<HTMLDivElement | null>(null);

  // Merge partial theme with defaults
  const mergedTheme = React.useMemo(() => mergeTheme(theme), [theme]);
  const boardContainerContext = React.useMemo(
    () => ({
      boardContainerRef,
      boardContainerElement,
      setBoardContainerElement,
    }),
    [boardContainerElement],
  );

  return (
    <ChessGameContext.Provider value={context}>
      <ChessGameBoardContainerContext.Provider value={boardContainerContext}>
        <ThemeProvider theme={mergedTheme}>{children}</ThemeProvider>
      </ChessGameBoardContainerContext.Provider>
    </ChessGameContext.Provider>
  );
};

Root.displayName = "ChessGame.Root";
