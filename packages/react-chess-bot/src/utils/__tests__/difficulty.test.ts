import { DIFFICULTY_PRESETS, getDifficultyConfig } from "../difficulty";
import type { DifficultyLevel, DifficultyConfig } from "../../types";

describe("DIFFICULTY_PRESETS", () => {
  it("should have 8 difficulty levels", () => {
    expect(Object.keys(DIFFICULTY_PRESETS)).toHaveLength(8);
  });

  it("should have correct presets for each level (Stockfish 0-20 skill range)", () => {
    const expectedPresets: Record<DifficultyLevel, DifficultyConfig> = {
      1: { depth: 5, skillLevel: 0, moveTime: 50 },
      2: { depth: 5, skillLevel: 3, moveTime: 100 },
      3: { depth: 5, skillLevel: 6, moveTime: 150 },
      4: { depth: 5, skillLevel: 9, moveTime: 200 },
      5: { depth: 8, skillLevel: 12, moveTime: 300 },
      6: { depth: 10, skillLevel: 15, moveTime: 500 },
      7: { depth: 15, skillLevel: 18, moveTime: 700 },
      8: { depth: 22, skillLevel: 20, moveTime: 1000 },
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

  it("should have increasing skillLevel with level", () => {
    expect(DIFFICULTY_PRESETS[1].skillLevel).toBeLessThan(
      DIFFICULTY_PRESETS[2].skillLevel,
    );
    expect(DIFFICULTY_PRESETS[2].skillLevel).toBeLessThan(
      DIFFICULTY_PRESETS[3].skillLevel,
    );
    expect(DIFFICULTY_PRESETS[3].skillLevel).toBeLessThan(
      DIFFICULTY_PRESETS[4].skillLevel,
    );
    expect(DIFFICULTY_PRESETS[4].skillLevel).toBeLessThan(
      DIFFICULTY_PRESETS[5].skillLevel,
    );
    expect(DIFFICULTY_PRESETS[5].skillLevel).toBeLessThan(
      DIFFICULTY_PRESETS[6].skillLevel,
    );
    expect(DIFFICULTY_PRESETS[6].skillLevel).toBeLessThan(
      DIFFICULTY_PRESETS[7].skillLevel,
    );
    expect(DIFFICULTY_PRESETS[7].skillLevel).toBeLessThan(
      DIFFICULTY_PRESETS[8].skillLevel,
    );
  });

  it("should have increasing moveTime with level", () => {
    expect(DIFFICULTY_PRESETS[1].moveTime).toBeLessThan(
      DIFFICULTY_PRESETS[2].moveTime,
    );
    expect(DIFFICULTY_PRESETS[2].moveTime).toBeLessThan(
      DIFFICULTY_PRESETS[3].moveTime,
    );
    expect(DIFFICULTY_PRESETS[3].moveTime).toBeLessThan(
      DIFFICULTY_PRESETS[4].moveTime,
    );
    expect(DIFFICULTY_PRESETS[4].moveTime).toBeLessThan(
      DIFFICULTY_PRESETS[5].moveTime,
    );
    expect(DIFFICULTY_PRESETS[5].moveTime).toBeLessThan(
      DIFFICULTY_PRESETS[6].moveTime,
    );
    expect(DIFFICULTY_PRESETS[6].moveTime).toBeLessThan(
      DIFFICULTY_PRESETS[7].moveTime,
    );
    expect(DIFFICULTY_PRESETS[7].moveTime).toBeLessThan(
      DIFFICULTY_PRESETS[8].moveTime,
    );
  });

  it("should use skill level 0 for level 1 (weakest)", () => {
    expect(DIFFICULTY_PRESETS[1].skillLevel).toBe(0);
  });

  it("should use skill level 20 for level 8 (strongest)", () => {
    expect(DIFFICULTY_PRESETS[8].skillLevel).toBe(20);
  });

  it("should have all skill levels within Stockfish range (0-20)", () => {
    for (let level = 1; level <= 8; level++) {
      expect(
        DIFFICULTY_PRESETS[level as DifficultyLevel].skillLevel,
      ).toBeGreaterThanOrEqual(0);
      expect(
        DIFFICULTY_PRESETS[level as DifficultyLevel].skillLevel,
      ).toBeLessThanOrEqual(20);
    }
  });
});

describe("getDifficultyConfig", () => {
  it("should return correct config for level 1", () => {
    const config = getDifficultyConfig(1);
    expect(config).toEqual({
      depth: 5,
      skillLevel: 0,
      moveTime: 50,
    });
  });

  it("should return correct config for level 5 (default)", () => {
    const config = getDifficultyConfig(5);
    expect(config).toEqual({
      depth: 8,
      skillLevel: 12,
      moveTime: 300,
    });
  });

  it("should return correct config for level 8 (max)", () => {
    const config = getDifficultyConfig(8);
    expect(config).toEqual({
      depth: 22,
      skillLevel: 20,
      moveTime: 1000,
    });
  });

  it("should return the same object reference as DIFFICULTY_PRESETS", () => {
    const config = getDifficultyConfig(5);
    expect(config).toBe(DIFFICULTY_PRESETS[5]);
  });
});
