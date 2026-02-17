import type {
  PrincipalVariation,
  Evaluation,
} from "@react-chess-tools/react-chess-stockfish";
import { selectMoveWithRandomness, getMultiPVCount } from "../randomness";
import type { RandomnessLevel } from "../../types";

function createPV(
  rank: number,
  evaluation: Evaluation | null,
  moves: { uci: string; san: string }[],
): PrincipalVariation {
  return {
    rank,
    evaluation,
    moves: moves.map((m) => ({ uci: m.uci, san: m.san })),
  };
}

describe("getMultiPVCount", () => {
  it("should return 1 when randomness is 0", () => {
    expect(getMultiPVCount(0)).toBe(1);
  });

  it("should return 5 when randomness is greater than 0", () => {
    expect(getMultiPVCount(1)).toBe(5);
    expect(getMultiPVCount(2)).toBe(5);
    expect(getMultiPVCount(3)).toBe(5);
    expect(getMultiPVCount(4)).toBe(5);
    expect(getMultiPVCount(5)).toBe(5);
  });
});

describe("selectMoveWithRandomness", () => {
  describe("edge cases", () => {
    it("should return null when no PVs are provided", () => {
      const result = selectMoveWithRandomness([], 0, "w");
      expect(result).toBeNull();
    });

    it("should return null when first PV has no moves", () => {
      const pvs = [createPV(1, { type: "cp", value: 100 }, [])];
      const result = selectMoveWithRandomness(pvs, 0, "w");
      expect(result).toBeNull();
    });
  });

  describe("randomness = 0 (deterministic)", () => {
    it("should always return the first move of the first PV", () => {
      const pvs = [
        createPV(1, { type: "cp", value: 100 }, [{ uci: "e2e4", san: "e4" }]),
        createPV(2, { type: "cp", value: 50 }, [{ uci: "d2d4", san: "d4" }]),
      ];

      const result = selectMoveWithRandomness(pvs, 0, "w");
      expect(result).toEqual({ uci: "e2e4", san: "e4" });
    });

    it("should be deterministic across multiple calls", () => {
      const pvs = [
        createPV(1, { type: "cp", value: 100 }, [{ uci: "e2e4", san: "e4" }]),
        createPV(2, { type: "cp", value: 50 }, [{ uci: "d2d4", san: "d4" }]),
      ];

      for (let i = 0; i < 10; i++) {
        const result = selectMoveWithRandomness(pvs, 0, "w");
        expect(result).toEqual({ uci: "e2e4", san: "e4" });
      }
    });
  });

  describe("randomness > 0 (weighted selection)", () => {
    it("should prefer better evaluated moves", () => {
      const pvs = [
        createPV(1, { type: "cp", value: 500 }, [{ uci: "e2e4", san: "e4" }]),
        createPV(2, { type: "cp", value: -500 }, [{ uci: "d2d4", san: "d4" }]),
      ];

      const results = { e4: 0, d4: 0 };
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const result = selectMoveWithRandomness(pvs, 1, "w");
        if (result?.san === "e4") results.e4++;
        if (result?.san === "d4") results.d4++;
      }

      expect(results.e4).toBeGreaterThan(results.d4 * 2);
    });

    it("should handle mate scores", () => {
      const pvs = [
        createPV(1, { type: "mate", value: 3 }, [{ uci: "e2e4", san: "e4" }]),
        createPV(2, { type: "cp", value: 100 }, [{ uci: "d2d4", san: "d4" }]),
      ];

      const results = { e4: 0, d4: 0 };
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const result = selectMoveWithRandomness(pvs, 1, "w");
        if (result?.san === "e4") results.e4++;
        if (result?.san === "d4") results.d4++;
      }

      expect(results.e4).toBeGreaterThan(results.d4);
    });

    it("should handle null evaluations", () => {
      const pvs = [
        createPV(1, null, [{ uci: "e2e4", san: "e4" }]),
        createPV(2, null, [{ uci: "d2d4", san: "d4" }]),
      ];

      const result = selectMoveWithRandomness(pvs, 1, "w");
      expect(result).not.toBeNull();
      expect(["e4", "d4"]).toContain(result?.san);
    });

    it("should normalize evaluation for black side", () => {
      const pvs = [
        createPV(1, { type: "cp", value: -500 }, [{ uci: "e7e5", san: "e5" }]),
        createPV(2, { type: "cp", value: -100 }, [{ uci: "d7d5", san: "d5" }]),
      ];

      const results = { e5: 0, d5: 0 };
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const result = selectMoveWithRandomness(pvs, 1, "b");
        if (result?.san === "e5") results.e5++;
        if (result?.san === "d5") results.d5++;
      }

      expect(results.e5).toBeGreaterThan(results.d5);
    });

    it("should increase variability with higher randomness", () => {
      const pvs = [
        createPV(1, { type: "cp", value: 50 }, [{ uci: "e2e4", san: "e4" }]),
        createPV(2, { type: "cp", value: 40 }, [{ uci: "d2d4", san: "d4" }]),
        createPV(3, { type: "cp", value: 30 }, [{ uci: "c2c4", san: "c4" }]),
        createPV(4, { type: "cp", value: 20 }, [{ uci: "g1f3", san: "Nf3" }]),
        createPV(5, { type: "cp", value: 10 }, [{ uci: "b1c3", san: "Nc3" }]),
      ];

      const uniqueMovesLowRandomness = new Set<string>();
      const uniqueMovesHighRandomness = new Set<string>();
      const iterations = 200;

      for (let i = 0; i < iterations; i++) {
        const resultLow = selectMoveWithRandomness(pvs, 1, "w");
        const resultHigh = selectMoveWithRandomness(pvs, 5, "w");
        if (resultLow) uniqueMovesLowRandomness.add(resultLow.san);
        if (resultHigh) uniqueMovesHighRandomness.add(resultHigh.san);
      }

      expect(uniqueMovesHighRandomness.size).toBeGreaterThanOrEqual(
        uniqueMovesLowRandomness.size,
      );
    });
  });
});
