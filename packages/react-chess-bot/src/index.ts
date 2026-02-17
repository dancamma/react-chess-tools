export { ChessBot } from "./components/ChessBot";
export { useChessBotContext, ChessBotContext, useBotTournament } from "./hooks";
export type {
  ChessBotContextValue,
  GameResult,
  MatchupResult,
  TournamentState,
  UseBotTournamentOptions,
  ActiveSlot,
} from "./hooks";

export type {
  PlayAsColor,
  BotMove,
  DifficultyLevel,
  DifficultyConfig,
} from "./types";

export { DIFFICULTY_PRESETS, getDifficultyConfig } from "./utils/difficulty";

export type { RootProps } from "./components/ChessBot/parts/Root";
