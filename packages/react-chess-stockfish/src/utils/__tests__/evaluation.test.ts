import {
  formatEvaluation,
  normalizeEvaluation,
  InvalidFenError,
} from "../evaluation";

describe("formatEvaluation", () => {
  it("formats positive centipawn evaluations", () => {
    expect(formatEvaluation({ type: "cp", value: 123 })).toBe("+1.23");
    expect(formatEvaluation({ type: "cp", value: 50 })).toBe("+0.50");
    expect(formatEvaluation({ type: "cp", value: 1 })).toBe("+0.01");
  });

  it("formats negative centipawn evaluations", () => {
    expect(formatEvaluation({ type: "cp", value: -123 })).toBe("-1.23");
    expect(formatEvaluation({ type: "cp", value: -50 })).toBe("-0.50");
    expect(formatEvaluation({ type: "cp", value: -1 })).toBe("-0.01");
  });

  it("formats zero centipawn evaluation", () => {
    expect(formatEvaluation({ type: "cp", value: 0 })).toBe("0.00");
  });

  it("formats positive mate evaluations", () => {
    expect(formatEvaluation({ type: "mate", value: 1 })).toBe("M1");
    expect(formatEvaluation({ type: "mate", value: 3 })).toBe("M3");
    expect(formatEvaluation({ type: "mate", value: 10 })).toBe("M10");
  });

  it("formats negative mate evaluations", () => {
    expect(formatEvaluation({ type: "mate", value: -1 })).toBe("-M1");
    expect(formatEvaluation({ type: "mate", value: -5 })).toBe("-M5");
    expect(formatEvaluation({ type: "mate", value: -10 })).toBe("-M10");
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

    const result1000 = normalizeEvaluation({ type: "cp", value: 1000 });
    expect(result1000).toBeCloseTo(0.76, 1);
  });

  it("normalizes negative centipawn evaluations", () => {
    const result500 = normalizeEvaluation({ type: "cp", value: -500 });
    expect(result500).toBeLessThan(0);
    expect(result500).toBeGreaterThan(-1);

    const result1000 = normalizeEvaluation({ type: "cp", value: -1000 });
    expect(result1000).toBeCloseTo(-0.76, 1);
  });

  it("clamps at range", () => {
    const defaultRange = normalizeEvaluation({ type: "cp", value: 2000 });
    const customRange = normalizeEvaluation({ type: "cp", value: 2000 }, 1000);

    // Both should be the same since 2000 is clamped to 1000
    expect(defaultRange).toBeCloseTo(customRange, 5);
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

describe("InvalidFenError", () => {
  it("creates error with fen property", () => {
    const error = new InvalidFenError("test-fen", "Invalid syntax");
    expect(error.name).toBe("InvalidFenError");
    expect(error.fen).toBe("test-fen");
    expect(error.message).toBe("Invalid FEN: Invalid syntax");
  });
});
