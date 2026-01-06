import { mergeTheme, mergeThemeWith } from "../utils";
import { defaultGameTheme } from "../defaults";
import { lichessTheme } from "../presets";

describe("mergeTheme", () => {
  it("should return default theme when no partial theme is provided", () => {
    const result = mergeTheme();
    expect(result).toEqual(defaultGameTheme);
  });

  it("should return default theme when undefined is provided", () => {
    const result = mergeTheme(undefined);
    expect(result).toEqual(defaultGameTheme);
  });

  it("should return a new object, not a reference to default", () => {
    const result = mergeTheme();
    expect(result).not.toBe(defaultGameTheme);
  });

  it("should override a single nested property", () => {
    const result = mergeTheme({
      state: { lastMove: "rgba(100, 200, 100, 0.6)" },
    });

    expect(result.state.lastMove).toBe("rgba(100, 200, 100, 0.6)");
    // Other state properties should remain default
    expect(result.state.check).toBe(defaultGameTheme.state.check);
    expect(result.state.activeSquare).toBe(defaultGameTheme.state.activeSquare);
    expect(result.state.dropSquare).toEqual(defaultGameTheme.state.dropSquare);
  });

  it("should override multiple properties in different groups", () => {
    const result = mergeTheme({
      state: { lastMove: "rgba(100, 200, 100, 0.6)" },
      board: { lightSquare: { backgroundColor: "#eeeeee" } },
    });

    expect(result.state.lastMove).toBe("rgba(100, 200, 100, 0.6)");
    expect(result.board.lightSquare).toEqual({ backgroundColor: "#eeeeee" });
    // Dark square should remain default
    expect(result.board.darkSquare).toEqual(defaultGameTheme.board.darkSquare);
  });

  it("should override indicator colors", () => {
    const result = mergeTheme({
      indicators: {
        move: "rgba(50, 50, 50, 0.2)",
        capture: "rgba(200, 50, 50, 0.3)",
      },
    });

    expect(result.indicators.move).toBe("rgba(50, 50, 50, 0.2)");
    expect(result.indicators.capture).toBe("rgba(200, 50, 50, 0.3)");
  });

  it("should override dropSquare style completely", () => {
    const result = mergeTheme({
      state: {
        dropSquare: {
          backgroundColor: "rgba(0, 255, 0, 0.5)",
          border: "2px solid green",
        },
      },
    });

    expect(result.state.dropSquare).toEqual({
      backgroundColor: "rgba(0, 255, 0, 0.5)",
      border: "2px solid green",
    });
  });

  it("should preserve unmentioned theme properties", () => {
    const result = mergeTheme({
      state: { check: "rgba(255, 100, 100, 0.8)" },
    });

    expect(result.board).toEqual(defaultGameTheme.board);
    expect(result.indicators).toEqual(defaultGameTheme.indicators);
  });
});

describe("mergeThemeWith", () => {
  it("should merge partial theme with provided base theme", () => {
    const result = mergeThemeWith(lichessTheme, {
      state: { check: "rgba(255, 0, 0, 0.9)" },
    });

    // Check should be overridden
    expect(result.state.check).toBe("rgba(255, 0, 0, 0.9)");
    // Other lichess theme values should be preserved
    expect(result.state.lastMove).toBe(lichessTheme.state.lastMove);
    expect(result.board).toEqual(lichessTheme.board);
  });

  it("should return copy of base theme when no partial is provided", () => {
    const result = mergeThemeWith(lichessTheme);
    expect(result).toEqual(lichessTheme);
    expect(result).not.toBe(lichessTheme);
  });

  it("should return copy of base theme when undefined partial is provided", () => {
    const result = mergeThemeWith(lichessTheme, undefined);
    expect(result).toEqual(lichessTheme);
  });
});
