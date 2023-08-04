import React from "react";
import { Puzzle, getOrientation } from "../../../utils";
import { usePuzzle } from "../../../hooks/usePuzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";

export interface RootProps {
  puzzle: Puzzle;
  onSolve?: (changePuzzle: (puzzle: Puzzle) => void) => void;
  onFail?: (changePuzzle: (puzzle: Puzzle) => void) => void;
}

export const PuzzleContext = React.createContext<ReturnType<
  typeof usePuzzle
> | null>(null);

const PuzzleRoot: React.FC<React.PropsWithChildren<RootProps>> = ({
  puzzle,
  onSolve,
  onFail,
  children,
}) => {
  const context = usePuzzle(puzzle, onSolve, onFail);

  return (
    <PuzzleContext.Provider value={context}>{children}</PuzzleContext.Provider>
  );
};

export const Root: React.FC<React.PropsWithChildren<RootProps>> = ({
  puzzle,
  onSolve,
  onFail,
  children,
}) => {
  return (
    <ChessGame.Root fen={puzzle.fen} orientation={getOrientation(puzzle)}>
      <PuzzleRoot puzzle={puzzle} onSolve={onSolve} onFail={onFail}>
        {children}
      </PuzzleRoot>
    </ChessGame.Root>
  );
};
