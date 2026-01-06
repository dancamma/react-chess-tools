import { merge } from "lodash";
import type { ChessGameTheme, PartialChessGameTheme } from "./types";
import { defaultGameTheme } from "./defaults";

/**
 * Deep merges a partial theme with the default theme.
 * Allows users to override only specific theme properties while keeping defaults for the rest.
 *
 * @param partialTheme - Partial theme with only the properties to override
 * @returns Complete theme with overridden properties merged with defaults
 *
 * @example
 * ```typescript
 * const customTheme = mergeTheme({
 *   state: { lastMove: "rgba(100, 200, 100, 0.6)" }
 * });
 * // Returns full theme with only lastMove color changed
 * ```
 */
export const mergeTheme = (
  partialTheme?: PartialChessGameTheme,
): ChessGameTheme => {
  if (!partialTheme) {
    return { ...defaultGameTheme };
  }

  return merge({}, defaultGameTheme, partialTheme);
};

/**
 * Deep merges a partial theme with a base theme.
 * Useful when extending an existing theme.
 *
 * @param baseTheme - The base theme to extend
 * @param partialTheme - Partial theme with properties to override
 * @returns Complete theme with overridden properties
 */
export const mergeThemeWith = (
  baseTheme: ChessGameTheme,
  partialTheme?: PartialChessGameTheme,
): ChessGameTheme => {
  if (!partialTheme) {
    return { ...baseTheme };
  }

  return merge({}, baseTheme, partialTheme);
};
