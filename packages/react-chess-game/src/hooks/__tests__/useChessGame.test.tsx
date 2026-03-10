import { renderHook, act, RenderHookResult } from "@testing-library/react";
import { useChessGame, useChessGameProps } from "../useChessGame";
import { Chess, Color } from "chess.js";

describe("useChessGame", () => {
  describe("prop sync", () => {
    it("should update game state when fen prop changes", () => {
      const initialFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const newFen =
        "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";

      const { result, rerender } = renderHook(
        ({ fen }) => useChessGame({ fen }),
        { initialProps: { fen: initialFen } },
      );

      expect(result.current.currentFen).toBe(initialFen);

      // Make a move and navigate away from latest
      act(() => {
        result.current.methods.makeMove("e4");
      });
      expect(result.current.currentMoveIndex).toBe(0);

      // Rerender with new fen - should reset game and move index
      rerender({ fen: newFen });

      expect(result.current.currentFen).toBe(newFen);
      expect(result.current.currentMoveIndex).toBe(-1);
    });

    it("should update orientation when orientation prop changes", () => {
      const { result, rerender } = renderHook(
        ({ orientation }) => useChessGame({ orientation }),
        { initialProps: { orientation: "w" as Color } },
      );

      expect(result.current.orientation).toBe("w");

      rerender({ orientation: "b" });

      expect(result.current.orientation).toBe("b");
    });

    it("should not change orientation when prop is undefined on rerender", () => {
      const { result, rerender } = renderHook(
        ({ orientation }) => useChessGame({ orientation }),
        { initialProps: { orientation: "b" as Color | undefined } },
      );

      expect(result.current.orientation).toBe("b");

      // Undefined should not override user-set orientation
      rerender({ orientation: undefined });

      expect(result.current.orientation).toBe("b");
    });
  });
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useChessGame());

    expect(result.current.game).toBeInstanceOf(Chess);
    expect(result.current.orientation).toBe("w");
    expect(result.current.currentMoveIndex).toBe(-1);
    expect(result.current.isLatestMove).toBe(true);
    expect(result.current.info.turn).toBe("w");
  });

  it("should initialize with custom FEN and orientation", () => {
    const customFen =
      "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
    const customOrientation = "b";

    const { result } = renderHook(() =>
      useChessGame({ fen: customFen, orientation: customOrientation }),
    );

    expect(result.current.currentFen).toBe(customFen);
    expect(result.current.orientation).toBe(customOrientation);
    expect(result.current.info.isOpponentTurn).toBe(true);
    expect(result.current.info.isPlayerTurn).toBe(false);
  });

  it("should make a legal move", () => {
    const { result } = renderHook(() => useChessGame());

    act(() => {
      const success = result.current.methods.makeMove("e4");
      expect(success).toBe(true);
    });

    expect(result.current.game.history()).toContain("e4");
    expect(result.current.currentMoveIndex).toBe(0);
    expect(result.current.info.turn).toBe("b");
    expect(result.current.info.lastMove).toEqual(
      expect.objectContaining({
        from: "e2",
        to: "e4",
        piece: "p",
        color: "w",
      }),
    );
  });

  it("should reject an illegal move", () => {
    const { result } = renderHook(() => useChessGame());

    act(() => {
      const success = result.current.methods.makeMove("e5"); // Black's move but white to play
      expect(success).toBe(false);
    });

    expect(result.current.game.history().length).toBe(0);
    expect(result.current.currentMoveIndex).toBe(-1);
  });

  it("should not allow moves when not at latest position", () => {
    const { result } = renderHook(() => useChessGame());

    act(() => {
      result.current.methods.makeMove("e4");
    });

    act(() => {
      result.current.methods.makeMove("e5");
    });

    act(() => {
      result.current.methods.goToMove(0);
    });

    act(() => {
      const success = result.current.methods.makeMove("d4");
      expect(success).toBe(false);
    });

    expect(result.current.game.history()).toEqual(["e4", "e5"]);
    expect(result.current.currentMoveIndex).toBe(0);
    expect(result.current.isLatestMove).toBe(false);
  });

  it("should flip the board", () => {
    const { result } = renderHook(() => useChessGame());

    expect(result.current.orientation).toBe("w");

    act(() => {
      result.current.methods.flipBoard();
    });

    expect(result.current.orientation).toBe("b");

    act(() => {
      result.current.methods.flipBoard();
    });

    expect(result.current.orientation).toBe("w");
  });

  it("should set a new position and orientation", () => {
    const { result } = renderHook(() => useChessGame());

    act(() => {
      const startingFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      result.current.methods.setPosition(startingFen, "b");
    });

    expect(result.current.game.history().length).toBe(0);
    expect(result.current.orientation).toBe("b");
    expect(result.current.currentMoveIndex).toBe(-1);
    expect(result.current.info.turn).toBe("w");
    expect(result.current.info.isPlayerTurn).toBe(false);
    expect(result.current.info.isOpponentTurn).toBe(true);
  });

  describe("move history navigation", () => {
    let hookResult: RenderHookResult<
      ReturnType<typeof useChessGame>,
      useChessGameProps
    >;

    beforeEach(() => {
      hookResult = renderHook(() => useChessGame());

      act(() => {
        hookResult.result.current.methods.makeMove("e4");
      });

      act(() => {
        hookResult.result.current.methods.makeMove("e5");
      });

      act(() => {
        hookResult.result.current.methods.makeMove("Nf3");
      });

      act(() => {
        hookResult.result.current.methods.makeMove("Nc6");
      });
    });

    it("should navigate to a specific move", () => {
      act(() => {
        hookResult.result.current.methods.goToMove(1);
      });

      expect(hookResult.result.current.currentMoveIndex).toBe(1);
      expect(hookResult.result.current.isLatestMove).toBe(false);
      expect(hookResult.result.current.currentFen).toContain(
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w",
      );
    });

    it("should go to the start position", () => {
      act(() => {
        hookResult.result.current.methods.goToStart();
      });

      expect(hookResult.result.current.currentMoveIndex).toBe(-1);
      expect(hookResult.result.current.isLatestMove).toBe(true);
      expect(hookResult.result.current.currentFen).toContain(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w",
      );
    });

    it("should go to the end position", () => {
      act(() => {
        hookResult.result.current.methods.goToEnd();
      });

      expect(hookResult.result.current.currentMoveIndex).toBe(3);
      expect(hookResult.result.current.isLatestMove).toBe(true);
      expect(hookResult.result.current.currentFen).toContain(
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w",
      );
    });

    it("should go to the previous move", () => {
      act(() => {
        hookResult.result.current.methods.goToMove(2);
      });

      act(() => {
        hookResult.result.current.methods.goToPreviousMove();
      });

      expect(hookResult.result.current.currentMoveIndex).toBe(1);
      expect(hookResult.result.current.currentFen).toContain(
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w",
      );
    });

    it("should go to the next move", () => {
      act(() => {
        hookResult.result.current.methods.goToMove(1);
      });

      act(() => {
        hookResult.result.current.methods.goToNextMove();
      });

      expect(hookResult.result.current.currentMoveIndex).toBe(2);
      expect(hookResult.result.current.currentFen).toContain(
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b",
      );
    });

    it("should not go past the bounds of the move history", () => {
      act(() => {
        hookResult.result.current.methods.goToMove(100);
      });

      expect(hookResult.result.current.currentMoveIndex).toBe(3);

      act(() => {
        hookResult.result.current.methods.goToMove(-10);
      });

      expect(hookResult.result.current.currentMoveIndex).toBe(3);
    });
  });
});
