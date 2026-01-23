import { type Color, Chess, Move } from "chess.js";
import React, { CSSProperties, ReactElement, ReactNode } from "react";
import _ from "lodash";
import type { ChessPuzzleTheme } from "../theme/types";
import { defaultPuzzleTheme } from "../theme/defaults";

export type Status = "not-started" | "in-progress" | "solved" | "failed";

export type Hint = "none" | "piece" | "move";

export type Puzzle = {
  fen: string;
  moves: string[];
  // if the first move of the puzzle has to be made by the cpu, as in chess.com puzzles
  makeFirstMove?: boolean;
};

export const getOrientation = (puzzle: Puzzle): Color => {
  const fen = puzzle.fen;
  const game = new Chess(fen);
  if (puzzle.makeFirstMove) {
    game.move(puzzle.moves[0]);
  }
  return game.turn();
};

/**
 * Generates custom square styles for puzzle states based on theme.
 *
 * @param status - Current puzzle status
 * @param hint - Current hint level
 * @param isPlayerTurn - Whether it's the player's turn
 * @param game - Chess.js game instance
 * @param nextMove - The next expected move (for hints)
 * @param theme - Theme configuration (defaults to defaultPuzzleTheme)
 * @returns Record of square names to CSS properties
 */
export const getCustomSquareStyles = (
  status: Status,
  hint: Hint,
  isPlayerTurn: boolean,
  game: Chess,
  nextMove?: Move | null,
  theme: ChessPuzzleTheme = defaultPuzzleTheme,
) => {
  const customSquareStyles: Record<string, CSSProperties> = {};

  const lastMove = _.last(game.history({ verbose: true }));

  if (status === "failed" && lastMove) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: theme.puzzle.failure,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: theme.puzzle.failure,
    };
  }

  if (
    lastMove &&
    (status === "solved" || (status !== "failed" && !isPlayerTurn))
  ) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: theme.puzzle.success,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: theme.puzzle.success,
    };
  }

  if (hint === "piece") {
    if (nextMove) {
      customSquareStyles[nextMove.from] = {
        backgroundColor: theme.puzzle.hint,
      };
    }
  }

  if (hint === "move") {
    if (nextMove) {
      customSquareStyles[nextMove.from] = {
        backgroundColor: theme.puzzle.hint,
      };
      customSquareStyles[nextMove.to] = {
        backgroundColor: theme.puzzle.hint,
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
