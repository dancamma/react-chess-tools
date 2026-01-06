import { merge } from "lodash";
import type { ChessPuzzleTheme, PartialChessPuzzleTheme } from "./types";
import { defaultPuzzleTheme } from "./defaults";

/**
 * Deep merges a partial puzzle theme with the default puzzle theme.
 * Allows users to override only specific theme properties while keeping defaults for the rest.
 *
 * @param partialTheme - Partial theme with only the properties to override
 * @returns Complete puzzle theme with overridden properties merged with defaults
 *
 * @example
 * ```typescript
 * const customTheme = mergePuzzleTheme({
 *   puzzle: { hint: "rgba(0, 255, 255, 0.5)" }
 * });
 * // Returns full puzzle theme with only hint color changed
 * ```
 */
export const mergePuzzleTheme = (
  partialTheme?: PartialChessPuzzleTheme,
): ChessPuzzleTheme => {
  if (!partialTheme) {
    return { ...defaultPuzzleTheme };
  }

  return merge({}, defaultPuzzleTheme, partialTheme);
};
