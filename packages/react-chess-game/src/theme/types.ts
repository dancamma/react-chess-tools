import { CSSProperties } from "react";

/**
 * Board appearance configuration - colors for light and dark squares
 */
export interface BoardTheme {
  /** Style for light squares */
  lightSquare: CSSProperties;
  /** Style for dark squares */
  darkSquare: CSSProperties;
}

/**
 * Game state highlight colors (RGBA color strings)
 */
export interface StateTheme {
  /** Background color for last move from/to squares */
  lastMove: string;
  /** Background color for king when in check */
  check: string;
  /** Background color for currently selected piece's square */
  activeSquare: string;
  /** Full CSSProperties for valid drop target squares */
  dropSquare: CSSProperties;
}

/**
 * Move indicator styling - colors for move dots and capture rings
 */
export interface IndicatorTheme {
  /** Color for move dots on empty destination squares (used in radial-gradient) */
  move: string;
  /** Color for capture rings on capturable pieces (used in radial-gradient) */
  capture: string;
}

/**
 * Complete theme configuration for ChessGame component
 */
export interface ChessGameTheme {
  board: BoardTheme;
  state: StateTheme;
  indicators: IndicatorTheme;
}

/**
 * Utility type for creating partial versions of nested objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Partial theme for user customization - allows overriding only specific properties
 */
export type PartialChessGameTheme = DeepPartial<ChessGameTheme>;
