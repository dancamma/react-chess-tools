import type { DifficultyLevel, DifficultyConfig } from "../types";

// Lichess calibration values from fishnet.py:
// https://github.com/lichess-org/lila/blob/master/modules/fishnet/src/main/scala/fishnet/FishnetApi.scala
export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyConfig> = {
  1: { depth: 1, skillLevel: 0, moveTime: 50 },
  2: { depth: 1, skillLevel: 3, moveTime: 100 },
  3: { depth: 2, skillLevel: 6, moveTime: 150 },
  4: { depth: 3, skillLevel: 10, moveTime: 200 },
  5: { depth: 5, skillLevel: 14, moveTime: 300 },
  6: { depth: 8, skillLevel: 16, moveTime: 400 },
  7: { depth: 13, skillLevel: 18, moveTime: 500 },
  8: { depth: 22, skillLevel: 20, moveTime: 1000 },
};

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_PRESETS[level];
}
