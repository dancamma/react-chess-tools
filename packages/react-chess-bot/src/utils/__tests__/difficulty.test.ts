import { DIFFICULTY_PRESETS, getDifficultyConfig } from "../difficulty";
import type { DifficultyLevel, DifficultyConfig } from "../../types";

describe("DIFFICULTY_PRESETS", () => {
  it("should have 8 difficulty levels", () => {
    expect(Object.keys(DIFFICULTY_PRESETS)).toHaveLength(8);
  });

  it("should have correct presets for each level", () => {
    const expectedPresets: Record<DifficultyLevel, DifficultyConfig> = {
      1: { depth: 2, elo: 800, description: "Principiante" },
      2: { depth: 4, elo: 1100, description: "" },
      3: { depth: 6, elo: 1400, description: "" },
      4: { depth: 8, elo: 1700, description: "" },
      5: { depth: 10, elo: 2000, description: "Intermedio" },
      6: { depth: 13, elo: 2300, description: "" },
      7: { depth: 16, elo: 2600, description: "" },
      8: { depth: 20, elo: 2900, description: "Gran Maestro" },
    };

    expect(DIFFICULTY_PRESETS[1]).toEqual(expectedPresets[1]);
    expect(DIFFICULTY_PRESETS[2]).toEqual(expectedPresets[2]);
    expect(DIFFICULTY_PRESETS[3]).toEqual(expectedPresets[3]);
    expect(DIFFICULTY_PRESETS[4]).toEqual(expectedPresets[4]);
    expect(DIFFICULTY_PRESETS[5]).toEqual(expectedPresets[5]);
    expect(DIFFICULTY_PRESETS[6]).toEqual(expectedPresets[6]);
    expect(DIFFICULTY_PRESETS[7]).toEqual(expectedPresets[7]);
    expect(DIFFICULTY_PRESETS[8]).toEqual(expectedPresets[8]);
  });

  it("should have increasing depth with level", () => {
    expect(DIFFICULTY_PRESETS[1].depth).toBeLessThan(
      DIFFICULTY_PRESETS[2].depth,
    );
    expect(DIFFICULTY_PRESETS[2].depth).toBeLessThan(
      DIFFICULTY_PRESETS[3].depth,
    );
    expect(DIFFICULTY_PRESETS[3].depth).toBeLessThan(
      DIFFICULTY_PRESETS[4].depth,
    );
    expect(DIFFICULTY_PRESETS[4].depth).toBeLessThan(
      DIFFICULTY_PRESETS[5].depth,
    );
    expect(DIFFICULTY_PRESETS[5].depth).toBeLessThan(
      DIFFICULTY_PRESETS[6].depth,
    );
    expect(DIFFICULTY_PRESETS[6].depth).toBeLessThan(
      DIFFICULTY_PRESETS[7].depth,
    );
    expect(DIFFICULTY_PRESETS[7].depth).toBeLessThan(
      DIFFICULTY_PRESETS[8].depth,
    );
  });

  it("should have increasing ELO with level", () => {
    expect(DIFFICULTY_PRESETS[1].elo).toBeLessThan(DIFFICULTY_PRESETS[2].elo);
    expect(DIFFICULTY_PRESETS[2].elo).toBeLessThan(DIFFICULTY_PRESETS[3].elo);
    expect(DIFFICULTY_PRESETS[3].elo).toBeLessThan(DIFFICULTY_PRESETS[4].elo);
    expect(DIFFICULTY_PRESETS[4].elo).toBeLessThan(DIFFICULTY_PRESETS[5].elo);
    expect(DIFFICULTY_PRESETS[5].elo).toBeLessThan(DIFFICULTY_PRESETS[6].elo);
    expect(DIFFICULTY_PRESETS[6].elo).toBeLessThan(DIFFICULTY_PRESETS[7].elo);
    expect(DIFFICULTY_PRESETS[7].elo).toBeLessThan(DIFFICULTY_PRESETS[8].elo);
  });

  it("should have descriptions for key levels", () => {
    expect(DIFFICULTY_PRESETS[1].description).toBe("Principiante");
    expect(DIFFICULTY_PRESETS[5].description).toBe("Intermedio");
    expect(DIFFICULTY_PRESETS[8].description).toBe("Gran Maestro");
  });
});

describe("getDifficultyConfig", () => {
  it("should return correct config for level 1", () => {
    const config = getDifficultyConfig(1);
    expect(config).toEqual({
      depth: 2,
      elo: 800,
      description: "Principiante",
    });
  });

  it("should return correct config for level 5 (default)", () => {
    const config = getDifficultyConfig(5);
    expect(config).toEqual({
      depth: 10,
      elo: 2000,
      description: "Intermedio",
    });
  });

  it("should return correct config for level 8 (max)", () => {
    const config = getDifficultyConfig(8);
    expect(config).toEqual({
      depth: 20,
      elo: 2900,
      description: "Gran Maestro",
    });
  });

  it("should return the same object reference as DIFFICULTY_PRESETS", () => {
    const config = getDifficultyConfig(5);
    expect(config).toBe(DIFFICULTY_PRESETS[5]);
  });
});
