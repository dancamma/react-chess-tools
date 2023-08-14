import { type Color, Chess, Move } from "chess.js";
import React, { CSSProperties, ReactElement, ReactNode } from "react";
import _ from "lodash";

export type Status = "not-started" | "in-progress" | "solved" | "failed";

export type Hint = "none" | "piece" | "move";

export type Puzzle = {
  fen: string;
  moves: string[];
  // if the first move of the puzzle has to be made by the cpu, as in chess.com puzzles
  makeFirstMove?: boolean;
};

const FAIL_COLOR = "rgba(201, 52, 48, 0.5)";
const SUCCESS_COLOR = "rgba(172, 206, 89, 0.5)";
const HINT_COLOR = "rgba(27, 172, 166, 0.5)";

export const getOrientation = (puzzle: Puzzle): Color => {
  const fen = puzzle.fen;
  const game = new Chess(fen);
  if (puzzle.makeFirstMove) {
    game.move(puzzle.moves[0]);
  }
  return game.turn();
};

interface ClickableElement extends ReactElement {
  props: {
    onClick?: () => void;
  };
}

export const isClickableElement = (
  element: ReactNode,
): element is ClickableElement => React.isValidElement(element);

export const getCustomSquareStyles = (
  status: Status,
  hint: Hint,
  isPlayerTurn: boolean,
  game: Chess,
  nextMove?: Move | null,
) => {
  const customSquareStyles: Record<string, CSSProperties> = {};

  const lastMove = _.last(game.history({ verbose: true }));

  if (status === "failed" && lastMove) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: FAIL_COLOR,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: FAIL_COLOR,
    };
  }

  if (
    lastMove &&
    (status === "solved" || (status !== "failed" && !isPlayerTurn))
  ) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: SUCCESS_COLOR,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: SUCCESS_COLOR,
    };
  }

  if (hint === "piece") {
    if (nextMove) {
      customSquareStyles[nextMove.from] = {
        backgroundColor: HINT_COLOR,
      };
    }
  }

  if (hint === "move") {
    if (nextMove) {
      customSquareStyles[nextMove.from] = {
        backgroundColor: HINT_COLOR,
      };
      customSquareStyles[nextMove.to] = {
        backgroundColor: HINT_COLOR,
      };
    }
  }

  return customSquareStyles;
};

export const stringToMove = (game: Chess, move: string | null | undefined) => {
  const copy = new Chess(game.fen());
  if (move === null || move === undefined) {
    return null;
  }
  try {
    return copy.move(move);
  } catch (e) {
    return null;
  }
};
