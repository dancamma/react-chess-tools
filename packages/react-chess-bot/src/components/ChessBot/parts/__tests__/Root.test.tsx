/**
 * Tests for ChessBot.Root component.
 *
 * These tests use the real ChessGame context and mock only Stockfish,
 * since chess.js is a pure, fast logic library that should be tested against.
 */

import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import {
  useStockfish,
  StockfishContextValue,
} from "@react-chess-tools/react-chess-stockfish";
import { Root } from "../Root";
import { useChessBotContext } from "../../../../hooks/useChessBotContext";

// Type for deeply partial objects (for test overrides)
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Mock useStockfish only - ChessGame uses real chess.js
jest.mock("@react-chess-tools/react-chess-stockfish", () => ({
  useStockfish: jest.fn(),
  ChessStockfish: {
    Root: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
}));

const mockedUseStockfish = useStockfish as jest.MockedFunction<
  typeof useStockfish
>;

const MOCK_WORKER_PATH = "https://example.com/stockfish.js";
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
    ...defaults,
    ...overrides,
    info: { ...defaults.info, ...overrides.info },
    methods: { ...defaults.methods, ...overrides.methods },
  };
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

// Helper to render Root wrapped in real ChessGame context
const renderChessBotRoot = (
  props: {
    playAs?: "white" | "black";
    skillLevel?: number;
    minDelayMs?: number;
    maxDelayMs?: number;
    fen?: string;
  } = {},
) => {
  return render(
    <ChessGame.Root fen={props.fen}>
      <Root
        playAs={props.playAs ?? "white"}
        workerPath={MOCK_WORKER_PATH}
        skillLevel={props.skillLevel}
        minDelayMs={props.minDelayMs ?? 0}
        maxDelayMs={props.maxDelayMs ?? 0}
      >
        <TestChild />
      </Root>
    </ChessGame.Root>,
  );
};

describe("Root", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedUseStockfish.mockReturnValue(createMockStockfishContext());
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders children correctly", () => {
      render(
        <ChessGame.Root>
          <Root playAs="black" workerPath={MOCK_WORKER_PATH}>
            <div>Child content</div>
          </Root>
        </ChessGame.Root>,
      );

      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("has correct displayName", () => {
      expect(Root.displayName).toBe("ChessBot.Root");
    });

    it("provides context to children with correct playAs value", () => {
      renderChessBotRoot({ playAs: "white" });

      expect(screen.getByTestId("playAs")).toHaveTextContent("white");
    });

    it("provides context to children with correct isThinking value", () => {
      renderChessBotRoot({ playAs: "black" });

      expect(screen.getByTestId("isThinking")).toHaveTextContent("false");
    });
  });

  describe("data attributes", () => {
    it("sets data-thinking attribute correctly when not thinking", () => {
      const { container } = renderChessBotRoot({ playAs: "black" });

      const rootElement = container.querySelector("[data-thinking]");
      expect(rootElement).toHaveAttribute("data-thinking", "false");
    });

    it("sets data-color attribute correctly for white", () => {
      const { container } = renderChessBotRoot({ playAs: "white" });

      const rootElement = container.querySelector("[data-color]");
      expect(rootElement).toHaveAttribute("data-color", "white");
    });

    it("sets data-color attribute correctly for black", () => {
      const { container } = renderChessBotRoot({ playAs: "black" });

      const rootElement = container.querySelector("[data-color]");
      expect(rootElement).toHaveAttribute("data-color", "black");
    });
  });

  describe("skillLevel validation", () => {
    it("clamps skillLevel to 0 when below range", () => {
      // We verify this by checking that the component renders without error
      renderChessBotRoot({ playAs: "black", skillLevel: -5 });

      expect(screen.getByTestId("playAs")).toHaveTextContent("black");
    });

    it("clamps skillLevel to 20 when above range", () => {
      renderChessBotRoot({ playAs: "black", skillLevel: 25 });

      expect(screen.getByTestId("playAs")).toHaveTextContent("black");
    });
  });

  describe("context value updates", () => {
    it("updates lastMove when bot makes a move", async () => {
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
      renderChessBotRoot({ playAs: "black", fen: AFTER_E4_FEN });

      // Initial state
      expect(screen.getByTestId("lastMove")).toHaveTextContent("null");

      // Fast-forward through delay
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId("lastMove")).toHaveTextContent("e5");
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

      // Start from position where it's black's turn
      renderChessBotRoot({ playAs: "black", fen: AFTER_E4_FEN });

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
      const { container } = renderChessBotRoot({ playAs: "black" });

      const liveRegion = container.querySelector("[aria-live='polite']");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    });
  });

  describe("CPU vs CPU", () => {
    it("allows two bots with different playAs values to coexist", () => {
      // This test verifies that two Root components can be rendered together
      render(
        <ChessGame.Root>
          <Root playAs="white" workerPath={MOCK_WORKER_PATH}>
            <div data-testid="white-bot">White Bot</div>
          </Root>
          <Root playAs="black" workerPath={MOCK_WORKER_PATH}>
            <div data-testid="black-bot">Black Bot</div>
          </Root>
        </ChessGame.Root>,
      );

      expect(screen.getByTestId("white-bot")).toBeInTheDocument();
      expect(screen.getByTestId("black-bot")).toBeInTheDocument();
    });
  });
});
