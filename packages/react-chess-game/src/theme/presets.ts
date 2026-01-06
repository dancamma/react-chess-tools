import type { ChessGameTheme } from "./types";

/**
 * Lichess-inspired theme with green highlights
 */
export const lichessTheme: ChessGameTheme = {
  board: {
    lightSquare: { backgroundColor: "#f0d9b5" },
    darkSquare: { backgroundColor: "#b58863" },
  },
  state: {
    lastMove: "rgba(155, 199, 0, 0.41)",
    check: "rgba(255, 0, 0, 0.5)",
    activeSquare: "rgba(20, 85, 30, 0.5)",
    dropSquare: { backgroundColor: "rgba(20, 85, 30, 0.3)" },
  },
  indicators: {
    move: "rgba(20, 85, 30, 0.3)",
    capture: "rgba(20, 85, 30, 0.3)",
  },
};

/**
 * Chess.com-inspired theme with green board and yellow highlights
 */
export const chessComTheme: ChessGameTheme = {
  board: {
    lightSquare: { backgroundColor: "#ebecd0" },
    darkSquare: { backgroundColor: "#779556" },
  },
  state: {
    lastMove: "rgba(255, 255, 0, 0.5)",
    check: "rgba(255, 0, 0, 0.7)",
    activeSquare: "rgba(255, 255, 0, 0.5)",
    dropSquare: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
  },
  indicators: {
    move: "rgba(0, 0, 0, 0.1)",
    capture: "rgba(0, 0, 0, 0.1)",
  },
};
