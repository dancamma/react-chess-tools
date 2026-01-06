// Types
export type {
  ChessGameTheme,
  BoardTheme,
  StateTheme,
  IndicatorTheme,
  PartialChessGameTheme,
  DeepPartial,
} from "./types";

// Default theme
export { defaultGameTheme } from "./defaults";

// Preset themes
export { lichessTheme, chessComTheme } from "./presets";

// All themes as a single object
import { defaultGameTheme } from "./defaults";
import { lichessTheme, chessComTheme } from "./presets";

export const themes = {
  default: defaultGameTheme,
  lichess: lichessTheme,
  chessCom: chessComTheme,
} as const;

// Utilities
export { mergeTheme, mergeThemeWith } from "./utils";

// Context and hook
export {
  ChessGameThemeContext,
  useChessGameTheme,
  ThemeProvider,
} from "./context";
export type { ThemeProviderProps } from "./context";
