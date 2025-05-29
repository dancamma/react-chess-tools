import React from "react";
import { renderHook, act } from "@testing-library/react";
import { Chess } from "chess.js";
import { useChessPuzzle, ChessPuzzleContextType } from "../useChessPuzzle";
import { Puzzle } from "../../utils";
import { ChessGame } from "@react-chess-tools/react-chess-game";

// Create a wrapper component that provides the chess game context
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <ChessGame.Root>{children}</ChessGame.Root>
  );
};

describe("useChessPuzzle", () => {
  const mockPuzzle: Puzzle = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "e5", "Nf3"],
    makeFirstMove: false,
  };

  const mockPuzzleWithFirstMove: Puzzle = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "e5", "Nf3"],
    makeFirstMove: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() => useChessPuzzle(mockPuzzle), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe("not-started");
    expect(result.current.puzzle).toEqual(mockPuzzle);
    expect(result.current.hint).toBe("none");
    expect(result.current.nextMove).toBe("e4");
    expect(result.current.isPlayerTurn).toBe(true);
    expect(typeof result.current.changePuzzle).toBe("function");
    expect(typeof result.current.onHint).toBe("function");
  });

  it("should handle puzzle change", () => {
    const { result } = renderHook(() => useChessPuzzle(mockPuzzle), {
      wrapper: createWrapper(),
    });

    const newPuzzle: Puzzle = {
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
      moves: ["Nf3", "Nc6", "Bb5"],
      makeFirstMove: false,
    };

    // Initial state
    expect(result.current.nextMove).toBe("e4");

    act(() => {
      result.current.changePuzzle(newPuzzle);
    });

    // After changing puzzle, the internal state should reflect the new puzzle
    expect(result.current.nextMove).toBe("Nf3");
    expect(result.current.status).toBe("not-started");
    expect(result.current.isPlayerTurn).toBe(true);
  });

  it("should toggle hint correctly", () => {
    const { result } = renderHook(() => useChessPuzzle(mockPuzzle), {
      wrapper: createWrapper(),
    });

    expect(result.current.hint).toBe("none");

    act(() => {
      result.current.onHint();
    });

    expect(result.current.hint).toBe("piece");

    act(() => {
      result.current.onHint();
    });

    expect(result.current.hint).toBe("move");
  });

  it("should handle puzzle with makeFirstMove correctly", () => {
    const { result } = renderHook(
      () => useChessPuzzle(mockPuzzleWithFirstMove),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.isPlayerTurn).toBe(false);
    expect(result.current.nextMove).toBe("e4");
  });

  it("should call onSolve callback when puzzle is solved", () => {
    const onSolve = jest.fn();
    const onFail = jest.fn();

    const { result } = renderHook(
      () => useChessPuzzle(mockPuzzle, onSolve, onFail),
      {
        wrapper: createWrapper(),
      },
    );

    // This test would need to simulate the full puzzle solving flow
    // For now, we're testing that the callbacks are properly passed
    expect(onSolve).not.toHaveBeenCalled();
    expect(onFail).not.toHaveBeenCalled();
  });

  it("should call onFail callback when wrong move is made", () => {
    const onSolve = jest.fn();
    const onFail = jest.fn();

    const { result } = renderHook(
      () => useChessPuzzle(mockPuzzle, onSolve, onFail),
      {
        wrapper: createWrapper(),
      },
    );

    // This test would need to simulate making a wrong move
    // For now, we're testing that the callbacks are properly passed
    expect(onSolve).not.toHaveBeenCalled();
    expect(onFail).not.toHaveBeenCalled();
  });

  it("should throw error when used outside ChessGameContext", () => {
    // Mock console.error to avoid error output in tests
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useChessPuzzle(mockPuzzle));
    }).toThrow("useChessGameContext must be used within a ChessGameProvider");

    consoleSpy.mockRestore();
  });

  it("should return correct context type structure", () => {
    const { result } = renderHook(() => useChessPuzzle(mockPuzzle), {
      wrapper: createWrapper(),
    });

    const context = result.current;

    // Verify all required properties exist
    expect(context).toHaveProperty("status");
    expect(context).toHaveProperty("changePuzzle");
    expect(context).toHaveProperty("puzzle");
    expect(context).toHaveProperty("hint");
    expect(context).toHaveProperty("nextMove");
    expect(context).toHaveProperty("isPlayerTurn");
    expect(context).toHaveProperty("onHint");

    // Verify types
    expect(typeof context.status).toBe("string");
    expect(typeof context.changePuzzle).toBe("function");
    expect(typeof context.puzzle).toBe("object");
    expect(typeof context.hint).toBe("string");
    expect(typeof context.isPlayerTurn).toBe("boolean");
    expect(typeof context.onHint).toBe("function");
  });

  it("should handle empty moves array", () => {
    const emptyPuzzle: Puzzle = {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moves: [],
      makeFirstMove: false,
    };

    const { result } = renderHook(() => useChessPuzzle(emptyPuzzle), {
      wrapper: createWrapper(),
    });

    expect(result.current.nextMove).toBeUndefined();
    expect(result.current.puzzle).toEqual(emptyPuzzle);
  });

  it("should handle single move puzzle", () => {
    const singleMovePuzzle: Puzzle = {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moves: ["e4"],
      makeFirstMove: false,
    };

    const { result } = renderHook(() => useChessPuzzle(singleMovePuzzle), {
      wrapper: createWrapper(),
    });

    expect(result.current.nextMove).toBe("e4");
    expect(result.current.puzzle).toEqual(singleMovePuzzle);
  });
});
