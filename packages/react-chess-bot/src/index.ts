export { ChessBot } from "./components/ChessBot";
export { useChessBotContext, ChessBotContext } from "./hooks";
export type { ChessBotContextValue } from "./hooks";

export type {
  PlayAsColor,
  BotMove,
  DifficultyLevel,
  RandomnessLevel,
  DifficultyConfig,
} from "./types";

export { DIFFICULTY_PRESETS, getDifficultyConfig } from "./utils/difficulty";

export type { RootProps } from "./components/ChessBot/parts/Root";
