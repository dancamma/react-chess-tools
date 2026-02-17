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
      randomness?: 0 | 1 | 2 | 3 | 4 | 5;
      minDelayMs?: number;
      maxDelayMs?: number;
      fen?: string;
    } = {},
  ) => {
    return render(
      <ChessGame.Root fen={props.fen}>
        <BotController
          playAs={props.playAs ?? "white"}
          randomness={props.randomness ?? 0}
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
            randomness={0}
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

      expect(onMoveComplete).not.toHaveBeenCalled();
    });
  });

  describe("race condition handling", () => {
    it("aborts move if FEN changes during delay", async () => {
      const { rerender } = renderBotController({
        playAs: "white",
        minDelayMs: 100,
        maxDelayMs: 100,
      });

      expect(onBotMoveStart).toHaveBeenCalled();
      expect(onThinkingChange).toHaveBeenCalledWith(true);

      rerender(
        <ChessGame.Root fen={AFTER_E4_FEN}>
          <BotController
            playAs="white"
            randomness={0}
            minDelayMs={100}
            maxDelayMs={100}
            onThinkingChange={onThinkingChange}
            onMoveComplete={onMoveComplete}
            onBotMoveStart={onBotMoveStart}
            onError={onError}
          />
        </ChessGame.Root>,
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(onMoveComplete).not.toHaveBeenCalled();
        expect(onThinkingChange).toHaveBeenLastCalledWith(false);
      });
    });

    it("does NOT use stale results when analyzedFen does not match currentFen", async () => {
      const staleFen = START_FEN;
      const currentFen = AFTER_E4_FEN;

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          fen: currentFen,
          info: {
            hasResults: true,
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

  describe("delay", () => {
    it("respects minDelayMs and maxDelayMs range", async () => {
      renderBotController({
        playAs: "white",
        minDelayMs: 500,
        maxDelayMs: 1000,
      });

      expect(onMoveComplete).not.toHaveBeenCalled();
      expect(onBotMoveStart).toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(onMoveComplete).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(onMoveComplete).toHaveBeenCalled();
      });
    });

    it("fires onBotMoveStart before delay", () => {
      renderBotController({
        playAs: "white",
        minDelayMs: 1000,
        maxDelayMs: 1000,
      });

      expect(onBotMoveStart).toHaveBeenCalled();
      expect(onThinkingChange).toHaveBeenCalledWith(true);
    });
  });

  describe("cleanup", () => {
    it("clears timeout on unmount", () => {
      const { unmount } = renderBotController({
        playAs: "white",
        minDelayMs: 1000,
        maxDelayMs: 1000,
      });

      expect(onThinkingChange).toHaveBeenCalledWith(true);

      unmount();

      act(() => {
        jest.runAllTimers();
      });

      expect(onThinkingChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("randomness", () => {
    it("with randomness=0, always selects first move", async () => {
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

      for (let i = 0; i < 5; i++) {
        onMoveComplete.mockClear();
        jest.clearAllTimers();

        renderBotController({ playAs: "white", randomness: 0 });

        act(() => {
          jest.runAllTimers();
        });

        await waitFor(() => {
          expect(onMoveComplete).toHaveBeenCalledWith({
            san: "e4",
            uci: "e2e4",
          });
        });
      }
    });

    it("with randomness>0, can select different moves", async () => {
      const pvs = [
        createPV(1, "e4", "e2e4", 50),
        createPV(2, "d4", "d2d4", 45),
        createPV(3, "c4", "c2c4", 40),
        createPV(4, "Nf3", "g1f3", 35),
        createPV(5, "c3", "c2c3", 30),
      ];

      mockedUseStockfish.mockReturnValue(
        createMockStockfishContext({
          info: { principalVariations: pvs },
        }),
      );

      const selectedMoves = new Set<string>();
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        onMoveComplete.mockClear();

        const { unmount } = renderBotController({
          playAs: "white",
          randomness: 5,
          minDelayMs: 0,
          maxDelayMs: 0,
        });

        act(() => {
          jest.runAllTimers();
        });

        await waitFor(() => {
          expect(onMoveComplete).toHaveBeenCalled();
        });

        const call = onMoveComplete.mock.calls[0];
        if (call) {
          selectedMoves.add(call[0].san);
        }

        unmount();
      }

      expect(selectedMoves.size).toBeGreaterThan(1);
    });
  });
});
