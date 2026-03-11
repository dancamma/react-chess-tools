import type { Chess, Move } from "chess.js";

export const CHESS_GAME_EVENT_NAMES = [
  "move-made",
  "illegal-move",
  "clock-timeout",
] as const;

export type ChessGameEventName = (typeof CHESS_GAME_EVENT_NAMES)[number];

export interface ChessGameMoveEvent {
  id: number;
  type: "move-made";
  move: Move;
  fen: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
}

export interface ChessGameIllegalMoveEvent {
  id: number;
  type: "illegal-move";
  attemptedMove: Parameters<Chess["move"]>[0];
}

export interface ChessGameClockTimeoutEvent {
  id: number;
  type: "clock-timeout";
  player: "white" | "black";
}

export type ChessGameEvent =
  | ChessGameMoveEvent
  | ChessGameIllegalMoveEvent
  | ChessGameClockTimeoutEvent;
