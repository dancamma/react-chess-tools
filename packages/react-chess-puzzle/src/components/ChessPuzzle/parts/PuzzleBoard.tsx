import React, { useContext } from "react";
import {
  ChessGame,
  useChessGameContext,
} from "@react-chess-tools/react-chess-game";
import { PuzzleContext } from "./Root";
import { getCustomSquareStyles, stringToMove } from "../../../utils";

export interface PuzzleBoardProps
  extends React.ComponentProps<typeof ChessGame.Board> {}
export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ ...rest }) => {
  const puzzleContext = useContext(PuzzleContext);
  const gameContext = useChessGameContext();

  if (!puzzleContext) {
    throw new Error("PuzzleContext not found");
  }
  if (!gameContext) {
    throw new Error("ChessGameContext not found");
  }

  const { game } = gameContext;
  const { status, hint, isPlayerTurn, nextMove } = puzzleContext;

  return (
    <ChessGame.Board
      customSquareStyles={getCustomSquareStyles(
        status,
        hint,
        isPlayerTurn,
        game,
        stringToMove(game, nextMove),
      )}
      {...rest}
    />
  );
};
