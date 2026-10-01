import React from "react";
import { Puzzle, Hint, getOrientation } from "../../../utils";
import {
  ChessPuzzleContextType,
  useChessPuzzle,
} from "../../../hooks/useChessPuzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { ChessPuzzleContext } from "../../../hooks/useChessPuzzleContext";
import { PuzzleThemeProvider } from "../../../theme/context";
import { mergePuzzleTheme } from "../../../theme/utils";
import type { PartialChessPuzzleTheme } from "../../../theme/types";

export interface RootProps {
  puzzle: Puzzle;
  disabled?: boolean;
  onHint?: (hint: Exclude<Hint, "none">) => void;
  onSolve?: (puzzleContext: ChessPuzzleContextType) => void;
  onFail?: (puzzleContext: ChessPuzzleContextType) => void;
  /** Optional theme configuration. Supports partial themes - only override the colors you need. */
  theme?: PartialChessPuzzleTheme;
  /** When true, any checkmate move solves the puzzle (not just the canonical solution). Defaults to true. */
  solveOnCheckmate?: boolean;
}

interface PuzzleRootInnerProps {
  puzzle: Puzzle;
  disabled?: boolean;
  onHint?: (hint: Exclude<Hint, "none">) => void;
  onSolve?: (puzzleContext: ChessPuzzleContextType) => void;
  onFail?: (puzzleContext: ChessPuzzleContextType) => void;
  solveOnCheckmate: boolean;
  children: React.ReactNode;
}

const PuzzleRootInner: React.FC<PuzzleRootInnerProps> = ({
  puzzle,
  disabled = false,
  onHint,
  onSolve,
  onFail,
  solveOnCheckmate,
  children,
}) => {
  const context = useChessPuzzle(
    puzzle,
    onSolve,
    onFail,
    solveOnCheckmate,
    disabled,
    onHint,
  );

  return (
    <ChessPuzzleContext.Provider value={context}>
      {children}
    </ChessPuzzleContext.Provider>
  );
};

export const Root: React.FC<React.PropsWithChildren<RootProps>> = ({
  puzzle,
  disabled = false,
  onHint,
  onSolve,
  onFail,
  theme,
  solveOnCheckmate = true,
  children,
}) => {
  // Merge partial theme with defaults
  const mergedTheme = React.useMemo(() => mergePuzzleTheme(theme), [theme]);

  return (
    <ChessGame.Root
      disabled={disabled}
      fen={puzzle.fen}
      orientation={getOrientation(puzzle)}
      theme={mergedTheme}
    >
      <PuzzleThemeProvider theme={mergedTheme}>
        <PuzzleRootInner
          puzzle={puzzle}
          disabled={disabled}
          onHint={onHint}
          onSolve={onSolve}
          onFail={onFail}
          solveOnCheckmate={solveOnCheckmate}
        >
          {children}
        </PuzzleRootInner>
      </PuzzleThemeProvider>
    </ChessGame.Root>
  );
};

Root.displayName = "ChessPuzzle.Root";
