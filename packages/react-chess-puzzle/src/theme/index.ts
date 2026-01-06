// Types
export type {
  ChessPuzzleTheme,
  PuzzleStateTheme,
  PartialChessPuzzleTheme,
} from "./types";

// Default theme
export { defaultPuzzleTheme } from "./defaults";

// Utilities
export { mergePuzzleTheme } from "./utils";

// Context and hook
export {
  ChessPuzzleThemeContext,
  useChessPuzzleTheme,
  PuzzleThemeProvider,
} from "./context";
export type { PuzzleThemeProviderProps } from "./context";
