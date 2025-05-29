import React from "react";
import { renderHook } from "@testing-library/react";
import {
  useChessPuzzleContext,
  ChessPuzzleContext,
} from "../useChessPuzzleContext";
import { ChessPuzzleContextType } from "../useChessPuzzle";
import { Puzzle } from "../../utils";

describe("useChessPuzzleContext", () => {
  const mockPuzzle: Puzzle = {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: ["e4", "e5", "Nf3"],
    makeFirstMove: false,
  };

  const mockContextValue: ChessPuzzleContextType = {
    status: "not-started",
    changePuzzle: jest.fn(),
    puzzle: mockPuzzle,
    hint: "none",
    nextMove: "e4",
    isPlayerTurn: true,
    onHint: jest.fn(),
  };

  it("should return context value when used within provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChessPuzzleContext.Provider value={mockContextValue}>
        {children}
      </ChessPuzzleContext.Provider>
    );

    const { result } = renderHook(() => useChessPuzzleContext(), { wrapper });

    expect(result.current).toEqual(mockContextValue);
  });

  it("should throw error when used outside provider", () => {
    // Mock console.error to avoid error output in tests
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useChessPuzzleContext());
    }).toThrow("useChessGameContext must be used within a ChessGameProvider");

    consoleSpy.mockRestore();
  });

  it("should throw error when context value is null", () => {
    // Mock console.error to avoid error output in tests
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChessPuzzleContext.Provider value={null}>
        {children}
      </ChessPuzzleContext.Provider>
    );

    expect(() => {
      renderHook(() => useChessPuzzleContext(), { wrapper });
    }).toThrow("useChessGameContext must be used within a ChessGameProvider");

    consoleSpy.mockRestore();
  });

  it("should provide access to all context properties", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ChessPuzzleContext.Provider value={mockContextValue}>
        {children}
      </ChessPuzzleContext.Provider>
    );

    const { result } = renderHook(() => useChessPuzzleContext(), { wrapper });

    expect(result.current.status).toBe("not-started");
    expect(result.current.puzzle).toEqual(mockPuzzle);
    expect(result.current.hint).toBe("none");
    expect(result.current.nextMove).toBe("e4");
    expect(result.current.isPlayerTurn).toBe(true);
    expect(typeof result.current.changePuzzle).toBe("function");
    expect(typeof result.current.onHint).toBe("function");
  });

  it("should allow context value updates", () => {
    let contextValue = { ...mockContextValue };

    const TestComponent = ({ children }: { children: React.ReactNode }) => (
      <ChessPuzzleContext.Provider value={contextValue}>
        {children}
      </ChessPuzzleContext.Provider>
    );

    const { result, rerender } = renderHook(() => useChessPuzzleContext(), {
      wrapper: TestComponent,
    });

    expect(result.current.status).toBe("not-started");

    // Update context value
    contextValue = { ...mockContextValue, status: "in-progress" };
    rerender();

    expect(result.current.status).toBe("in-progress");
  });
});
