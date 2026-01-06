import type {
  ChessGameTheme,
  DeepPartial,
} from "@react-chess-tools/react-chess-game";

/**
 * Puzzle-specific state colors (RGBA color strings)
 */
export interface PuzzleStateTheme {
  /** Background color for successful moves */
  success: string;
  /** Background color for failed moves */
  failure: string;
  /** Background color for hint squares */
  hint: string;
}

/**
 * Complete theme configuration for ChessPuzzle component.
 * Extends ChessGameTheme with puzzle-specific colors.
 */
export interface ChessPuzzleTheme extends ChessGameTheme {
  puzzle: PuzzleStateTheme;
}

/**
 * Partial theme for puzzle customization - allows overriding only specific properties
 */
export type PartialChessPuzzleTheme = DeepPartial<ChessPuzzleTheme>;
