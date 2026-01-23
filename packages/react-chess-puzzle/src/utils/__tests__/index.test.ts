import { Chess, Move } from "chess.js";
import {
  getOrientation,
  getCustomSquareStyles,
  stringToMove,
  Puzzle,
} from "../index";

describe("Puzzle Utilities", () => {
  describe("getOrientation", () => {
    it("should return white when it's white's turn", () => {
      const puzzle: Puzzle = {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves: ["e4", "e5", "Nf3"],
      };

      expect(getOrientation(puzzle)).toBe("w");
    });

    it("should return black when it's black's turn", () => {
      const puzzle: Puzzle = {
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
        moves: ["e5", "Nf3", "Nc6"],
      };

      expect(getOrientation(puzzle)).toBe("b");
    });

    it("should make first move if makeFirstMove is true", () => {
      const puzzle: Puzzle = {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves: ["e4", "e5", "Nf3"],
        makeFirstMove: true,
      };

      // After e4, it should be black's turn
      expect(getOrientation(puzzle)).toBe("b");
    });
  });

  describe("getCustomSquareStyles", () => {
    const game = new Chess();

    it("should return empty object when no conditions are met", () => {
      const styles = getCustomSquareStyles("not-started", "none", true, game);
      expect(styles).toEqual({});
    });

    it("should highlight last move with fail color when status is failed", () => {
      const testGame = new Chess();
      testGame.move("e4");

      const styles = getCustomSquareStyles("failed", "none", true, testGame);

      expect(styles["e2"]).toHaveProperty(
        "backgroundColor",
        "rgba(201, 52, 48, 0.5)",
      );
      expect(styles["e4"]).toHaveProperty(
        "backgroundColor",
        "rgba(201, 52, 48, 0.5)",
      );
    });

    it("should highlight last move with success color when status is solved", () => {
      const testGame = new Chess();
      testGame.move("e4");

      const styles = getCustomSquareStyles("solved", "none", true, testGame);

      expect(styles["e2"]).toHaveProperty(
        "backgroundColor",
        "rgba(172, 206, 89, 0.5)",
      );
      expect(styles["e4"]).toHaveProperty(
        "backgroundColor",
        "rgba(172, 206, 89, 0.5)",
      );
    });

    it("should highlight move source square when hint is piece", () => {
      const testGame = new Chess();
      testGame.move("e4");
      const nextMove = testGame.history({ verbose: true })[0] as Move;

      const styles = getCustomSquareStyles(
        "in-progress",
        "piece",
        true,
        game,
        nextMove,
      );

      expect(styles["e2"]).toHaveProperty(
        "backgroundColor",
        "rgba(27, 172, 166, 0.5)",
      );
      expect(styles["e4"]).toBeUndefined();
    });

    it("should highlight move source and destination when hint is move", () => {
      const testGame = new Chess();
      testGame.move("e4");
      const nextMove = testGame.history({ verbose: true })[0] as Move;

      const styles = getCustomSquareStyles(
        "in-progress",
        "move",
        true,
        game,
        nextMove,
      );

      expect(styles["e2"]).toHaveProperty(
        "backgroundColor",
        "rgba(27, 172, 166, 0.5)",
      );
      expect(styles["e4"]).toHaveProperty(
        "backgroundColor",
        "rgba(27, 172, 166, 0.5)",
      );
    });

    it("should highlight with success color when not failed and not player turn", () => {
      const testGame = new Chess();
      testGame.move("e4");

      const styles = getCustomSquareStyles(
        "in-progress",
        "none",
        false,
        testGame,
      );

      expect(styles["e2"]).toHaveProperty(
        "backgroundColor",
        "rgba(172, 206, 89, 0.5)",
      );
      expect(styles["e4"]).toHaveProperty(
        "backgroundColor",
        "rgba(172, 206, 89, 0.5)",
      );
    });
  });

  describe("stringToMove", () => {
    const game = new Chess();

    it("should return null for null or undefined input", () => {
      expect(stringToMove(game, null)).toBeNull();
      expect(stringToMove(game, undefined)).toBeNull();
    });

    it("should return a valid move object for legal moves", () => {
      const move = stringToMove(game, "e4");

      expect(move).not.toBeNull();
      expect(move?.from).toBe("e2");
      expect(move?.to).toBe("e4");
      expect(move?.piece).toBe("p");
    });

    it("should return null for illegal moves", () => {
      expect(stringToMove(game, "e5")).toBeNull();
      expect(stringToMove(game, "invalid")).toBeNull();
    });

    it("should not modify the original game", () => {
      const originalFen = game.fen();
      stringToMove(game, "e4");

      expect(game.fen()).toBe(originalFen);
    });
  });
});
