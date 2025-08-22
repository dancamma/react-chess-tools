import { type Chess, type Square } from "chess.js";
import { type CSSProperties } from "react";
import { merge } from "lodash";
import type { ChessboardOptions } from "react-chessboard";
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
          game.get(square) && game.get(square)?.color !== turn
            ? "radial-gradient(circle, rgba(1, 0, 0, 0.1) 85%, transparent 85%)"
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

/**
 * Smart deep merge for ChessboardOptions that handles different property types appropriately:
 * - Functions: Overwrite (custom functions replace base functions)
 * - Objects: Deep merge (nested objects merge recursively)
 * - Primitives: Overwrite (custom values replace base values)
 *
 * This ensures that computed options (like squareStyles with move highlighting) are preserved
 * while allowing custom options to extend or override them intelligently.
 *
 * @param baseOptions - The computed base options (e.g., computed squareStyles, event handlers)
 * @param customOptions - Custom options provided by the user
 * @returns Intelligently merged ChessboardOptions
 */
export const deepMergeChessboardOptions = (
  baseOptions: ChessboardOptions,
  customOptions?: Partial<ChessboardOptions>,
): ChessboardOptions => {
  if (!customOptions) {
    return { ...baseOptions }; // Return a new object even when no custom options
  }

  const result = merge({}, baseOptions, customOptions, {
    customizer: (_objValue: unknown, srcValue: unknown) => {
      // Functions should always overwrite (not merge)
      // This is important for event handlers like onSquareClick, onPieceDrop, etc.
      if (typeof srcValue === "function") {
        return srcValue;
      }

      // For arrays, we typically want to overwrite rather than merge
      // This avoids unexpected behavior with array concatenation
      if (Array.isArray(srcValue)) {
        return srcValue;
      }

      // Let lodash handle objects with default deep merge behavior
      // This will properly merge nested objects like squareStyles, dropSquareStyle, etc.
      return undefined; // Use default merge behavior
    },
  });

  // Clean up any unwanted properties that lodash might add
  delete (result as Record<string, unknown>).customizer;

  return result;
};
