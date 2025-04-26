import { Chess } from "chess.js";
import { getCustomSquareStyles } from "../board";
import { getGameInfo } from "../chess";

describe("Board Utilities", () => {
  describe("getCustomSquareStyles", () => {
    it("should return empty styles for initial position with no active square", () => {
      const game = new Chess();
      const orientation = "w";
      const info = getGameInfo(game, orientation);
      const activeSquare = null;

      const styles = getCustomSquareStyles(game, info, activeSquare);

      expect(Object.keys(styles).length).toBe(0);
    });

    it("should highlight last move squares", () => {
      const game = new Chess();
      game.move("e4");
      game.move("e5");
      const orientation = "w";
      const info = getGameInfo(game, orientation);
      const activeSquare = null;

      const styles = getCustomSquareStyles(game, info, activeSquare);

      expect(styles).toHaveProperty("e7");
      expect(styles).toHaveProperty("e5");
      expect(styles.e7).toHaveProperty(
        "backgroundColor",
        "rgba(255, 255, 0, 0.5)",
      );
      expect(styles.e5).toHaveProperty(
        "backgroundColor",
        "rgba(255, 255, 0, 0.5)",
      );
    });

    it("should highlight active square", () => {
      const game = new Chess();
      const orientation = "w";
      const info = getGameInfo(game, orientation);
      const activeSquare = "e2";

      const styles = getCustomSquareStyles(game, info, activeSquare);

      expect(styles).toHaveProperty("e2");
      expect(styles.e2).toHaveProperty(
        "backgroundColor",
        "rgba(255, 255, 0, 0.5)",
      );
    });

    it("should highlight destination squares for active square", () => {
      const game = new Chess();
      const orientation = "w";
      const info = getGameInfo(game, orientation);
      const activeSquare = "e2";

      const styles = getCustomSquareStyles(game, info, activeSquare);

      expect(styles).toHaveProperty("e3");
      expect(styles).toHaveProperty("e4");
      expect(styles.e3).toHaveProperty("background");
      expect(styles.e4).toHaveProperty("background");
    });

    it("should highlight destination squares with captures differently", () => {
      const game = new Chess(
        "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      );
      const orientation = "w";
      const info = getGameInfo(game, orientation);
      const activeSquare = "e4";

      const styles = getCustomSquareStyles(game, info, activeSquare);

      expect(styles).toHaveProperty("d5");
      expect(styles.d5.background).toContain("radial-gradient");
      expect(styles.d5.background).toContain("85%");
    });

    it("should highlight king in check", () => {
      // Set up a position where the king is in check
      const game = new Chess(
        "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5Q2/PPPP1PPP/RNB1KBNR b KQkq - 1 3",
      );

      // We need to manually set the isCheck flag in the info object
      const orientation = "b";
      const info = getGameInfo(game, orientation);
      const modifiedInfo = { ...info, isCheck: true };
      const activeSquare = null;

      const styles = getCustomSquareStyles(game, modifiedInfo, activeSquare);

      // Black king on e8 should be highlighted as in check
      expect(styles).toHaveProperty("e8");
      expect(styles.e8).toHaveProperty(
        "backgroundColor",
        "rgba(255, 0, 0, 0.5)",
      );
    });

    it("should combine multiple style effects", () => {
      const game = new Chess(
        "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5Q2/PPPP1PPP/RNB1KBNR b KQkq - 1 3",
      );
      game.move("Ke7");
      const orientation = "w";
      const info = getGameInfo(game, orientation);
      const activeSquare = "f3";

      const styles = getCustomSquareStyles(game, info, activeSquare);

      expect(styles).toHaveProperty("f3");
      expect(styles.f3).toHaveProperty(
        "backgroundColor",
        "rgba(255, 255, 0, 0.5)",
      );

      expect(styles).toHaveProperty("e8");
      expect(styles).toHaveProperty("e7");

      expect(Object.keys(styles).length).toBeGreaterThan(3);
    });

    it("should highlight empty destination squares differently from capture squares", () => {
      const game = new Chess();
      const orientation = "w";
      const info = getGameInfo(game, orientation);
      const activeSquare = "b1";

      const styles = getCustomSquareStyles(game, info, activeSquare);

      expect(styles).toHaveProperty("a3");
      expect(styles).toHaveProperty("c3");
      expect(styles.a3.background).toContain("25%");
      expect(styles.c3.background).toContain("25%");
    });
  });
});
