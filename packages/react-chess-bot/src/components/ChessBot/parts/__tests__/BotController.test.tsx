/**
 * Tests for BotController component.
 *
 * These tests mock both ChessGame and Stockfish contexts to test the
 * bot's decision-making logic in isolation.
 */

import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { BotController } from "../BotController";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";
import { useStockfish } from "@react-chess-tools/react-chess-stockfish";

// Mock useChessGameContext
jest.mock("@react-chess-tools/react-chess-game", () => ({
  useChessGameContext: jest.fn(),
}));

// Mock useStockfish
jest.mock("@react-chess-tools/react-chess-stockfish", () => ({
  useStockfish: jest.fn(),
}));

const mockedUseChessGameContext = useChessGameContext as jest.MockedFunction<
  typeof useChessGameContext
>;
const mockedUseStockfish = useStockfish as jest.MockedFunction<
  typeof useStockfish
>;

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AFTER_E4_FEN =
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

// Helper to create mock game context
function createMockGameContext(overrides = {}) {
  return {
    currentFen: START_FEN,
    info: {
      turn: "w" as const,
      isGameOver: false,
    },
    methods: {
      makeMove: jest.fn().mockReturnValue(true),
    },
    ...overrides,
  };
}

// Helper to create mock stockfish context
function createMockStockfishContext(overrides = {}) {
  return {
    fen: START_FEN,
    info: {
      hasResults: true,
      status: "ready" as const,
      isEngineThinking: false,
    },
    methods: {
      getBestMove: jest.fn().mockReturnValue({ san: "e4", uci: "e2e4" }),
      startAnalysis: jest.fn(),
      stopAnalysis: jest.fn(),
      setConfig: jest.fn(),
    },
    ...overrides,
  };
}

describe("BotController", () => {
  let onThinkingChange: jest.Mock;
  let onMoveComplete: jest.Mock;
  let onBotMoveStart: jest.Mock;
  let onError: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    onThinkingChange = jest.fn();
    onMoveComplete = jest.fn();
    onBotMoveStart = jest.fn();
    onError = jest.fn();

    mockedUseChessGameContext.mockReturnValue(createMockGameContext() as any);
    mockedUseStockfish.mockReturnValue(createMockStockfishContext() as any);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // Helper to render BotController with default props
  const renderBotController = (props = {}) => {
    return render(
      <BotController
        playAs="white"
        minDelayMs={0}
        maxDelayMs={0}
        onThinkingChange={onThinkingChange}
        onMoveComplete={onMoveComplete}
        onBotMoveStart={onBotMoveStart}
        onError={onError}
        {...props}
      />,
    );
  };

  describe("turn detection", () => {
    it("makes a move when it's the bot's turn (white)", async () => {
      const mockMakeMove = jest.fn().mockReturnValue(true);
      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockMakeMove).toHaveBeenCalledWith("e4");
      });
    });

    it("makes a move when it's the bot's turn (black)", async () => {
      const mockMakeMove = jest.fn().mockReturnValue(true);
      const mockGetBestMove = jest
        .fn()
        .mockReturnValue({ san: "e5", uci: "e7e5" });

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "b", isGameOver: false },
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            ...createMockStockfishContext().methods,
            getBestMove: mockGetBestMove,
          },
        }) as any,
      );

      renderBotController({ playAs: "black" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockMakeMove).toHaveBeenCalledWith("e5");
      });
    });

    it("does NOT move when it's not the bot's turn", () => {
      const mockMakeMove = jest.fn();

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "b", isGameOver: false }, // Black's turn
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      renderBotController({ playAs: "white" }); // Bot plays white

      act(() => {
        jest.runAllTimers();
      });

      expect(mockMakeMove).not.toHaveBeenCalled();
      expect(onBotMoveStart).not.toHaveBeenCalled();
    });
  });

  describe("game over detection", () => {
    it("does NOT move when game is over", () => {
      const mockMakeMove = jest.fn();

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: true },
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      expect(mockMakeMove).not.toHaveBeenCalled();
      expect(onBotMoveStart).not.toHaveBeenCalled();
    });
  });

  describe("hasResults waiting", () => {
    it("does NOT move when hasResults is false", () => {
      const mockMakeMove = jest.fn();

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: {
            hasResults: false,
            status: "analyzing",
            isEngineThinking: true,
          },
        }) as any,
      );

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      expect(mockMakeMove).not.toHaveBeenCalled();
    });
  });

  describe("hasMovedForPosition tracking", () => {
    it("does NOT move twice for the same position", async () => {
      const mockMakeMove = jest.fn().mockReturnValue(true);

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      const { rerender } = renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(mockMakeMove).toHaveBeenCalledTimes(1);
      });

      // Rerender with same position (turn still white for some reason)
      mockMakeMove.mockClear();
      rerender(
        <BotController
          playAs="white"
          minDelayMs={0}
          maxDelayMs={0}
          onThinkingChange={onThinkingChange}
          onMoveComplete={onMoveComplete}
          onBotMoveStart={onBotMoveStart}
          onError={onError}
        />,
      );

      act(() => {
        jest.runAllTimers();
      });

      // Should not move again for the same position
      expect(mockMakeMove).not.toHaveBeenCalled();
    });
  });

  describe("race condition handling", () => {
    it("aborts move if FEN changes during delay", async () => {
      const mockMakeMove = jest.fn().mockReturnValue(true);
      let currentFen = START_FEN;

      mockedUseChessGameContext.mockImplementation(
        () =>
          createMockGameContext({
            currentFen,
            info: { turn: "w", isGameOver: false },
            methods: { makeMove: mockMakeMove },
          }) as any,
      );

      const { rerender } = renderBotController({
        playAs: "white",
        minDelayMs: 100,
        maxDelayMs: 100,
      });

      // Should have started thinking
      expect(onBotMoveStart).toHaveBeenCalled();
      expect(onThinkingChange).toHaveBeenCalledWith(true);

      // Simulate FEN change during delay (opponent moved)
      currentFen = AFTER_E4_FEN;

      rerender(
        <BotController
          playAs="white"
          minDelayMs={100}
          maxDelayMs={100}
          onThinkingChange={onThinkingChange}
          onMoveComplete={onMoveComplete}
          onBotMoveStart={onBotMoveStart}
          onError={onError}
        />,
      );

      // Complete the delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        // Move should be aborted because FEN changed
        expect(mockMakeMove).not.toHaveBeenCalled();
        expect(onThinkingChange).toHaveBeenLastCalledWith(false);
      });
    });
  });

  describe("error handling", () => {
    it("fires onError when getBestMove returns null with hasResults=true", async () => {
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: { hasResults: true, status: "ready", isEngineThinking: false },
          methods: {
            getBestMove: jest.fn().mockReturnValue(null),
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }) as any,
      );

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
        }) as any,
      );

      renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        expect(onError.mock.calls[0][0].message).toContain(
          "Engine returned no best move",
        );
      });
    });

    it("fires onError when makeMove throws", async () => {
      const mockMakeMove = jest.fn().mockImplementation(() => {
        throw new Error("Invalid move");
      });

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        expect(onError.mock.calls[0][0].message).toContain("Invalid move");
      });
    });

    it("fires onError when makeMove returns false", async () => {
      const mockMakeMove = jest.fn().mockReturnValue(false);

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        expect(onError.mock.calls[0][0].message).toContain(
          "makeMove returned false",
        );
      });
    });
  });

  describe("delay", () => {
    it("respects minDelayMs and maxDelayMs range", async () => {
      const mockMakeMove = jest.fn().mockReturnValue(true);

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      renderBotController({
        playAs: "white",
        minDelayMs: 500,
        maxDelayMs: 1000,
      });

      // Should not have moved immediately
      expect(mockMakeMove).not.toHaveBeenCalled();
      expect(onBotMoveStart).toHaveBeenCalled();

      // Advance time by less than minDelay
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Still should not have moved
      expect(mockMakeMove).not.toHaveBeenCalled();

      // Advance past max delay
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockMakeMove).toHaveBeenCalled();
      });
    });

    it("fires onBotMoveStart before delay", () => {
      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
        }) as any,
      );

      renderBotController({
        playAs: "white",
        minDelayMs: 1000,
        maxDelayMs: 1000,
      });

      // onBotMoveStart should be called immediately, before delay
      expect(onBotMoveStart).toHaveBeenCalled();
      expect(onThinkingChange).toHaveBeenCalledWith(true);
    });
  });

  describe("cleanup", () => {
    it("clears timeout on unmount", () => {
      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
        }) as any,
      );

      const { unmount } = renderBotController({
        playAs: "white",
        minDelayMs: 1000,
        maxDelayMs: 1000,
      });

      // Thinking should have started
      expect(onThinkingChange).toHaveBeenCalledWith(true);

      unmount();

      // Advance timers after unmount
      act(() => {
        jest.runAllTimers();
      });

      // Should not have called onThinkingChange again (no state update after unmount)
      expect(onThinkingChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("callbacks", () => {
    it("fires onMoveComplete with correct move data", async () => {
      const mockMakeMove = jest.fn().mockReturnValue(true);
      const mockGetBestMove = jest
        .fn()
        .mockReturnValue({ san: "Nf3", uci: "g1f3" });

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "w", isGameOver: false },
          methods: { makeMove: mockMakeMove },
        }) as any,
      );

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            ...createMockStockfishContext().methods,
            getBestMove: mockGetBestMove,
          },
        }) as any,
      );

      renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(onMoveComplete).toHaveBeenCalledWith({
          san: "Nf3",
          uci: "g1f3",
        });
      });
    });
  });
});
