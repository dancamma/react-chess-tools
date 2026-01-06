import { defaultPuzzleTheme } from "../defaults";
import { defaultGameTheme } from "@react-chess-tools/react-chess-game";

describe("defaultPuzzleTheme", () => {
  describe("backward compatibility", () => {
    it("should have the original success color", () => {
      expect(defaultPuzzleTheme.puzzle.success).toBe("rgba(172, 206, 89, 0.5)");
    });

    it("should have the original failure color", () => {
      expect(defaultPuzzleTheme.puzzle.failure).toBe("rgba(201, 52, 48, 0.5)");
    });

    it("should have the original hint color", () => {
      expect(defaultPuzzleTheme.puzzle.hint).toBe("rgba(27, 172, 166, 0.5)");
    });
  });

  describe("inheritance from game theme", () => {
    it("should include all game theme properties", () => {
      expect(defaultPuzzleTheme.board).toBeDefined();
      expect(defaultPuzzleTheme.state).toBeDefined();
      expect(defaultPuzzleTheme.indicators).toBeDefined();
    });

    it("should have the same board colors as game theme", () => {
      expect(defaultPuzzleTheme.board).toEqual(defaultGameTheme.board);
    });

    it("should have the same state colors as game theme", () => {
      expect(defaultPuzzleTheme.state).toEqual(defaultGameTheme.state);
    });

    it("should have the same indicator colors as game theme", () => {
      expect(defaultPuzzleTheme.indicators).toEqual(
        defaultGameTheme.indicators,
      );
    });
  });

  describe("structure", () => {
    it("should have puzzle property with all required colors", () => {
      expect(defaultPuzzleTheme.puzzle).toHaveProperty("success");
      expect(defaultPuzzleTheme.puzzle).toHaveProperty("failure");
      expect(defaultPuzzleTheme.puzzle).toHaveProperty("hint");
    });
  });
});
