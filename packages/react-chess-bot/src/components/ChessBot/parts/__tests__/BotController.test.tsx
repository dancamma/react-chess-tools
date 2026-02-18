import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import {
  useStockfish,
  StockfishContextValue,
} from "@react-chess-tools/react-chess-stockfish";
import type { PrincipalVariation } from "@react-chess-tools/react-chess-stockfish";
import { BotController } from "../BotController";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

jest.mock("@react-chess-tools/react-chess-stockfish", () => ({
  useStockfish: jest.fn(),
}));

const mockedUseStockfish = useStockfish as jest.MockedFunction<
  typeof useStockfish
>;

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
  const defaultPVs = [createPV(1, "e4", "e2e4", 50)];
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
      principalVariations: defaultPVs,
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

  const renderBotController = (
    props: {
      playAs?: "white" | "black";
      fen?: string;
      difficulty?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    } = {},
  ) => {
    return render(
      <ChessGame.Root fen={props.fen}>
        <BotController
          playAs={props.playAs ?? "white"}
          difficulty={props.difficulty ?? 5}
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
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          fen: AFTER_E4_FEN,
          info: {
            principalVariations: [createPV(1, "e5", "e7e5", 50)],
          },
        }),
      );

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

  describe("engine thinking state", () => {
    it("does NOT move while engine is still thinking", () => {
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: {
            hasResults: true,
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
      expect(onBotMoveStart).not.toHaveBeenCalled();
    });

    it("moves only when engine is done thinking and has results", async () => {
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: {
            hasResults: true,
            status: "analyzing",
            isEngineThinking: true,
          },
        }),
      );

      const { rerender } = renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      expect(onMoveComplete).not.toHaveBeenCalled();

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: {
            hasResults: true,
            status: "ready",
            isEngineThinking: false,
          },
        }),
      );

      rerender(
        <ChessGame.Root>
          <BotController
            playAs="white"
            difficulty={5}
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

      await waitFor(() => {
        expect(onMoveComplete).toHaveBeenCalledWith({
          san: "e4",
          uci: "e2e4",
        });
      });
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
      const { rerender } = renderBotController({ playAs: "white" });

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(onMoveComplete).toHaveBeenCalledTimes(1);
      });

      onMoveComplete.mockClear();

      rerender(
        <ChessGame.Root>
          <BotController
            playAs="white"
            difficulty={5}
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

      expect(onMoveComplete).not.toHaveBeenCalled();
    });
  });

  describe("race condition handling", () => {
    it("does NOT use stale results when analyzedFen does not match currentFen", async () => {
      const staleFen = START_FEN;
      const currentFen = AFTER_E4_FEN;

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          fen: currentFen,
          info: {
            hasResults: true,
            isEngineThinking: false,
            analyzedFen: staleFen,
            principalVariations: [createPV(1, "e4", "e2e4", 50)],
          },
        }),
      );

      renderBotController({ playAs: "black", fen: currentFen });

      act(() => {
        jest.runAllTimers();
      });

      expect(onMoveComplete).not.toHaveBeenCalled();
      expect(onBotMoveStart).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("fires onError when no valid move found from engine", async () => {
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: {
            hasResults: true,
            status: "ready",
            isEngineThinking: false,
            principalVariations: [],
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
          "No valid move found",
        );
      });
    });

    it("fires onError when makeMove returns false (invalid move)", async () => {
      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: {
            principalVariations: [createPV(1, "O-O", "e1g1", 50)],
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

  describe("move selection", () => {
    it("at max difficulty (8), strongly favors best move from first PV", async () => {
      const pvs = [
        createPV(1, "e4", "e2e4", 100),
        createPV(2, "d4", "d2d4", 80),
        createPV(3, "c4", "c2c4", 60),
      ];

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: { principalVariations: pvs },
        }),
      );

      let e4Count = 0;
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        onMoveComplete.mockClear();
        jest.clearAllTimers();

        renderBotController({ playAs: "white", difficulty: 8 });

        act(() => {
          jest.runAllTimers();
        });

        await waitFor(() => {
          expect(onMoveComplete).toHaveBeenCalled();
        });

        if (onMoveComplete.mock.calls[0][0].san === "e4") {
          e4Count++;
        }
      }

      expect(e4Count).toBeGreaterThan(iterations * 0.5);
    });

    it("at low difficulty (1), may select from multiple PVs", async () => {
      const pvs = [
        createPV(1, "e4", "e2e4", 100),
        createPV(2, "d4", "d2d4", 95),
        createPV(3, "c4", "c2c4", 90),
      ];

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: { principalVariations: pvs },
        }),
      );

      const moveCounts: Record<string, number> = { e4: 0, d4: 0, c4: 0 };
      const iterations = 30;

      for (let i = 0; i < iterations; i++) {
        onMoveComplete.mockClear();
        jest.clearAllTimers();

        renderBotController({ playAs: "white", difficulty: 1 });

        act(() => {
          jest.runAllTimers();
        });

        await waitFor(() => {
          expect(onMoveComplete).toHaveBeenCalled();
        });

        const move = onMoveComplete.mock.calls[0][0].san;
        moveCounts[move]++;
      }

      const nonE4Count = moveCounts.d4 + moveCounts.c4;
      expect(nonE4Count).toBeGreaterThan(0);
    });
  });
});
