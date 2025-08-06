import React from "react";
import { Puzzle, getOrientation } from "../../../utils";
import {
  ChessPuzzleContextType,
  useChessPuzzle,
} from "../../../hooks/useChessPuzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { ChessPuzzleContext } from "../../../hooks/useChessPuzzleContext";

export interface RootProps {
  puzzle: Puzzle;
  onSolve?: (puzzleContext: ChessPuzzleContextType) => void;
  onFail?: (puzzleContext: ChessPuzzleContextType) => void;
  animationDuration?: number;
  computerMoveDelay?: number;
}

const PuzzleRoot: React.FC<React.PropsWithChildren<RootProps>> = ({
  puzzle,
  onSolve,
  onFail,
  computerMoveDelay,
  children,
}) => {
  const context = useChessPuzzle(puzzle, onSolve, onFail, computerMoveDelay);

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
  animationDuration,
  computerMoveDelay,
  children,
}) => {
  return (
    <ChessGame.Root
      fen={puzzle.fen}
      orientation={getOrientation(puzzle)}
      animationDuration={animationDuration}
    >
      <PuzzleRoot
        puzzle={puzzle}
        onSolve={onSolve}
        onFail={onFail}
        computerMoveDelay={computerMoveDelay}
      >
        {children}
      </PuzzleRoot>
    </ChessGame.Root>
  );
};
