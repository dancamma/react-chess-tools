import { type Chess, type Square } from "chess.js";
import { type CSSProperties } from "react";
import { merge } from "lodash";
import type { ChessboardOptions } from "react-chessboard";
import { getDestinationSquares, type GameInfo } from "./chess";
import type { ChessGameTheme } from "../theme/types";
import { defaultGameTheme } from "../theme/defaults";

/**
 * Generates custom square styles based on game state and theme.
 *
 * @param game - Chess.js game instance
 * @param info - Game info containing lastMove, isCheck, turn
 * @param activeSquare - Currently selected square (if any)
 * @param theme - Theme configuration (defaults to defaultGameTheme)
 * @returns Record of square names to CSS properties
 */
export const getCustomSquareStyles = (
  game: Chess,
  info: GameInfo,
  activeSquare: Square | null,
  theme: ChessGameTheme = defaultGameTheme,
) => {
  const customSquareStyles: Record<string, CSSProperties> = {};

  const { lastMove, isCheck, turn } = info;

  if (lastMove) {
    customSquareStyles[lastMove.from] = {
      backgroundColor: theme.state.lastMove,
    };
    customSquareStyles[lastMove.to] = {
      backgroundColor: theme.state.lastMove,
    };
  }

  if (activeSquare) {
    customSquareStyles[activeSquare] = {
      backgroundColor: theme.state.activeSquare,
    };
  }

  if (activeSquare) {
    const destinationSquares = getDestinationSquares(game, activeSquare);
    destinationSquares.forEach((square) => {
      customSquareStyles[square] = {
        background:
          game.get(square) && game.get(square)?.color !== turn
            ? `radial-gradient(circle, ${theme.indicators.capture} 85%, transparent 85%)`
            : `radial-gradient(circle, ${theme.indicators.move} 25%, transparent 25%)`,
      };
    });
  }

  if (isCheck) {
    game.board().forEach((row) => {
      return row.forEach((square) => {
        if (square?.type === "k" && square?.color === info.turn) {
          customSquareStyles[square.square] = {
            backgroundColor: theme.state.check,
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
