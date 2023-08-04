import React from "react";
import { Puzzle, getOrientation } from "../../../utils";
import { useChessPuzzle } from "../../../hooks/useChessPuzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { ChessPuzzleContext } from "../../../hooks/useChessPuzzleContext";

export interface RootProps {
  puzzle: Puzzle;
  onSolve?: (changePuzzle: (puzzle: Puzzle) => void) => void;
  onFail?: (changePuzzle: (puzzle: Puzzle) => void) => void;
}

const PuzzleRoot: React.FC<React.PropsWithChildren<RootProps>> = ({
  puzzle,
  onSolve,
  onFail,
  children,
}) => {
  const context = useChessPuzzle(puzzle, onSolve, onFail);

  return (
    <ChessPuzzleContext.Provider value={context}>
      {children}
    </ChessPuzzleContext.Provider>
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
