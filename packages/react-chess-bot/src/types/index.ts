import type { PVMove } from "@react-chess-tools/react-chess-stockfish";

export type PlayAsColor = "white" | "black";

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface DifficultyConfig {
  depth: number;
  skillLevel: number;
  moveTime: number;
  multiPV: number;
}

export type BotMove = PVMove;

export interface ChessBotContextValue {
  playAs: PlayAsColor;
  difficulty: DifficultyLevel;
  isThinking: boolean;
  lastMove: BotMove | null;
  error: Error | null;
}
