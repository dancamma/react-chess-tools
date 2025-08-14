import React from "react";
import { ChessboardOptions, PieceRenderObject } from "react-chessboard";
import { defaultPieces } from "react-chessboard";

// Base theme interface
export interface ChessTheme {
  name: string;
  colors: {
    lightSquare: string;
    darkSquare: string;
    highlight: {
      lastMove: string;
      check: string;
      validMove: string;
      validCapture: string;
    };
    boardBorder?: string;
    boardBackground?: string;
  };
  pieces?: {
    light?: { fill: string; stroke?: string; background?: string };
    dark?: { fill: string; stroke?: string; background?: string };
    specific?: {
      wK?: { fill: string; stroke?: string; background?: string };
      wQ?: { fill: string; stroke?: string; background?: string };
      wR?: { fill: string; stroke?: string; background?: string };
      wB?: { fill: string; stroke?: string; background?: string };
      wN?: { fill: string; stroke?: string; background?: string };
      wP?: { fill: string; stroke?: string; background?: string };
      bK?: { fill: string; stroke?: string; background?: string };
      bQ?: { fill: string; stroke?: string; background?: string };
      bR?: { fill: string; stroke?: string; background?: string };
      bB?: { fill: string; stroke?: string; background?: string };
      bN?: { fill: string; stroke?: string; background?: string };
      bP?: { fill: string; stroke?: string; background?: string };
    };
  };
  notation?: {
    show: boolean;
    darkSquareColor: string;
    lightSquareColor: string;
  };
}

// Theme presets
export const themes: Record<string, ChessTheme> = {
  classic: {
    name: "Classic",
    colors: {
      lightSquare: "#f0d9b5",
      darkSquare: "#b58863",
      highlight: {
        lastMove: "rgba(255, 255, 0, 0.35)",
        check: "rgba(255, 0, 0, 0.45)",
        validMove: "rgba(0, 153, 255, 0.35)",
        validCapture: "rgba(255, 77, 77, 0.35)",
      },
      boardBackground: "#f7f5f2",
    },
    notation: {
      show: true,
      darkSquareColor: "#f0d9b5",
      lightSquareColor: "#5a4636",
    },
  },
  green: {
    name: "Green",
    colors: {
      lightSquare: "#eeeed2",
      darkSquare: "#769656",
      highlight: {
        lastMove: "rgba(255, 215, 0, 0.35)",
        check: "rgba(255, 0, 0, 0.45)",
        validMove: "rgba(0, 255, 170, 0.3)",
        validCapture: "rgba(255, 99, 132, 0.35)",
      },
      boardBackground: "#e8f1e6",
    },
    notation: {
      show: true,
      darkSquareColor: "#eeeed2",
      lightSquareColor: "#2b4d2b",
    },
  },
  blue: {
    name: "Blue",
    colors: {
      lightSquare: "#e8edf9",
      darkSquare: "#4a6fa5",
      highlight: {
        lastMove: "rgba(255, 233, 127, 0.35)",
        check: "rgba(255, 0, 85, 0.45)",
        validMove: "rgba(0, 200, 255, 0.35)",
        validCapture: "rgba(255, 120, 120, 0.35)",
      },
      boardBackground: "#f0f4ff",
    },
    notation: {
      show: true,
      darkSquareColor: "#e8edf9",
      lightSquareColor: "#1f2a44",
    },
  },
};

// Helper: render a default piece element with theme fill and optional deep stroke override
const renderPieceWithTheme = (
  defaultRender: (props?: {
    fill?: string;
    svgStyle?: React.CSSProperties;
  }) => React.JSX.Element,
  pieceFill?: string,
  strokeColor?: string,
  backgroundColor?: string,
): React.JSX.Element => {
  const baseElement = defaultRender({ fill: pieceFill });
  // If we need a background, inject a rect as the first child into the SVG tree
  let withBackground: React.ReactNode = baseElement;
  if (backgroundColor && React.isValidElement(baseElement)) {
    const element = baseElement as React.ReactElement<Record<string, unknown>>;
    const existingChildren = (element.props || {}).children as React.ReactNode;
    const rectEl = React.createElement("rect", {
      x: 0,
      y: 0,
      width: 45,
      height: 45,
      fill: backgroundColor,
    });
    const combinedChildren = Array.isArray(existingChildren)
      ? [rectEl, ...existingChildren]
      : existingChildren
        ? [rectEl, existingChildren]
        : [rectEl];
    withBackground = React.cloneElement(
      element,
      element.props as Record<string, unknown>,
      ...combinedChildren,
    );
  }
  if (!strokeColor) return withBackground as React.JSX.Element;

  const applyStroke = (node: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(node)) return node;

    const element = node as React.ReactElement<Record<string, unknown>>;
    const { children, style, ...restProps } = (element.props || {}) as {
      children?: React.ReactNode;
      style?: React.CSSProperties;
    } & Record<string, unknown>;

    const nextStyle: React.CSSProperties = { ...(style || {}) };
    // Only replace default/undefined black strokes; keep explicit white highlights
    if (
      nextStyle.stroke === "#000000" ||
      typeof nextStyle.stroke === "undefined"
    ) {
      if (nextStyle.stroke !== "#ffffff") {
        nextStyle.stroke = strokeColor;
      }
    }

    const nextChildren = Array.isArray(children)
      ? children.map((c) => applyStroke(c))
      : applyStroke(children);

    const propsForClone = {
      ...(restProps as Record<string, unknown>),
      style: nextStyle,
    } as Partial<Record<string, unknown>> & React.Attributes;

    return React.cloneElement(
      element,
      propsForClone,
      nextChildren as React.ReactNode,
    ) as React.ReactElement;
  };

  return applyStroke(withBackground) as React.JSX.Element;
};

// Utility function to create custom SVG pieces with theme colors and optional stroke colors
const createCustomPieces = (theme: ChessTheme) => {
  if (!theme.pieces) return {};

  const { light, dark, specific } = theme.pieces;

  // If no custom colors are defined, return empty object
  if (!light && !dark && !specific) return {};

  // Create custom pieces with theme colors using the fill prop
  const customPieces: PieceRenderObject = {};

  // Define all piece types
  const pieceTypes = ["K", "Q", "R", "B", "N", "P"] as const;
  const colors = ["w", "b"] as const;

  type Color = (typeof colors)[number];
  type PieceAbbrev = (typeof pieceTypes)[number];
  type PieceKey = `${Color}${PieceAbbrev}`;
  type PieceStyle = { fill: string; stroke?: string; background?: string };

  colors.forEach((color) => {
    pieceTypes.forEach((pieceType) => {
      const pieceKey = `${color}${pieceType}` as PieceKey;

      // Check for specific piece style first, then fallback to general style
      let pieceFill: string | undefined;
      let strokeColor: string | undefined;
      let backgroundColor: string | undefined;
      const specificMap =
        (specific as Partial<Record<PieceKey, PieceStyle>> | undefined) ??
        undefined;
      const specificStyle = specificMap?.[pieceKey];
      if (specificStyle) {
        pieceFill = specificStyle.fill;
        strokeColor = specificStyle.stroke;
        backgroundColor = specificStyle.background;
      } else if (color === "w" && light) {
        pieceFill = light.fill;
        strokeColor = light.stroke;
        backgroundColor = light.background;
      } else if (color === "b" && dark) {
        pieceFill = dark.fill;
        strokeColor = dark.stroke;
        backgroundColor = dark.background;
      }

      // If we have a custom style, create a styled version
      if (pieceFill || strokeColor) {
        const defaultPiece =
          defaultPieces[pieceKey as keyof typeof defaultPieces];
        if (defaultPiece) {
          customPieces[pieceKey] = () =>
            renderPieceWithTheme(
              defaultPiece,
              pieceFill,
              strokeColor,
              backgroundColor,
            );
        }
      }
    });
  });

  return customPieces;
};

// Utility function to convert theme to ChessboardOptions
export const themeToChessboardOptions = (
  theme: ChessTheme,
  customOptions?: ChessboardOptions,
): ChessboardOptions => {
  const customPieces = createCustomPieces(theme);

  // Create the base options object with proper typing
  const baseOptions = {
    boardStyle: {
      border: theme.colors.boardBorder
        ? `2px solid ${theme.colors.boardBorder}`
        : "none",
      boxShadow: theme.colors.boardBackground
        ? `0 5px 15px rgba(0, 0, 0, 0.2)`
        : undefined,
      ...(theme.colors.boardBackground
        ? { backgroundColor: theme.colors.boardBackground }
        : {}),
    },
    lightSquareStyle: {
      backgroundColor: theme.colors.lightSquare,
    },
    darkSquareStyle: {
      backgroundColor: theme.colors.darkSquare,
    },
    showNotation: theme.notation?.show ?? true,
    darkSquareNotationStyle: {
      color: theme.notation?.darkSquareColor || theme.colors.darkSquare,
    },
    lightSquareNotationStyle: {
      color: theme.notation?.lightSquareColor || theme.colors.lightSquare,
    },
    dropSquareStyle: {
      backgroundColor: theme.colors.highlight.lastMove,
    },
    ...customOptions,
  };

  // Add customPieces if they exist, using type assertion since
  // the TypeScript definitions don't include this property
  if (Object.keys(customPieces).length > 0) {
    return {
      ...baseOptions,
      pieces: customPieces,
    } as ChessboardOptions & { pieces: PieceRenderObject };
  }

  return baseOptions;
};

// Default theme
export const defaultTheme: ChessTheme = themes.classic;

// Theme merging utility for custom themes - optimized for performance
export const mergeThemes = (
  baseTheme: ChessTheme,
  customTheme: Partial<ChessTheme>,
): ChessTheme => {
  // Early return if no custom theme provided
  if (!customTheme || Object.keys(customTheme).length === 0) {
    return baseTheme;
  }

  return {
    ...baseTheme,
    ...customTheme,
    colors: customTheme.colors
      ? {
          ...baseTheme.colors,
          ...customTheme.colors,
          highlight: customTheme.colors.highlight
            ? {
                ...baseTheme.colors.highlight,
                ...customTheme.colors.highlight,
              }
            : baseTheme.colors.highlight,
        }
      : baseTheme.colors,
    notation: customTheme.notation
      ? { ...baseTheme.notation, ...customTheme.notation }
      : baseTheme.notation,
    pieces: customTheme.pieces
      ? {
          ...baseTheme.pieces,
          ...customTheme.pieces,
        }
      : baseTheme.pieces,
  };
};
