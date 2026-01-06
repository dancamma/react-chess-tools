import { mergePuzzleTheme } from "../utils";
import { defaultPuzzleTheme } from "../defaults";

describe("mergePuzzleTheme", () => {
  it("should return default puzzle theme when no partial theme is provided", () => {
    const result = mergePuzzleTheme();
    expect(result).toEqual(defaultPuzzleTheme);
  });

  it("should return default puzzle theme when undefined is provided", () => {
    const result = mergePuzzleTheme(undefined);
    expect(result).toEqual(defaultPuzzleTheme);
  });

  it("should return a new object, not a reference to default", () => {
    const result = mergePuzzleTheme();
    expect(result).not.toBe(defaultPuzzleTheme);
  });

  it("should override puzzle-specific colors", () => {
    const result = mergePuzzleTheme({
      puzzle: { hint: "rgba(0, 255, 255, 0.5)" },
    });

    expect(result.puzzle.hint).toBe("rgba(0, 255, 255, 0.5)");
    // Other puzzle colors should remain default
    expect(result.puzzle.success).toBe(defaultPuzzleTheme.puzzle.success);
    expect(result.puzzle.failure).toBe(defaultPuzzleTheme.puzzle.failure);
  });

  it("should override all puzzle colors at once", () => {
    const result = mergePuzzleTheme({
      puzzle: {
        success: "rgba(0, 255, 0, 0.5)",
        failure: "rgba(255, 0, 0, 0.5)",
        hint: "rgba(0, 0, 255, 0.5)",
      },
    });

    expect(result.puzzle.success).toBe("rgba(0, 255, 0, 0.5)");
    expect(result.puzzle.failure).toBe("rgba(255, 0, 0, 0.5)");
    expect(result.puzzle.hint).toBe("rgba(0, 0, 255, 0.5)");
  });

  it("should override inherited game theme properties", () => {
    const result = mergePuzzleTheme({
      state: { lastMove: "rgba(100, 200, 100, 0.6)" },
      board: { lightSquare: { backgroundColor: "#ffffff" } },
    });

    expect(result.state.lastMove).toBe("rgba(100, 200, 100, 0.6)");
    expect(result.board.lightSquare).toEqual({ backgroundColor: "#ffffff" });
    // Puzzle colors should remain default
    expect(result.puzzle).toEqual(defaultPuzzleTheme.puzzle);
  });

  it("should allow overriding both game and puzzle properties", () => {
    const result = mergePuzzleTheme({
      state: { check: "rgba(255, 100, 100, 0.8)" },
      puzzle: { success: "rgba(100, 255, 100, 0.8)" },
    });

    expect(result.state.check).toBe("rgba(255, 100, 100, 0.8)");
    expect(result.puzzle.success).toBe("rgba(100, 255, 100, 0.8)");
  });

  it("should preserve unmentioned theme properties", () => {
    const result = mergePuzzleTheme({
      puzzle: { hint: "rgba(0, 255, 255, 0.5)" },
    });

    expect(result.board).toEqual(defaultPuzzleTheme.board);
    expect(result.state).toEqual(defaultPuzzleTheme.state);
    expect(result.indicators).toEqual(defaultPuzzleTheme.indicators);
  });
});
