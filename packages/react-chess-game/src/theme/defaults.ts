import type { ChessGameTheme } from "./types";

/**
 * Default theme for ChessGame component.
 * These values match the original hardcoded colors for backward compatibility.
 */
export const defaultGameTheme: ChessGameTheme = {
  board: {
    lightSquare: { backgroundColor: "#f0d9b5" },
    darkSquare: { backgroundColor: "#b58863" },
  },
  state: {
    lastMove: "rgba(255, 255, 0, 0.5)",
    check: "rgba(255, 0, 0, 0.5)",
    activeSquare: "rgba(255, 255, 0, 0.5)",
    dropSquare: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
  },
  indicators: {
    move: "rgba(0, 0, 0, 0.1)",
    capture: "rgba(1, 0, 0, 0.1)",
  },
};
