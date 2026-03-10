import type { PrincipalVariation } from "@react-chess-tools/react-chess-stockfish";

import { normalizeBotVariability, selectVariationForBot } from "../variability";

function createVariation(
  rank: number,
  uci: string,
  score: number,
): PrincipalVariation {
  return {
    rank,
    evaluation: { type: "cp", value: score },
    moves: [{ uci, san: uci }],
  };
}

describe("normalizeBotVariability", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("resolves medium preset", () => {
    expect(normalizeBotVariability("medium")).toEqual({
      multiPV: 3,
      thresholdCp: 30,
      selection: "weighted",
      temperature: 30,
    });
  });
});

describe("selectVariationForBot", () => {
  const principalVariations = [
    createVariation(1, "e2e4", 50),
    createVariation(2, "d2d4", 35),
    createVariation(3, "g1f3", 10),
  ];

  it("uses uniform selection within threshold", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.75);

    const selectedVariation = selectVariationForBot(principalVariations, "w", {
      multiPV: 3,
      thresholdCp: 20,
      selection: "uniform",
      temperature: null,
    });

    expect(selectedVariation?.moves[0]?.uci).toBe("d2d4");
  });

  it("converts scores from black perspective before applying threshold", () => {
    jest.spyOn(Math, "random").mockReturnValue(0);

    const selectedVariation = selectVariationForBot(
      [createVariation(1, "e7e5", -40), createVariation(2, "c7c5", -25)],
      "b",
      {
        multiPV: 2,
        thresholdCp: 20,
        selection: "uniform",
        temperature: null,
      },
    );

    expect(selectedVariation?.moves[0]?.uci).toBe("e7e5");
  });
});
