import type { PVMove } from "@react-chess-tools/react-chess-stockfish";

export type PlayAsColor = "white" | "black";

/**
 * Re-export PVMove as BotMove for consumer convenience.
 * Contains UCI and SAN notation for the bot's move.
 */
export type BotMove = PVMove;

/**
 * Context value provided by ChessBot.Root.
 */
export interface ChessBotContextValue {
  /** The color the bot plays as */
  playAs: PlayAsColor;
  /** Whether the bot is currently thinking (analyzing or in delay) */
  isThinking: boolean;
  /** The last move the bot made, or null if no move yet */
  lastMove: BotMove | null;
  /** Any error that occurred, or null */
  error: Error | null;
}
