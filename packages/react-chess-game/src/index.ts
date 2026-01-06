// Components
export { ChessGame } from "./components/ChessGame";

// Hooks & Context
export { useChessGameContext } from "./hooks/useChessGameContext";
export { useChessGame } from "./hooks/useChessGame";
export type { ChessGameContextType } from "./hooks/useChessGameContext";
export type { useChessGameProps } from "./hooks/useChessGame";

// Audio Types
export type { Sound, Sounds } from "./assets/sounds";
export type { SoundsProps } from "./components/ChessGame/parts/Sounds";

// Keyboard Types
export type { KeyboardControls } from "./components/ChessGame/parts/KeyboardControls";

// Utility Types
export type { GameInfo } from "./utils/chess";
export { deepMergeChessboardOptions } from "./utils/board";

// Component Props
export type { ChessGameProps } from "./components/ChessGame/parts/Board";
export type { RootProps } from "./components/ChessGame/parts/Root";

// Theme - Types
export type {
  ChessGameTheme,
  BoardTheme,
  StateTheme,
  IndicatorTheme,
  PartialChessGameTheme,
  DeepPartial,
} from "./theme/types";

// Theme - Values
export { defaultGameTheme } from "./theme/defaults";
export { lichessTheme, chessComTheme } from "./theme/presets";
export { themes } from "./theme";

// Theme - Utilities
export { mergeTheme, mergeThemeWith } from "./theme/utils";
export { useChessGameTheme, ChessGameThemeContext } from "./theme/context";
