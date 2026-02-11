import {
  cpToWinningChances,
  formatEvaluation,
  normalizeEvaluation,
  InvalidFenError,
} from "../evaluation";

describe("formatEvaluation", () => {
  it("formats positive centipawn evaluations", () => {
    expect(formatEvaluation({ type: "cp", value: 123 })).toBe("+1.2");
    expect(formatEvaluation({ type: "cp", value: 50 })).toBe("+0.5");
    expect(formatEvaluation({ type: "cp", value: 1 })).toBe("0.0");
  });

  it("formats negative centipawn evaluations", () => {
    expect(formatEvaluation({ type: "cp", value: -123 })).toBe("-1.2");
    expect(formatEvaluation({ type: "cp", value: -50 })).toBe("-0.5");
    expect(formatEvaluation({ type: "cp", value: -1 })).toBe("0.0");
  });

  it("formats zero centipawn evaluation", () => {
    expect(formatEvaluation({ type: "cp", value: 0 })).toBe("0.0");
  });

  it("formats positive mate evaluations", () => {
    expect(formatEvaluation({ type: "mate", value: 1 })).toBe("#1");
    expect(formatEvaluation({ type: "mate", value: 3 })).toBe("#3");
    expect(formatEvaluation({ type: "mate", value: 10 })).toBe("#10");
  });

  it("formats negative mate evaluations", () => {
    expect(formatEvaluation({ type: "mate", value: -1 })).toBe("#-1");
    expect(formatEvaluation({ type: "mate", value: -5 })).toBe("#-5");
    expect(formatEvaluation({ type: "mate", value: -10 })).toBe("#-10");
  });

  it("formats null as dash", () => {
    expect(formatEvaluation(null)).toBe("–");
  });
});

describe("normalizeEvaluation", () => {
  it("returns 0 for null evaluation", () => {
    expect(normalizeEvaluation(null)).toBe(0);
  });

  it("returns 0 for zero centipawn evaluation", () => {
    expect(normalizeEvaluation({ type: "cp", value: 0 })).toBe(0);
  });

  it("normalizes positive centipawn evaluations", () => {
    const result500 = normalizeEvaluation({ type: "cp", value: 500 });
    expect(result500).toBeGreaterThan(0);
    expect(result500).toBeLessThan(1);
    expect(result500).toBeCloseTo(0.726, 3);

    const result1000 = normalizeEvaluation({ type: "cp", value: 1000 });
    expect(result1000).toBeCloseTo(0.951, 3);
  });

  it("normalizes negative centipawn evaluations", () => {
    const result500 = normalizeEvaluation({ type: "cp", value: -500 });
    expect(result500).toBeLessThan(0);
    expect(result500).toBeGreaterThan(-1);
    expect(result500).toBeCloseTo(-0.726, 3);

    const result1000 = normalizeEvaluation({ type: "cp", value: -1000 });
    expect(result1000).toBeCloseTo(-0.951, 3);
  });

  it("returns 1 for positive mate", () => {
    expect(normalizeEvaluation({ type: "mate", value: 1 })).toBe(1);
    expect(normalizeEvaluation({ type: "mate", value: 10 })).toBe(1);
  });

  it("returns -1 for negative mate", () => {
    expect(normalizeEvaluation({ type: "mate", value: -1 })).toBe(-1);
    expect(normalizeEvaluation({ type: "mate", value: -10 })).toBe(-1);
  });

  it("returns symmetric values for opposite evaluations", () => {
    const pos = normalizeEvaluation({ type: "cp", value: 500 });
    const neg = normalizeEvaluation({ type: "cp", value: -500 });
    expect(pos).toBeCloseTo(-neg, 5);
  });
});

describe("cpToWinningChances", () => {
  it("returns 0 at 0cp", () => {
    expect(cpToWinningChances(0)).toBe(0);
  });

  it("increases with larger cp values", () => {
    expect(cpToWinningChances(300)).toBeGreaterThan(cpToWinningChances(100));
  });
});

describe("InvalidFenError", () => {
  it("creates error with fen property", () => {
    const error = new InvalidFenError("test-fen", "Invalid syntax");
    expect(error.name).toBe("InvalidFenError");
    expect(error.fen).toBe("test-fen");
    expect(error.message).toBe("Invalid FEN: Invalid syntax");
  });
});
