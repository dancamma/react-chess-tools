import type { DifficultyLevel, DifficultyConfig } from "../types";

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyConfig> = {
  1: { depth: 2, elo: 800, description: "Principiante" },
  2: { depth: 4, elo: 1100, description: "" },
  3: { depth: 6, elo: 1400, description: "" },
  4: { depth: 8, elo: 1700, description: "" },
  5: { depth: 10, elo: 2000, description: "Intermedio" },
  6: { depth: 13, elo: 2300, description: "" },
  7: { depth: 16, elo: 2600, description: "" },
  8: { depth: 20, elo: 2900, description: "Gran Maestro" },
};

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_PRESETS[level];
}
