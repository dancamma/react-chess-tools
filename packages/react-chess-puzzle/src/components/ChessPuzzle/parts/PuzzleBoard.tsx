import React from "react";
import {
  ChessGame,
  deepMergeChessboardOptions,
  useChessGameContext,
} from "@react-chess-tools/react-chess-game";
import { getCustomSquareStyles, stringToMove } from "../../../utils";
import { useChessPuzzleContext } from "../../..";
import { useChessPuzzleTheme } from "../../../theme/context";

export interface PuzzleBoardProps extends React.ComponentProps<
  typeof ChessGame.Board
> {}

export const PuzzleBoard = React.forwardRef<HTMLDivElement, PuzzleBoardProps>(
  ({ options, ...rest }, ref) => {
    const puzzleContext = useChessPuzzleContext();
    const gameContext = useChessGameContext();
    const theme = useChessPuzzleTheme();

    if (!puzzleContext) {
      throw new Error("PuzzleContext not found");
    }
    if (!gameContext) {
      throw new Error("ChessGameContext not found");
    }

    const { game } = gameContext;
    const { status, hint, isPlayerTurn, nextMove } = puzzleContext;

    const mergedOptions = deepMergeChessboardOptions(options || {}, {
      squareStyles: getCustomSquareStyles(
        status,
        hint,
        isPlayerTurn,
        game,
        stringToMove(game, nextMove),
        theme,
      ),
    });

    return <ChessGame.Board ref={ref} {...rest} options={mergedOptions} />;
  },
);

PuzzleBoard.displayName = "ChessPuzzle.PuzzleBoard";
