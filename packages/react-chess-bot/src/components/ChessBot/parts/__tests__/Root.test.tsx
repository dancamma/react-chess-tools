/**
 * Tests for ChessBot.Root component.
 *
 * These tests mock the StockfishEngine at the engine level and use a mock
 * ChessGameContext to control game state.
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { merge } from "lodash";
import { Root } from "../Root";
import { useChessBotContext } from "../../../../hooks/useChessBotContext";
import {
  useChessGameContext,
  ChessGameContextType,
} from "@react-chess-tools/react-chess-game";
import {
  useStockfish,
  StockfishContextValue,
} from "@react-chess-tools/react-chess-stockfish";

// Type for deeply partial objects (for test overrides)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Mock useChessGameContext
jest.mock("@react-chess-tools/react-chess-game", () => ({
  useChessGameContext: jest.fn(),
  ChessGameContext: React.createContext(null),
}));

// Mock useStockfish
jest.mock("@react-chess-tools/react-chess-stockfish", () => ({
  useStockfish: jest.fn(),
  ChessStockfish: {
    Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
}));

const mockedUseChessGameContext = useChessGameContext as jest.MockedFunction<
  typeof useChessGameContext
>;
const mockedUseStockfish = useStockfish as jest.MockedFunction<
  typeof useStockfish
>;

const MOCK_WORKER_PATH = "https://example.com/stockfish.js";
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Helper to create mock game context with minimal required fields for tests
function createMockGameContext(
  overrides: DeepPartial<ChessGameContextType> = {},
): ChessGameContextType {
  const defaults: ChessGameContextType = {
    game: {} as ChessGameContextType["game"],
    currentFen: START_FEN,
    currentPosition: "",
    orientation: "w",
    currentMoveIndex: -1,
    isLatestMove: true,
    info: {
      turn: "w" as const,
      isPlayerTurn: true,
      isOpponentTurn: false,
      moveNumber: 0,
      lastMove: undefined,
      isCheck: false,
      isCheckmate: false,
      isDraw: false,
      isStalemate: false,
      isThreefoldRepetition: false,
      isInsufficientMaterial: false,
      isGameOver: false,
      isDrawn: false,
      hasPlayerWon: false,
      hasPlayerLost: false,
    },
    methods: {
      makeMove: jest.fn().mockReturnValue(true),
      setPosition: jest.fn(),
      flipBoard: jest.fn(),
      goToMove: jest.fn(),
      goToStart: jest.fn(),
      goToEnd: jest.fn(),
      goToPreviousMove: jest.fn(),
      goToNextMove: jest.fn(),
    },
    clock: null,
  };
  return merge({}, defaults, overrides);
}

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
  return merge({}, defaults, overrides);
}

// Test component that consumes ChessBot context
const TestChild = () => {
  const context = useChessBotContext();
  return (
    <div>
      <div data-testid="playAs">{context.playAs}</div>
      <div data-testid="isThinking">{context.isThinking.toString()}</div>
      <div data-testid="lastMove">{context.lastMove?.san ?? "null"}</div>
      <div data-testid="error">{context.error?.message ?? "null"}</div>
    </div>
  );
};

describe("Root", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedUseChessGameContext.mockReturnValue(createMockGameContext());
    mockedUseStockfish.mockReturnValue(createMockStockfishContext());
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders children correctly", () => {
      render(
        <Root playAs="black" workerPath={MOCK_WORKER_PATH}>
          <div>Child content</div>
        </Root>,
      );

      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("has correct displayName", () => {
      expect(Root.displayName).toBe("ChessBot.Root");
    });

    it("provides context to children with correct playAs value", () => {
      render(
        <Root playAs="white" workerPath={MOCK_WORKER_PATH}>
          <TestChild />
        </Root>,
      );

      expect(screen.getByTestId("playAs")).toHaveTextContent("white");
    });

    it("provides context to children with correct isThinking value", () => {
      render(
        <Root playAs="black" workerPath={MOCK_WORKER_PATH}>
          <TestChild />
        </Root>,
      );

      expect(screen.getByTestId("isThinking")).toHaveTextContent("false");
    });
  });

  describe("context errors", () => {
    it("throws descriptive error when used outside ChessGame.Root", () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockedUseChessGameContext.mockImplementation(() => {
        throw new Error(
          "useChessGameContext must be used within a ChessGame component.",
        );
      });

      expect(() => {
        render(
          <Root playAs="black" workerPath={MOCK_WORKER_PATH}>
            <TestChild />
          </Root>,
        );
      }).toThrow(
        "useChessGameContext must be used within a ChessGame component.",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("data attributes", () => {
    it("sets data-thinking attribute correctly when not thinking", () => {
      const { container } = render(
        <Root playAs="black" workerPath={MOCK_WORKER_PATH}>
          <TestChild />
        </Root>,
      );

      const rootElement = container.querySelector("[data-thinking]");
      expect(rootElement).toHaveAttribute("data-thinking", "false");
    });

    it("sets data-color attribute correctly for white", () => {
      const { container } = render(
        <Root playAs="white" workerPath={MOCK_WORKER_PATH}>
          <TestChild />
        </Root>,
      );

      const rootElement = container.querySelector("[data-color]");
      expect(rootElement).toHaveAttribute("data-color", "white");
    });

    it("sets data-color attribute correctly for black", () => {
      const { container } = render(
        <Root playAs="black" workerPath={MOCK_WORKER_PATH}>
          <TestChild />
        </Root>,
      );

      const rootElement = container.querySelector("[data-color]");
      expect(rootElement).toHaveAttribute("data-color", "black");
    });
  });

  describe("skillLevel validation", () => {
    it("clamps skillLevel to 0 when below range", () => {
      // We verify this by checking that the component renders without error
      render(
        <Root playAs="black" workerPath={MOCK_WORKER_PATH} skillLevel={-5}>
          <TestChild />
        </Root>,
      );

      expect(screen.getByTestId("playAs")).toHaveTextContent("black");
    });

    it("clamps skillLevel to 20 when above range", () => {
      render(
        <Root playAs="black" workerPath={MOCK_WORKER_PATH} skillLevel={25}>
          <TestChild />
        </Root>,
      );

      expect(screen.getByTestId("playAs")).toHaveTextContent("black");
    });
  });

  describe("context value updates", () => {
    it("updates lastMove when bot makes a move", async () => {
      const mockMakeMove = jest.fn().mockReturnValue(true);
      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "b", isGameOver: false },
          methods: { makeMove: mockMakeMove },
        }),
      );

      render(
        <Root
          playAs="black"
          workerPath={MOCK_WORKER_PATH}
          minDelayMs={0}
          maxDelayMs={0}
        >
          <TestChild />
        </Root>,
      );

      // Initial state
      expect(screen.getByTestId("lastMove")).toHaveTextContent("null");

      // Fast-forward through delay
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId("lastMove")).toHaveTextContent("e4");
      });
    });

    it("updates error when bot encounters an error", async () => {
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: { hasResults: true, status: "ready", isEngineThinking: false },
          methods: {
            getBestMove: jest.fn().mockReturnValue(null), // Engine returns null
            startAnalysis: jest.fn(),
            stopAnalysis: jest.fn(),
            setConfig: jest.fn(),
          },
        }),
      );

      mockedUseChessGameContext.mockReturnValue(
        createMockGameContext({
          info: { turn: "b", isGameOver: false },
        }),
      );

      render(
        <Root
          playAs="black"
          workerPath={MOCK_WORKER_PATH}
          minDelayMs={0}
          maxDelayMs={0}
        >
          <TestChild />
        </Root>,
      );

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId("error")).not.toHaveTextContent("null");
      });
    });
  });

  describe("accessibility", () => {
    it("includes ARIA live region for move announcements", () => {
      const { container } = render(
        <Root playAs="black" workerPath={MOCK_WORKER_PATH}>
          <TestChild />
        </Root>,
      );

      const liveRegion = container.querySelector("[aria-live='polite']");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    });
  });

  describe("CPU vs CPU", () => {
    it("allows two bots with different playAs values to coexist", () => {
      // This test verifies that two Root components can be rendered together
      render(
        <>
          <Root playAs="white" workerPath={MOCK_WORKER_PATH}>
            <div data-testid="white-bot">White Bot</div>
          </Root>
          <Root playAs="black" workerPath={MOCK_WORKER_PATH}>
            <div data-testid="black-bot">Black Bot</div>
          </Root>
        </>,
      );

      expect(screen.getByTestId("white-bot")).toBeInTheDocument();
      expect(screen.getByTestId("black-bot")).toBeInTheDocument();
    });
  });
});
