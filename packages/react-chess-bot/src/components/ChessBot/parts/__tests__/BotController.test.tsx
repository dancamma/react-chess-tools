/**
 * Tests for BotController component.
 *
 * These tests use the real ChessGame context and mock only Stockfish,
 * since chess.js is a pure, fast logic library that should be tested against.
 */

import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import {
  useStockfish,
  StockfishContextValue,
} from "@react-chess-tools/react-chess-stockfish";
import { BotController } from "../BotController";

// Type for deeply partial objects (for test overrides)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Mock useStockfish only - ChessGame uses real chess.js
jest.mock("@react-chess-tools/react-chess-stockfish", () => ({
  useStockfish: jest.fn(),
}));

const mockedUseStockfish = useStockfish as jest.MockedFunction<
  typeof useStockfish
>;

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AFTER_E4_FEN =
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

// Helper to create mock stockfish context with minimal required fields for tests
function createMockStockfishContext(
  overrides: DeepPartial<StockfishContextValue> = {},
): StockfishContextValue {
  const defaults: StockfishContextValue = {
    fen: START_FEN,
    info: {
      hasResults: true,
      status: "ready" as const,
      isEngineThinking: false,
      evaluation: null,
      normalizedEvaluation: 0,
      bestLine: null,
      principalVariations: [],
      depth: 0,
      error: null,
    },
    methods: {
      getBestMove: jest.fn().mockReturnValue({ san: "e4", uci: "e2e4" }),
      startAnalysis: jest.fn(),
      stopAnalysis: jest.fn(),
      setConfig: jest.fn(),
    },
  };

  return {
    fen: overrides.fen ?? defaults.fen,
    info: { ...defaults.info, ...overrides.info },
    methods: { ...defaults.methods, ...overrides.methods },
  } as StockfishContextValue;
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

    mockedUseStockfish.mockReturnValue(createMockStockfishContext());
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // Helper to render BotController wrapped in real ChessGame context
  const renderBotController = (
    props: {
      playAs?: "white" | "black";
      minDelayMs?: number;
      maxDelayMs?: number;
      fen?: string;
    } = {},
  ) => {
    return render(
      <ChessGame.Root fen={props.fen}>
        <BotController
          playAs={props.playAs ?? "white"}
          minDelayMs={props.minDelayMs ?? 0}
          maxDelayMs={props.maxDelayMs ?? 0}
          onThinkingChange={onThinkingChange}
          onMoveComplete={onMoveComplete}
          onBotMoveStart={onBotMoveStart}
          onError={onError}
        />
      </ChessGame.Root>,
    );
  };

  describe("turn detection", () => {
    it("makes a move when it's the bot's turn (white)", async () => {
      const mockGetBestMove = jest
        .fn()
        .mockReturnValue({ san: "e4", uci: "e2e4" });

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            getBestMove: mockGetBestMove,
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
      );

      renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(onMoveComplete).toHaveBeenCalledWith({
          san: "e4",
          uci: "e2e4",
        });
      });
    });

    it("makes a move when it's the bot's turn (black)", async () => {
      const mockGetBestMove = jest
        .fn()
        .mockReturnValue({ san: "e5", uci: "e7e5" });

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            getBestMove: mockGetBestMove,
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
      );

      // Start from position where it's black's turn
      renderBotController({ playAs: "black", fen: AFTER_E4_FEN });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(onMoveComplete).toHaveBeenCalledWith({
          san: "e5",
          uci: "e7e5",
        });
      });
    });

    it("does NOT move when it's not the bot's turn", () => {
      // Bot plays white, but it's black's turn (after e4)
      renderBotController({ playAs: "white", fen: AFTER_E4_FEN });

      act(() => {
        jest.runAllTimers();
      });

      expect(onMoveComplete).not.toHaveBeenCalled();
      expect(onBotMoveStart).not.toHaveBeenCalled();
    });
  });

  describe("game over detection", () => {
    it("does NOT move when game is over (checkmate)", () => {
      // Fool's mate position - black has checkmated white
      const checkmateFen =
        "rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3";

      renderBotController({ playAs: "white", fen: checkmateFen });

      act(() => {
        jest.runAllTimers();
      });

      expect(onMoveComplete).not.toHaveBeenCalled();
      expect(onBotMoveStart).not.toHaveBeenCalled();
    });
  });

  describe("hasResults waiting", () => {
    it("does NOT move when hasResults is false", () => {
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: {
            hasResults: false,
            status: "analyzing",
            isEngineThinking: true,
          },
        }),
      );

      renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      expect(onMoveComplete).not.toHaveBeenCalled();
    });
  });

  describe("hasMovedForPosition tracking", () => {
    it("does NOT move twice for the same position", async () => {
      const mockGetBestMove = jest
        .fn()
        .mockReturnValue({ san: "e4", uci: "e2e4" });

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            getBestMove: mockGetBestMove,
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
      );

      const { rerender } = renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(onMoveComplete).toHaveBeenCalledTimes(1);
      });

      // Clear and rerender with same position
      onMoveComplete.mockClear();

      rerender(
        <ChessGame.Root>
          <BotController
            playAs="white"
            minDelayMs={0}
            maxDelayMs={0}
            onThinkingChange={onThinkingChange}
            onMoveComplete={onMoveComplete}
            onBotMoveStart={onBotMoveStart}
            onError={onError}
          />
        </ChessGame.Root>,
      );

      act(() => {
        jest.runAllTimers();
      });

      // Should not move again for the same position
      expect(onMoveComplete).not.toHaveBeenCalled();
    });
  });

  describe("race condition handling", () => {
    it("aborts move if FEN changes during delay", async () => {
      const mockGetBestMove = jest
        .fn()
        .mockReturnValue({ san: "e4", uci: "e2e4" });

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            getBestMove: mockGetBestMove,
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
      );

      const { rerender } = renderBotController({
        playAs: "white",
        minDelayMs: 100,
        maxDelayMs: 100,
      });

      // Should have started thinking
      expect(onBotMoveStart).toHaveBeenCalled();
      expect(onThinkingChange).toHaveBeenCalledWith(true);

      // Simulate FEN change during delay (position changed externally)
      rerender(
        <ChessGame.Root fen={AFTER_E4_FEN}>
          <BotController
            playAs="white"
            minDelayMs={100}
            maxDelayMs={100}
            onThinkingChange={onThinkingChange}
            onMoveComplete={onMoveComplete}
            onBotMoveStart={onBotMoveStart}
            onError={onError}
          />
        </ChessGame.Root>,
      );

      // Complete the delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        // Move should be aborted because FEN changed
        expect(onMoveComplete).not.toHaveBeenCalled();
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
        }),
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

    it("fires onError when makeMove returns false (invalid move)", async () => {
      // Return an invalid move that chess.js will reject
      const mockGetBestMove = jest
        .fn()
        .mockReturnValue({ san: "O-O", uci: "e1g1" }); // Castling when not possible

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            getBestMove: mockGetBestMove,
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
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
      const mockGetBestMove = jest
        .fn()
        .mockReturnValue({ san: "e4", uci: "e2e4" });

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            getBestMove: mockGetBestMove,
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
      );

      renderBotController({
        playAs: "white",
        minDelayMs: 500,
        maxDelayMs: 1000,
      });

      // Should not have moved immediately
      expect(onMoveComplete).not.toHaveBeenCalled();
      expect(onBotMoveStart).toHaveBeenCalled();

      // Advance time by less than minDelay
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Still should not have moved
      expect(onMoveComplete).not.toHaveBeenCalled();

      // Advance past max delay
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(onMoveComplete).toHaveBeenCalled();
      });
    });

    it("fires onBotMoveStart before delay", () => {
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            getBestMove: jest.fn().mockReturnValue({ san: "e4", uci: "e2e4" }),
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
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
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            getBestMove: jest.fn().mockReturnValue({ san: "e4", uci: "e2e4" }),
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
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
      const mockGetBestMove = jest
        .fn()
        .mockReturnValue({ san: "Nf3", uci: "g1f3" });

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          methods: {
            getBestMove: mockGetBestMove,
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
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
