import { defaultGameTheme } from "@react-chess-tools/react-chess-game";
import type { ChessPuzzleTheme } from "./types";

/**
 * Default theme for ChessPuzzle component.
 * Extends the default game theme with puzzle-specific colors.
 * These values match the original hardcoded colors for backward compatibility.
 */
export const defaultPuzzleTheme: ChessPuzzleTheme = {
  ...defaultGameTheme,
  puzzle: {
    success: "rgba(172, 206, 89, 0.5)",
    failure: "rgba(201, 52, 48, 0.5)",
    hint: "rgba(27, 172, 166, 0.5)",
  },
};
