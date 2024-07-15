import { type Chess, type Square } from "chess.js";
import { type CSSProperties } from "react";
import { getDestinationSquares, type GameInfo } from "./chess";

const LAST_MOVE_COLOR = "rgba(255, 255, 0, 0.5)";
const CHECK_COLOR = "rgba(255, 0, 0, 0.5)";

export const getCustomSquareStyles = (
  game: Chess,
  info: GameInfo,
  activeSquare: Square | null,
) => {
  const customSquareStyles: Record<string, CSSProperties> = {};

  const { lastMove, isCheck, turn } = info;

  if (lastMove) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: LAST_MOVE_COLOR,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: LAST_MOVE_COLOR,
    };
  }

  if (activeSquare) {
    customSquareStyles[activeSquare] = {
      backgroundColor: LAST_MOVE_COLOR,
    };
  }

  if (activeSquare) {
    const destinationSquares = getDestinationSquares(game, activeSquare);
    destinationSquares.forEach((square) => {
      customSquareStyles[square] = {
        background:
          game.get(square) && game.get(square).color !== turn
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
      };
    });
  }

  if (isCheck) {
    game.board().forEach((row) => {
      return row.forEach((square) => {
        if (square?.type === "k" && square?.color === info.turn) {
          customSquareStyles[square.square] = {
            backgroundColor: CHECK_COLOR,
          };
        }
      });
    });
  }
  return customSquareStyles;
};
