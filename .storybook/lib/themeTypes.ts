import { ChessTheme } from "../../packages/react-chess-game/src/theme";

/**
 * Draft theme interface for theme playground
 * Allows partial modifications to theme properties
 */
export interface ThemeDraft {
  colors?: Omit<Partial<ChessTheme["colors"]>, "highlight"> & {
    highlight?: Partial<NonNullable<ChessTheme["colors"]>["highlight"]>;
  };
  notation?: Partial<NonNullable<ChessTheme["notation"]>>;
  pieces?: {
    light?: Partial<NonNullable<ChessTheme["pieces"]>["light"]>;
    dark?: Partial<NonNullable<ChessTheme["pieces"]>["dark"]>;
    specific?: Partial<NonNullable<ChessTheme["pieces"]>["specific"]>;
  };
}

/**
 * Theme playground tab types
 */
export type ThemePlaygroundTab = "board" | "highlights" | "pieces" | "advanced";

/**
 * Modern design system colors for theme playground UI
 */
export interface PlaygroundColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  shadow: string;
}

/**
 * Type-safe theme builder utility
 * Ensures all required properties are present while maintaining type safety
 */
export interface ThemeBuilder {
  colors?: ChessTheme["colors"];
  notation?: ChessTheme["notation"];
  pieces?: ChessTheme["pieces"];
}

/**
 * Type-safe builder for theme colors
 * Ensures all required highlight properties are present
 */
export const buildThemeColors = (
  baseColors: ChessTheme["colors"],
  draftColors?: ThemeDraft["colors"],
): ChessTheme["colors"] => {
  if (!draftColors) return baseColors;

  return {
    lightSquare: draftColors.lightSquare ?? baseColors.lightSquare,
    darkSquare: draftColors.darkSquare ?? baseColors.darkSquare,
    boardBorder: draftColors.boardBorder ?? baseColors.boardBorder,
    boardBackground: draftColors.boardBackground ?? baseColors.boardBackground,
    highlight: {
      lastMove:
        draftColors.highlight?.lastMove ?? baseColors.highlight.lastMove,
      check: draftColors.highlight?.check ?? baseColors.highlight.check,
      validMove:
        draftColors.highlight?.validMove ?? baseColors.highlight.validMove,
      validCapture:
        draftColors.highlight?.validCapture ??
        baseColors.highlight.validCapture,
    },
  };
};

/**
 * Type-safe builder for theme pieces
 * Ensures proper typing without type assertions
 */
export const buildThemePieces = (
  basePieces: ChessTheme["pieces"],
  partialPieces?: ThemeDraft["pieces"],
): ChessTheme["pieces"] => {
  if (!partialPieces) return basePieces;

  const buildPieceStyle = (
    base: Record<string, unknown> | undefined,
    partial: Record<string, unknown> | undefined,
  ) => {
    if (!partial) return base;
    return {
      fill: partial.fill ?? base?.fill,
      stroke: partial.stroke ?? base?.stroke,
      background: partial.background ?? base?.background,
    };
  };

  return {
    light: partialPieces.light
      ? buildPieceStyle(basePieces?.light, partialPieces.light)
      : basePieces?.light,
    dark: partialPieces.dark
      ? buildPieceStyle(basePieces?.dark, partialPieces.dark)
      : basePieces?.dark,
    specific: partialPieces.specific
      ? { ...basePieces?.specific, ...partialPieces.specific }
      : basePieces?.specific,
  };
};
