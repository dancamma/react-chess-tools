import {
  DIFFICULTY_PRESETS,
  getDifficultyConfig,
  pickMoveWithRandomness,
} from "../difficulty";
import type { DifficultyLevel, DifficultyConfig } from "../../types";
import type { PrincipalVariation } from "@react-chess-tools/react-chess-stockfish";

function createPV(
  rank: number,
  san: string,
  uci: string,
  cp: number,
): PrincipalVariation {
  return {
    rank,
    evaluation: { type: "cp", value: cp },
    moves: [{ san, uci }],
  };
}

function createMatePV(
  rank: number,
  san: string,
  uci: string,
  mateIn: number,
): PrincipalVariation {
  return {
    rank,
    evaluation: { type: "mate", value: mateIn },
    moves: [{ san, uci }],
  };
}

describe("DIFFICULTY_PRESETS", () => {
  it("should have 8 difficulty levels", () => {
    expect(Object.keys(DIFFICULTY_PRESETS)).toHaveLength(8);
  });

  it("should have correct presets matching Lichess calibration", () => {
    const expectedPresets: Record<DifficultyLevel, DifficultyConfig> = {
      1: { depth: 5, skillLevel: -9, moveTime: 50, multiPV: 4 },
      2: { depth: 5, skillLevel: -5, moveTime: 100, multiPV: 4 },
      3: { depth: 5, skillLevel: -1, moveTime: 150, multiPV: 4 },
      4: { depth: 5, skillLevel: 3, moveTime: 200, multiPV: 4 },
      5: { depth: 5, skillLevel: 7, moveTime: 300, multiPV: 4 },
      6: { depth: 8, skillLevel: 11, moveTime: 400, multiPV: 4 },
      7: { depth: 13, skillLevel: 15, moveTime: 500, multiPV: 4 },
      8: { depth: 22, skillLevel: 20, moveTime: 1000, multiPV: 1 },
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

  it("should use skill level -9 for level 1 (weakest, Fairy-Stockfish)", () => {
    expect(DIFFICULTY_PRESETS[1].skillLevel).toBe(-9);
  });

  it("should use skill level 20 for level 8 (strongest)", () => {
    expect(DIFFICULTY_PRESETS[8].skillLevel).toBe(20);
  });

  it("should have all skill levels within Fairy-Stockfish range (-20 to 20)", () => {
    for (let level = 1; level <= 8; level++) {
      expect(
        DIFFICULTY_PRESETS[level as DifficultyLevel].skillLevel,
      ).toBeGreaterThanOrEqual(-20);
      expect(
        DIFFICULTY_PRESETS[level as DifficultyLevel].skillLevel,
      ).toBeLessThanOrEqual(20);
    }
  });

  it("should use MultiPV=4 for levels 1-7 (Lichess pattern)", () => {
    expect(DIFFICULTY_PRESETS[1].multiPV).toBe(4);
    expect(DIFFICULTY_PRESETS[2].multiPV).toBe(4);
    expect(DIFFICULTY_PRESETS[3].multiPV).toBe(4);
    expect(DIFFICULTY_PRESETS[4].multiPV).toBe(4);
    expect(DIFFICULTY_PRESETS[5].multiPV).toBe(4);
    expect(DIFFICULTY_PRESETS[6].multiPV).toBe(4);
    expect(DIFFICULTY_PRESETS[7].multiPV).toBe(4);
  });

  it("should use MultiPV=1 for level 8 (maximum strength)", () => {
    expect(DIFFICULTY_PRESETS[8].multiPV).toBe(1);
  });
});

describe("getDifficultyConfig", () => {
  it("should return correct config for level 1", () => {
    const config = getDifficultyConfig(1);
    expect(config).toEqual({
      depth: 5,
      skillLevel: -9,
      moveTime: 50,
      multiPV: 4,
    });
  });

  it("should return correct config for level 5 (default)", () => {
    const config = getDifficultyConfig(5);
    expect(config).toEqual({
      depth: 5,
      skillLevel: 7,
      moveTime: 300,
      multiPV: 4,
    });
  });

  it("should return correct config for level 8 (max)", () => {
    const config = getDifficultyConfig(8);
    expect(config).toEqual({
      depth: 22,
      skillLevel: 20,
      moveTime: 1000,
      multiPV: 1,
    });
  });

  it("should return the same object reference as DIFFICULTY_PRESETS", () => {
    const config = getDifficultyConfig(5);
    expect(config).toBe(DIFFICULTY_PRESETS[5]);
  });
});

describe("pickMoveWithRandomness", () => {
  it("returns null for empty PV array", () => {
    const result = pickMoveWithRandomness([], 10);
    expect(result).toBeNull();
  });

  it("returns the only move when single PV", () => {
    const pvs = [createPV(1, "e4", "e2e4", 50)];
    const result = pickMoveWithRandomness(pvs, 10);
    expect(result).toEqual({ san: "e4", uci: "e2e4" });
  });

  it("at skill level 20 (max), weakness=80, best move is strongly favored", () => {
    const pvs = [
      createPV(1, "e4", "e2e4", 100),
      createPV(2, "d4", "d2d4", 80),
      createPV(3, "c4", "c2c4", 60),
    ];

    let e4Count = 0;
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const result = pickMoveWithRandomness(pvs, 20);
      if (result?.san === "e4") e4Count++;
    }

    expect(e4Count).toBeGreaterThan(50);
  });

  it("at skill level -9 (min), weakness=138, weaker moves get more chances", () => {
    const pvs = [
      createPV(1, "e4", "e2e4", 100),
      createPV(2, "d4", "d2d4", 95),
      createPV(3, "c4", "c2c4", 90),
    ];

    const moveCounts: Record<string, number> = { e4: 0, d4: 0, c4: 0 };
    const iterations = 500;

    for (let i = 0; i < iterations; i++) {
      const result = pickMoveWithRandomness(pvs, -9);
      if (result?.san) moveCounts[result.san]++;
    }

    expect(moveCounts.e4).toBeLessThan(iterations * 0.8);
    expect(moveCounts.d4).toBeGreaterThan(0);
    expect(moveCounts.c4).toBeGreaterThan(0);
  });

  it("handles mate scores correctly", () => {
    const pvs = [
      createMatePV(1, "Qh7#", "h5h7", 1),
      createPV(2, "Qh5", "h5h5", 500),
    ];

    const result = pickMoveWithRandomness(pvs, 20);
    expect(result?.san).toBe("Qh7#");
  });

  it("handles PVs with empty moves array", () => {
    const pvs: PrincipalVariation[] = [
      { rank: 1, evaluation: { type: "cp", value: 100 }, moves: [] },
    ];

    const result = pickMoveWithRandomness(pvs, 10);
    expect(result).toBeNull();
  });

  it("handles null evaluation gracefully", () => {
    const pvs: PrincipalVariation[] = [
      { rank: 1, evaluation: null, moves: [{ san: "e4", uci: "e2e4" }] },
      { rank: 2, evaluation: null, moves: [{ san: "d4", uci: "d2d4" }] },
    ];

    const result = pickMoveWithRandomness(pvs, 10);
    expect(result).not.toBeNull();
    expect(["e4", "d4"]).toContain(result?.san);
  });
});
