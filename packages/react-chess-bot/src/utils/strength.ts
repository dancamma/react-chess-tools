import type {
  EngineType,
  StockfishConfig,
} from "@react-chess-tools/react-chess-stockfish";

import { BOT_LEVELS } from "../levels";
import type { BotLevel, BotResolvedLevel, BotStrength } from "../types";

export const DEFAULT_BOT_LEVEL: BotLevel = 4;
export const DEFAULT_BOT_MOVE_TIME_MS =
  BOT_LEVELS[DEFAULT_BOT_LEVEL].moveTimeMs;

export interface ResolvedBotStrength {
  config: StockfishConfig;
  level: BotResolvedLevel | null;
  error: Error | null;
}

function normalizePositiveInteger(
  value: number | undefined,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const normalizedValue = Math.round(value);
  return normalizedValue > 0 ? normalizedValue : undefined;
}

export function resolveBotStrength(
  strength: BotStrength | undefined,
  engineType: EngineType | undefined,
): ResolvedBotStrength {
  const resolvedEngineType = engineType ?? "stockfish";

  if (!strength || "level" in strength) {
    const resolvedLevel = BOT_LEVELS[strength?.level ?? DEFAULT_BOT_LEVEL];

    if (
      resolvedEngineType === "stockfish" &&
      !resolvedLevel.supportsStandardStockfish
    ) {
      return {
        config: {},
        level: resolvedLevel,
        error: new Error(
          `ChessBot.Player level ${resolvedLevel.level} requires fairy-stockfish. ` +
            `Received engineType "${resolvedEngineType}".`,
        ),
      };
    }

    return {
      config: {
        skillLevel: resolvedLevel.skillLevel,
        moveTimeMs: resolvedLevel.moveTimeMs,
        depth: resolvedLevel.maxDepth,
      },
      level: resolvedLevel,
      error: null,
    };
  }

  const { custom } = strength;
  const moveTimeMs = normalizePositiveInteger(custom.moveTimeMs);
  const depth = normalizePositiveInteger(custom.depth);

  return {
    config: {
      skillLevel: custom.skillLevel,
      limitStrength:
        custom.limitStrength ?? (custom.elo !== undefined || undefined),
      elo: custom.elo,
      moveTimeMs: moveTimeMs ?? (depth ? undefined : DEFAULT_BOT_MOVE_TIME_MS),
      depth,
    },
    level: null,
    error: null,
  };
}

export function buildStockfishConfigKey(config: StockfishConfig): string {
  return [
    config.threads ?? "",
    config.hash ?? "",
    config.skillLevel ?? "",
    config.multiPV ?? "",
    config.moveOverhead ?? "",
    config.ponder ?? "",
    config.limitStrength ?? "",
    config.elo ?? "",
    config.moveTimeMs ?? "",
    config.depth ?? "",
  ].join("|");
}
