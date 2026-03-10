import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  StockfishEngine,
  type AnalysisState,
} from "@react-chess-tools/react-chess-stockfish";
import {
  ChessGame,
  useChessGameContext,
} from "@react-chess-tools/react-chess-game";

import { Player } from "../parts/Player";

jest.mock("@react-chess-tools/react-chess-stockfish", () => {
  const actual = jest.requireActual("@react-chess-tools/react-chess-stockfish");

  return {
    ...actual,
    StockfishEngine: jest.fn(),
  };
});

const MockedStockfishEngine = StockfishEngine as jest.MockedClass<
  typeof StockfishEngine
>;

function createAnalysisState(
  overrides: Partial<AnalysisState> = {},
): AnalysisState {
  return {
    fen: "",
    config: {},
    evaluation: null,
    normalizedEvaluation: 0,
    bestLine: null,
    principalVariations: [],
    depth: 0,
    status: "ready",
    isEngineThinking: false,
    hasResults: false,
    error: null,
    ...overrides,
  };
}

interface MockEngineController {
  engine: jest.Mocked<StockfishEngine>;
  emit: (snapshot: Partial<AnalysisState>) => void;
}

function createMockEngineController(): MockEngineController {
  let currentSnapshot = createAnalysisState();
  let subscriber: (() => void) | null = null;

  const engine = {
    init: jest.fn().mockResolvedValue(undefined),
    startAnalysis: jest.fn(),
    stopAnalysis: jest.fn(),
    getBestMove: jest.fn().mockReturnValue(null),
    setConfig: jest.fn(),
    subscribe: jest.fn((listener: () => void) => {
      subscriber = listener;
      return () => {
        subscriber = null;
      };
    }),
    getSnapshot: jest.fn(() => currentSnapshot),
    destroy: jest.fn(),
  } as unknown as jest.Mocked<StockfishEngine>;

  return {
    engine,
    emit(snapshot) {
      currentSnapshot = createAnalysisState({
        ...currentSnapshot,
        ...snapshot,
      });
      subscriber?.();
    },
  };
}

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AFTER_E4_FEN =
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
const AFTER_E4_E5_FEN =
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
function TestMonitor() {
  const { currentFen, game, info, isLatestMove, methods } =
    useChessGameContext();

  return (
    <div>
      <div data-testid="fen">{currentFen}</div>
      <div data-testid="history">{game.history().join(" ")}</div>
      <div data-testid="turn">{info.turn}</div>
      <div data-testid="latest">{String(isLatestMove)}</div>
      <button
        onClick={() => methods.makeMove({ from: "e2", to: "e4" })}
        type="button"
      >
        Play e4
      </button>
      <button onClick={() => methods.goToStart()} type="button">
        Go Start
      </button>
    </div>
  );
}

describe("ChessBot.Player", () => {
  const workerOptions = {
    workerPath: "https://example.com/stockfish.js",
    engineType: "stockfish" as const,
  };

  let controllers: MockEngineController[];

  beforeEach(() => {
    controllers = [];
    MockedStockfishEngine.mockClear();
    MockedStockfishEngine.mockImplementation(() => {
      const controller = createMockEngineController();
      controllers.push(controller);
      return controller.engine;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("plays a move when it becomes the bot's turn", async () => {
    const user = userEvent.setup();
    const onMove = jest.fn();
    const onMoveSelected = jest.fn();

    render(
      <ChessGame.Root>
        <Player
          color="b"
          workerOptions={workerOptions}
          onMove={onMove}
          onMoveSelected={onMoveSelected}
        />
        <TestMonitor />
      </ChessGame.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Play e4" }));

    await waitFor(() => {
      expect(controllers[0].engine.startAnalysis).toHaveBeenCalledWith(
        AFTER_E4_FEN,
        expect.objectContaining({
          skillLevel: 3,
          moveTimeMs: 200,
          depth: 5,
          multiPV: 1,
        }),
      );
    });

    act(() => {
      controllers[0].emit({
        fen: AFTER_E4_FEN,
        status: "ready",
        depth: 12,
        hasResults: true,
        bestLine: {
          rank: 1,
          evaluation: { type: "cp", value: -30 },
          moves: [{ uci: "e7e5", san: "e5" }],
        },
        principalVariations: [
          {
            rank: 1,
            evaluation: { type: "cp", value: -30 },
            moves: [{ uci: "e7e5", san: "e5" }],
          },
        ],
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("history")).toHaveTextContent("e4 e5");
      expect(screen.getByTestId("fen")).toHaveTextContent(AFTER_E4_E5_FEN);
    });

    expect(onMoveSelected).toHaveBeenCalledWith(
      expect.objectContaining({ uci: "e7e5", san: "e5" }),
    );
    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({ uci: "e7e5", san: "e5" }),
    );
  });

  it("does not think or move while paused", async () => {
    const user = userEvent.setup();

    render(
      <ChessGame.Root>
        <Player color="b" workerOptions={workerOptions} paused />
        <TestMonitor />
      </ChessGame.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Play e4" }));

    expect(controllers[0].engine.startAnalysis).not.toHaveBeenCalled();
  });

  it("stops thinking in history mode and ignores stale results", async () => {
    const user = userEvent.setup();

    render(
      <ChessGame.Root>
        <Player color="b" workerOptions={workerOptions} />
        <TestMonitor />
      </ChessGame.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Play e4" }));

    await waitFor(() => {
      expect(controllers[0].engine.startAnalysis).toHaveBeenCalledWith(
        AFTER_E4_FEN,
        expect.any(Object),
      );
    });

    await user.click(screen.getByRole("button", { name: "Go Start" }));

    expect(controllers[0].engine.stopAnalysis).toHaveBeenCalled();

    act(() => {
      controllers[0].emit({
        fen: AFTER_E4_FEN,
        status: "ready",
        depth: 10,
        hasResults: true,
        bestLine: {
          rank: 1,
          evaluation: { type: "cp", value: -20 },
          moves: [{ uci: "e7e5", san: "e5" }],
        },
        principalVariations: [
          {
            rank: 1,
            evaluation: { type: "cp", value: -20 },
            moves: [{ uci: "e7e5", san: "e5" }],
          },
        ],
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("fen")).toHaveTextContent(START_FEN);
    });

    expect(screen.getByTestId("history")).toHaveTextContent("e4");
    expect(screen.getByTestId("turn")).toHaveTextContent("b");
  });

  it("alternates correctly with two bots", async () => {
    render(
      <ChessGame.Root>
        <Player color="w" workerOptions={workerOptions} />
        <Player color="b" workerOptions={workerOptions} />
        <TestMonitor />
      </ChessGame.Root>,
    );

    await waitFor(() => {
      expect(controllers[0].engine.startAnalysis).toHaveBeenCalledWith(
        START_FEN,
        expect.any(Object),
      );
    });

    act(() => {
      controllers[0].emit({
        fen: START_FEN,
        status: "ready",
        depth: 8,
        hasResults: true,
        bestLine: {
          rank: 1,
          evaluation: { type: "cp", value: 20 },
          moves: [{ uci: "e2e4", san: "e4" }],
        },
        principalVariations: [
          {
            rank: 1,
            evaluation: { type: "cp", value: 20 },
            moves: [{ uci: "e2e4", san: "e4" }],
          },
        ],
      });
    });

    await waitFor(() => {
      expect(controllers[1].engine.startAnalysis).toHaveBeenCalledWith(
        AFTER_E4_FEN,
        expect.any(Object),
      );
    });

    act(() => {
      controllers[1].emit({
        fen: AFTER_E4_FEN,
        status: "ready",
        depth: 9,
        hasResults: true,
        bestLine: {
          rank: 1,
          evaluation: { type: "cp", value: -18 },
          moves: [{ uci: "e7e5", san: "e5" }],
        },
        principalVariations: [
          {
            rank: 1,
            evaluation: { type: "cp", value: -18 },
            moves: [{ uci: "e7e5", san: "e5" }],
          },
        ],
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("history")).toHaveTextContent("e4 e5");
    });
  });

  it("surfaces an explicit error for low levels on standard stockfish", async () => {
    const onError = jest.fn();

    render(
      <ChessGame.Root>
        <Player
          color="b"
          workerOptions={workerOptions}
          strength={{ level: 2 }}
          onError={onError}
        />
        <TestMonitor />
      </ChessGame.Root>,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("requires fairy-stockfish"),
        }),
      );
    });

    expect(controllers[0].engine.startAnalysis).not.toHaveBeenCalled();
  });
});
