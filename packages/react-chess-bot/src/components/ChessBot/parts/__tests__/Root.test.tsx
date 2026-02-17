import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import {
  useStockfish,
  StockfishContextValue,
} from "@react-chess-tools/react-chess-stockfish";
import type { PrincipalVariation } from "@react-chess-tools/react-chess-stockfish";
import { Root } from "../Root";
import { useChessBotContext } from "../../../../hooks/useChessBotContext";

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

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

function createPV(
  rank: number,
  san: string,
  uci: string,
  cp: number,
): PrincipalVariation {
  return {
    rank,
    evaluation: { type: "cp", value: cp },
    moves: [{ san, uci }],
  };
}

function createMockStockfishContext(
  overrides: DeepPartial<StockfishContextValue> = {},
): StockfishContextValue {
  const fen = overrides.fen ?? START_FEN;

  const defaults: StockfishContextValue = {
    fen,
    info: {
      hasResults: true,
      analyzedFen: fen,
      status: "ready" as const,
      isEngineThinking: false,
      evaluation: null,
      normalizedEvaluation: 0,
      bestLine: null,
      principalVariations: [createPV(1, "e4", "e2e4", 50)],
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

  const mergedInfo = {
    ...defaults.info,
    ...overrides.info,
    // Keep analyzedFen in sync with fen unless explicitly overridden
    analyzedFen:
      overrides.info?.analyzedFen ??
      (overrides.info?.hasResults === false ? "" : fen),
  };

  return {
    fen: overrides.fen ?? defaults.fen,
    info: mergedInfo,
    methods: { ...defaults.methods, ...overrides.methods },
  } as StockfishContextValue;
}

const TestChild = () => {
  const context = useChessBotContext();
  return (
    <div>
      <div data-testid="playAs">{context.playAs}</div>
      <div data-testid="difficulty">{context.difficulty}</div>
      <div data-testid="randomness">{context.randomness}</div>
      <div data-testid="isThinking">{context.isThinking.toString()}</div>
      <div data-testid="lastMove">{context.lastMove?.san ?? "null"}</div>
      <div data-testid="error">{context.error?.message ?? "null"}</div>
    </div>
  );
};

const renderChessBotRoot = (
  props: {
    playAs?: "white" | "black";
    difficulty?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    randomness?: 0 | 1 | 2 | 3 | 4 | 5;
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
        difficulty={props.difficulty}
        randomness={props.randomness}
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

    it("provides context with default difficulty (5)", () => {
      renderChessBotRoot({ playAs: "white" });

      expect(screen.getByTestId("difficulty")).toHaveTextContent("5");
    });

    it("provides context with custom difficulty", () => {
      renderChessBotRoot({ playAs: "white", difficulty: 8 });

      expect(screen.getByTestId("difficulty")).toHaveTextContent("8");
    });

    it("provides context with default randomness (0)", () => {
      renderChessBotRoot({ playAs: "white" });

      expect(screen.getByTestId("randomness")).toHaveTextContent("0");
    });

    it("provides context with custom randomness", () => {
      renderChessBotRoot({ playAs: "white", randomness: 3 });

      expect(screen.getByTestId("randomness")).toHaveTextContent("3");
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

    it("sets data-difficulty attribute correctly", () => {
      const { container } = renderChessBotRoot({
        playAs: "white",
        difficulty: 7,
      });

      const rootElement = container.querySelector("[data-difficulty]");
      expect(rootElement).toHaveAttribute("data-difficulty", "7");
    });

    it("sets data-randomness attribute correctly", () => {
      const { container } = renderChessBotRoot({
        playAs: "white",
        randomness: 4,
      });

      const rootElement = container.querySelector("[data-randomness]");
      expect(rootElement).toHaveAttribute("data-randomness", "4");
    });
  });

  describe("context value updates", () => {
    it("updates lastMove when bot makes a move", async () => {
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          fen: AFTER_E4_FEN,
          info: {
            principalVariations: [createPV(1, "e5", "e7e5", 50)],
          },
        }),
      );

      renderChessBotRoot({ playAs: "black", fen: AFTER_E4_FEN });

      expect(screen.getByTestId("lastMove")).toHaveTextContent("null");

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
          fen: AFTER_E4_FEN,
          info: {
            hasResults: true,
            status: "ready",
            isEngineThinking: false,
            principalVariations: [],
          },
        }),
      );

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

    it("allows two bots with different difficulty levels", () => {
      render(
        <ChessGame.Root>
          <Root playAs="white" workerPath={MOCK_WORKER_PATH} difficulty={8}>
            <div data-testid="white-bot">White Bot</div>
          </Root>
          <Root playAs="black" workerPath={MOCK_WORKER_PATH} difficulty={3}>
            <div data-testid="black-bot">Black Bot</div>
          </Root>
        </ChessGame.Root>,
      );

      expect(screen.getByTestId("white-bot")).toBeInTheDocument();
      expect(screen.getByTestId("black-bot")).toBeInTheDocument();
    });
  });
});
