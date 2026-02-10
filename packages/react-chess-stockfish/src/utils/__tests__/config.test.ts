import {
  configCompareEqual,
  getInitialState,
  DEFAULT_THROTTLE_MS,
  DEFAULT_TIMEOUT_MS,
} from "../config";

describe("DEFAULT_THROTTLE_MS", () => {
  it("is 100ms", () => {
    expect(DEFAULT_THROTTLE_MS).toBe(100);
  });
});

describe("DEFAULT_TIMEOUT_MS", () => {
  it("is 30000ms", () => {
    expect(DEFAULT_TIMEOUT_MS).toBe(30000);
  });
});

describe("configCompareEqual", () => {
  it("returns true for identical configs", () => {
    const config = { skillLevel: 10, depth: 20, multiPV: 3 };
    expect(configCompareEqual(config, { ...config })).toBe(true);
  });

  it("returns true for two empty configs", () => {
    expect(configCompareEqual({}, {})).toBe(true);
  });

  it("returns false when skillLevel differs", () => {
    expect(configCompareEqual({ skillLevel: 10 }, { skillLevel: 15 })).toBe(
      false,
    );
  });

  it("returns false when depth differs", () => {
    expect(configCompareEqual({ depth: 20 }, { depth: 25 })).toBe(false);
  });

  it("returns false when multiPV differs", () => {
    expect(configCompareEqual({ multiPV: 1 }, { multiPV: 3 })).toBe(false);
  });

  it("returns false when one has a field and the other does not", () => {
    expect(configCompareEqual({ depth: 20 }, {})).toBe(false);
    expect(configCompareEqual({}, { depth: 20 })).toBe(false);
  });
});

describe("getInitialState", () => {
  it("returns the expected initial shape", () => {
    const state = getInitialState();
    expect(state).toEqual({
      fen: "",
      config: {},
      evaluation: null,
      normalizedEvaluation: 0,
      bestLine: null,
      principalVariations: [],
      depth: 0,
      status: "initializing",
      isEngineThinking: false,
      hasResults: false,
      error: null,
    });
  });

  it("returns a fresh object on each call", () => {
    const a = getInitialState();
    const b = getInitialState();
    expect(a).not.toBe(b);
    expect(a.principalVariations).not.toBe(b.principalVariations);
  });
});
