import { BOT_LEVELS } from "../../levels";
import { DEFAULT_BOT_MOVE_TIME_MS, resolveBotStrength } from "../strength";

describe("resolveBotStrength", () => {
  it("uses level 4 by default", () => {
    const result = resolveBotStrength(undefined, "stockfish");

    expect(result.error).toBeNull();
    expect(result.level).toEqual(BOT_LEVELS[4]);
    expect(result.config).toEqual({
      skillLevel: BOT_LEVELS[4].skillLevel,
      moveTimeMs: BOT_LEVELS[4].moveTimeMs,
      depth: BOT_LEVELS[4].maxDepth,
    });
  });

  it("returns an explicit error for levels 1-3 with standard stockfish", () => {
    const result = resolveBotStrength({ level: 2 }, "stockfish");

    expect(result.level).toEqual(BOT_LEVELS[2]);
    expect(result.error?.message).toContain("requires fairy-stockfish");
  });

  it("normalizes custom configs and defaults movetime when no limit is provided", () => {
    const result = resolveBotStrength(
      {
        custom: {
          skillLevel: 12,
          elo: 1800,
        },
      },
      "stockfish",
    );

    expect(result.error).toBeNull();
    expect(result.level).toBeNull();
    expect(result.config).toEqual({
      skillLevel: 12,
      limitStrength: true,
      elo: 1800,
      moveTimeMs: DEFAULT_BOT_MOVE_TIME_MS,
      depth: undefined,
    });
  });
});
