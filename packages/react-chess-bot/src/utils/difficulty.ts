import type { DifficultyLevel, DifficultyConfig } from "../types";

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyConfig> = {
  1: { depth: 5, skillLevel: 0, moveTime: 50 },
  2: { depth: 5, skillLevel: 3, moveTime: 100 },
  3: { depth: 5, skillLevel: 6, moveTime: 150 },
  4: { depth: 5, skillLevel: 9, moveTime: 200 },
  5: { depth: 8, skillLevel: 12, moveTime: 300 },
  6: { depth: 10, skillLevel: 15, moveTime: 500 },
  7: { depth: 15, skillLevel: 18, moveTime: 700 },
  8: { depth: 22, skillLevel: 20, moveTime: 1000 },
};

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_PRESETS[level];
}
