import { Chess } from "chess.js";
import { getCustomSquareStyles, deepMergeChessboardOptions } from "../board";
import { getGameInfo } from "../chess";
import { defaultGameTheme } from "../../theme/defaults";
import type { ChessGameTheme } from "../../theme/types";

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

    describe("with custom theme", () => {
      const customTheme: ChessGameTheme = {
        ...defaultGameTheme,
        state: {
          ...defaultGameTheme.state,
          lastMove: "rgba(100, 200, 100, 0.6)",
          check: "rgba(200, 50, 50, 0.7)",
          activeSquare: "rgba(100, 100, 255, 0.5)",
        },
        indicators: {
          move: "rgba(50, 50, 50, 0.2)",
          capture: "rgba(200, 50, 50, 0.3)",
        },
      };

      it("should use custom theme colors for last move", () => {
        const game = new Chess();
        game.move("e4");
        const orientation = "w";
        const info = getGameInfo(game, orientation);
        const activeSquare = null;

        const styles = getCustomSquareStyles(
          game,
          info,
          activeSquare,
          customTheme,
        );

        expect(styles.e2).toHaveProperty(
          "backgroundColor",
          "rgba(100, 200, 100, 0.6)",
        );
        expect(styles.e4).toHaveProperty(
          "backgroundColor",
          "rgba(100, 200, 100, 0.6)",
        );
      });

      it("should use custom theme colors for active square", () => {
        const game = new Chess();
        const orientation = "w";
        const info = getGameInfo(game, orientation);
        const activeSquare = "e2";

        const styles = getCustomSquareStyles(
          game,
          info,
          activeSquare,
          customTheme,
        );

        expect(styles.e2).toHaveProperty(
          "backgroundColor",
          "rgba(100, 100, 255, 0.5)",
        );
      });

      it("should use custom theme colors for check", () => {
        const game = new Chess(
          "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5Q2/PPPP1PPP/RNB1KBNR b KQkq - 1 3",
        );
        const orientation = "b";
        const info = getGameInfo(game, orientation);
        const modifiedInfo = { ...info, isCheck: true };
        const activeSquare = null;

        const styles = getCustomSquareStyles(
          game,
          modifiedInfo,
          activeSquare,
          customTheme,
        );

        expect(styles.e8).toHaveProperty(
          "backgroundColor",
          "rgba(200, 50, 50, 0.7)",
        );
      });

      it("should use custom theme colors for move indicators", () => {
        const game = new Chess();
        const orientation = "w";
        const info = getGameInfo(game, orientation);
        const activeSquare = "e2";

        const styles = getCustomSquareStyles(
          game,
          info,
          activeSquare,
          customTheme,
        );

        expect(styles.e3.background).toContain("rgba(50, 50, 50, 0.2)");
        expect(styles.e4.background).toContain("rgba(50, 50, 50, 0.2)");
      });

      it("should use custom theme colors for capture indicators", () => {
        const game = new Chess(
          "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
        );
        const orientation = "w";
        const info = getGameInfo(game, orientation);
        const activeSquare = "e4";

        const styles = getCustomSquareStyles(
          game,
          info,
          activeSquare,
          customTheme,
        );

        expect(styles.d5.background).toContain("rgba(200, 50, 50, 0.3)");
      });
    });
  });

  describe("deepMergeChessboardOptions", () => {
    it("should deeply merge nested object options without overriding computed values", () => {
      const baseOptions = {
        squareStyles: {
          e4: {
            backgroundColor: "rgba(255, 255, 0, 0.5)", // Computed move highlighting
            background:
              "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)", // Move dot
          },
        },
        dropSquareStyle: {
          backgroundColor: "rgba(255, 255, 0, 0.4)",
          border: "2px dashed yellow",
        },
        showNotation: true,
        allowDrawingArrows: true,
      };

      const customOptions = {
        squareStyles: {
          e4: {
            border: "2px solid red", // Should be added without removing background
          },
          a1: {
            backgroundColor: "blue", // New square style
          },
        },
        dropSquareStyle: {
          backgroundColor: "rgba(0, 255, 0, 0.6)", // Should override backgroundColor but preserve border
        },
        showNotation: false, // Should override primitive
      };

      const result = deepMergeChessboardOptions(baseOptions, customOptions);

      // squareStyles should deep merge
      expect(result.squareStyles?.e4).toEqual({
        backgroundColor: "rgba(255, 255, 0, 0.5)",
        background:
          "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        border: "2px solid red",
      });
      expect(result.squareStyles?.a1).toEqual({
        backgroundColor: "blue",
      });

      // dropSquareStyle should deep merge
      expect(result.dropSquareStyle).toEqual({
        backgroundColor: "rgba(0, 255, 0, 0.6)",
        border: "2px dashed yellow",
      });

      // Primitives should override
      expect(result.showNotation).toBe(false);
      expect(result.allowDrawingArrows).toBe(true);
    });

    it("should handle function properties by overwriting them", () => {
      const baseOnSquareClick = jest.fn();
      const baseCanDragPiece = jest.fn();
      const customOnSquareClick = jest.fn();

      const baseOptions = {
        onSquareClick: baseOnSquareClick,
        canDragPiece: baseCanDragPiece,
        showNotation: true,
      };

      const customOptions = {
        onSquareClick: customOnSquareClick,
        // canDragPiece not provided - should keep base function
      };

      const result = deepMergeChessboardOptions(baseOptions, customOptions);

      // Custom function should replace base function
      expect(result.onSquareClick).toBe(customOnSquareClick);
      expect(result.onSquareClick).not.toBe(baseOnSquareClick);

      // Base function should be preserved when not overridden
      expect(result.canDragPiece).toBe(baseCanDragPiece);

      // Other properties should merge normally
      expect(result.showNotation).toBe(true);
    });

    it("should handle nested object properties by deep merging them", () => {
      const baseOptions = {
        darkSquareStyle: {
          backgroundColor: "#8B4513",
        },
      };

      const customOptions = {
        darkSquareStyle: {
          backgroundColor: "#654321",
          border: "1px solid black",
        },
      };

      const result = deepMergeChessboardOptions(baseOptions, customOptions);

      expect(result.darkSquareStyle).toEqual({
        backgroundColor: "#654321",
        border: "1px solid black",
      });
    });

    it("should handle undefined custom options gracefully", () => {
      const baseOptions = {
        squareStyles: {
          e4: { backgroundColor: "yellow" },
        },
        showNotation: true,
      };

      const result = deepMergeChessboardOptions(baseOptions, undefined);

      expect(result).toEqual(baseOptions);
      expect(result).not.toBe(baseOptions); // Should be a new object
    });

    it("should handle empty custom options", () => {
      const baseOptions = {
        squareStyles: {
          e4: { backgroundColor: "yellow" },
        },
        showNotation: true,
      };

      const result = deepMergeChessboardOptions(baseOptions, {});

      expect(result).toEqual(baseOptions);
      expect(result).not.toBe(baseOptions); // Should be a new object
    });

    it("should preserve complex nested object structures", () => {
      const baseOptions = {
        squareStyles: {
          e4: {
            backgroundColor: "rgba(255, 255, 0, 0.5)",
            background:
              "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
            border: "1px solid black",
          },
          d5: {
            backgroundColor: "rgba(0, 255, 0, 0.3)",
          },
        },
      };

      const customOptions = {
        squareStyles: {
          e4: {
            borderRadius: "4px", // Add new property
            backgroundColor: "rgba(255, 0, 0, 0.5)", // Override existing
            // background should be preserved from base
          },
          f6: {
            backgroundColor: "blue", // New square
          },
        },
      };

      const result = deepMergeChessboardOptions(baseOptions, customOptions);

      expect(result.squareStyles?.e4).toEqual({
        backgroundColor: "rgba(255, 0, 0, 0.5)", // Overridden
        background:
          "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)", // Preserved
        border: "1px solid black", // Preserved
        borderRadius: "4px", // Added
      });

      expect(result.squareStyles?.d5).toEqual({
        backgroundColor: "rgba(0, 255, 0, 0.3)", // Preserved from base
      });

      expect(result.squareStyles?.f6).toEqual({
        backgroundColor: "blue", // Added from custom
      });
    });

    it("should handle real-world Board component use case", () => {
      // Simulate the actual use case in Board component
      const computedSquareStyles = {
        e2: {
          backgroundColor: "rgba(255, 255, 0, 0.5)", // Active square highlight
        },
        e3: {
          background:
            "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)", // Move dot
        },
        e4: {
          background:
            "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)", // Move dot
        },
      };

      const baseOptions = {
        squareStyles: computedSquareStyles,
        boardOrientation: "white" as const,
        position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        showNotation: true,
        onSquareClick: jest.fn(),
      };

      const userCustomOptions = {
        squareStyles: {
          e4: {
            border: "2px solid red", // User wants to add border to a square that has move dots
          },
          a1: {
            backgroundColor: "lightblue", // User wants to highlight corner square
          },
        },
        showNotation: false, // User wants to hide notation
        onSquareClick: jest.fn(), // User provides custom click handler
      };

      const result = deepMergeChessboardOptions(baseOptions, userCustomOptions);

      // Move highlighting should be preserved while adding user's border
      expect(result.squareStyles?.e4).toEqual({
        background:
          "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        border: "2px solid red",
      });

      // User's new square style should be added
      expect(result.squareStyles?.a1).toEqual({
        backgroundColor: "lightblue",
      });

      // Other computed styles should be preserved
      expect(result.squareStyles?.e2).toEqual({
        backgroundColor: "rgba(255, 255, 0, 0.5)",
      });
      expect(result.squareStyles?.e3).toEqual({
        background:
          "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
      });

      // Primitives should be overridden
      expect(result.showNotation).toBe(false);
      expect(result.position).toBe(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );

      // Functions should be replaced
      expect(result.onSquareClick).toBe(userCustomOptions.onSquareClick);
      expect(result.onSquareClick).not.toBe(baseOptions.onSquareClick);
    });
  });
});
