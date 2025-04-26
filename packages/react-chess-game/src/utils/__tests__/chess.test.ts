import { Chess, Color } from "chess.js";
import {
  cloneGame,
  getGameInfo,
  isLegalMove,
  requiresPromotion,
  getDestinationSquares,
  getCurrentFen,
} from "../chess";

describe("Chess Utilities", () => {
  describe("cloneGame", () => {
    it("should create a clone with the same state", () => {
      const game = new Chess();
      game.move("e4");
      game.move("e5");

      const clone = cloneGame(game);

      expect(clone.fen()).toEqual(game.fen());
      expect(clone.history()).toEqual(game.history());
      expect(clone).not.toBe(game); // Different instances
    });
  });

  describe("getGameInfo", () => {
    it("should return correct game info for initial position", () => {
      const game = new Chess();
      const orientation: Color = "w";

      const info = getGameInfo(game, orientation);

      expect(info.turn).toBe("w");
      expect(info.isPlayerTurn).toBe(true);
      expect(info.isOpponentTurn).toBe(false);
      expect(info.moveNumber).toBe(0);
      expect(info.lastMove).toBeUndefined();
      expect(info.isCheck).toBe(false);
      expect(info.isCheckmate).toBe(false);
      expect(info.isDraw).toBe(false);
      expect(info.isGameOver).toBe(false);
    });

    it("should return correct game info after moves", () => {
      const game = new Chess();
      game.move("e4");
      game.move("e5");
      const orientation: Color = "w";

      const info = getGameInfo(game, orientation);

      expect(info.turn).toBe("w");
      expect(info.isPlayerTurn).toBe(true);
      expect(info.isOpponentTurn).toBe(false);
      expect(info.moveNumber).toBe(2);
      expect(info.lastMove).toEqual(
        expect.objectContaining({
          from: "e7",
          to: "e5",
          piece: "p",
          color: "b",
        }),
      );
    });

    it("should return correct game info for checkmate position", () => {
      const game = new Chess();
      // Scholar's mate
      game.move("e4");
      game.move("e5");
      game.move("Qh5");
      game.move("Nc6");
      game.move("Bc4");
      game.move("Nf6");
      game.move("Qxf7");

      const whiteInfo = getGameInfo(game, "w");
      expect(whiteInfo.isCheckmate).toBe(true);
      expect(whiteInfo.isGameOver).toBe(true);
      expect(whiteInfo.hasPlayerWon).toBe(true);
      expect(whiteInfo.hasPlayerLost).toBe(false);

      const blackInfo = getGameInfo(game, "b");
      expect(blackInfo.hasPlayerWon).toBe(false);
      expect(blackInfo.hasPlayerLost).toBe(true);
    });
  });

  describe("isLegalMove", () => {
    it("should return true for legal moves", () => {
      const game = new Chess();

      expect(isLegalMove(game, "e2e4")).toBe(true);
      expect(isLegalMove(game, "g1f3")).toBe(true);
    });

    it("should return false for illegal moves", () => {
      const game = new Chess();

      expect(isLegalMove(game, "e2e5")).toBe(false);
      expect(isLegalMove(game, "e7e5")).toBe(false); // Black's move, but white to move
    });
  });

  describe("requiresPromotion", () => {
    it("should return true for moves requiring promotion", () => {
      const game = new Chess("8/P7/7k/8/8/8/8/7K w - - 0 1");

      expect(requiresPromotion(game, "a7a8")).toBe(true);
    });

    it("should return false for moves not requiring promotion", () => {
      const game = new Chess();

      expect(requiresPromotion(game, "e2e4")).toBe(false);
    });

    it("should return false for illegal moves", () => {
      const game = new Chess();

      expect(requiresPromotion(game, "e2e5")).toBe(false);
    });

    it("throws if game is not passed", () => {
      expect(() =>
        requiresPromotion(null as unknown as Chess, "e2e4"),
      ).toThrow();
    });
  });

  describe("getDestinationSquares", () => {
    it("should return correct destination squares for a piece", () => {
      const game = new Chess();

      const e2Destinations = getDestinationSquares(game, "e2");
      expect(e2Destinations).toContain("e3");
      expect(e2Destinations).toContain("e4");
      expect(e2Destinations.length).toBe(2);

      const g1Destinations = getDestinationSquares(game, "g1");
      expect(g1Destinations).toContain("f3");
      expect(g1Destinations).toContain("h3");
      expect(g1Destinations.length).toBe(2);
    });

    it("should return empty array for squares with no legal moves", () => {
      const game = new Chess();

      expect(getDestinationSquares(game, "e3")).toEqual([]);
    });
  });

  describe("getCurrentFen", () => {
    it("should return the initial position when moveIndex is -1", () => {
      const game = new Chess();
      game.move("e4");

      const initialFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      expect(getCurrentFen(initialFen, game, -1)).toBe(initialFen);
    });

    it("should return the FEN after specific moves", () => {
      const game = new Chess();
      const initialFen = game.fen();

      game.move("e4");
      game.move("e5");
      game.move("Nf3");

      // After 1 move (e4)
      const fenAfterOneMove = getCurrentFen(initialFen, game, 0);
      expect(fenAfterOneMove).toMatch(
        /rnbqkbnr\/pppppppp\/8\/8\/4P3\/8\/PPPP1PPP\/RNBQKBNR b KQkq/,
      );

      // After 2 moves (e4, e5)
      const fenAfterTwoMoves = getCurrentFen(initialFen, game, 1);
      expect(fenAfterTwoMoves).toMatch(
        /rnbqkbnr\/pppp1ppp\/8\/4p3\/4P3\/8\/PPPP1PPP\/RNBQKBNR w KQkq/,
      );

      // After 3 moves (e4, e5, Nf3)
      const fenAfterThreeMoves = getCurrentFen(initialFen, game, 2);
      expect(fenAfterThreeMoves).toMatch(
        /rnbqkbnr\/pppp1ppp\/8\/4p3\/4P3\/5N2\/PPPP1PPP\/RNBQKB1R b KQkq/,
      );
    });

    it("should use provided FEN as starting position", () => {
      const customFen =
        "1r2r1k1/pp3pbp/1qp3p1/2B5/2BP2b1/Q1n2N2/P4PPP/3R1K1R b - - 0 17";
      const game = new Chess();

      expect(getCurrentFen(customFen, game, -1)).toBe(customFen);
    });
  });
});
