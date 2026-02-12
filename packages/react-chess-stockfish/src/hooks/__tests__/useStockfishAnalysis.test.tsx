/**
 * Tests for useStockfishAnalysis hook.
 *
 * Uses a mocked StockfishEngine to test the hook's lifecycle management,
 * state reading via useSyncExternalStore, auto-start on FEN/config changes,
 * and stable method references.
 */

import { renderHook, act } from "@testing-library/react";
import { useStockfishAnalysis } from "../useStockfishAnalysis";
import { StockfishEngine } from "../../engine/stockfishEngine";
import type {
  AnalysisState,
  WorkerOptions,
  StockfishConfig,
} from "../../types";
import { getInitialState } from "../../utils/config";

// Mock the StockfishEngine module
jest.mock("../../engine/stockfishEngine");

const MockedStockfishEngine = StockfishEngine as jest.MockedClass<
  typeof StockfishEngine
>;

describe("useStockfishAnalysis", () => {
  let mockEngine: jest.Mocked<StockfishEngine>;
  let subscribeCallback: (() => void) | null = null;
  let currentSnapshot: AnalysisState;

  const defaultWorkerOptions: WorkerOptions = {
    workerPath: "https://example.com/stockfish.js",
  };

  const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  beforeEach(() => {
    subscribeCallback = null;
    currentSnapshot = getInitialState();

    MockedStockfishEngine.mockClear();

    // Create a mock engine instance that will be returned by the constructor
    mockEngine = {
      init: jest.fn().mockResolvedValue(undefined),
      startAnalysis: jest.fn(),
      stopAnalysis: jest.fn(),
      getBestMove: jest.fn().mockReturnValue(null),
      setConfig: jest.fn(),
      subscribe: jest.fn((listener: () => void) => {
        subscribeCallback = listener;
        return () => {
          subscribeCallback = null;
        };
      }),
      getSnapshot: jest.fn(() => currentSnapshot),
      destroy: jest.fn(),
    } as unknown as jest.Mocked<StockfishEngine>;

    MockedStockfishEngine.mockImplementation(() => mockEngine);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates engine on mount and destroys on unmount", () => {
    const { unmount } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    // Engine should be created with workerOptions
    expect(MockedStockfishEngine).toHaveBeenCalledTimes(1);
    expect(MockedStockfishEngine).toHaveBeenCalledWith(defaultWorkerOptions);

    // init() should be called
    expect(mockEngine.init).toHaveBeenCalledTimes(1);

    // Unmount should destroy the engine
    unmount();
    expect(mockEngine.destroy).toHaveBeenCalledTimes(1);
  });

  it("reads state via useSyncExternalStore", () => {
    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    // Should subscribe to the engine
    expect(mockEngine.subscribe).toHaveBeenCalledTimes(1);

    // Should read initial snapshot
    expect(result.current.info.status).toBe("initializing");
    expect(result.current.info.evaluation).toBeNull();
    expect(result.current.info.depth).toBe(0);
    expect(result.current.info.isEngineThinking).toBe(false);
    expect(result.current.info.hasResults).toBe(false);
  });

  it("auto-starts analysis on mount", () => {
    renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    // startAnalysis should be called with the initial FEN
    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(startFen, {});
  });

  it("auto-starts analysis when FEN changes", () => {
    const { rerender } = renderHook(
      ({ fen }) =>
        useStockfishAnalysis({
          fen,
          workerOptions: defaultWorkerOptions,
        }),
      { initialProps: { fen: startFen } },
    );

    mockEngine.startAnalysis.mockClear();

    const newFen =
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
    rerender({ fen: newFen });

    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(newFen, {});
  });

  it("auto-starts analysis when config changes", () => {
    const config1: StockfishConfig = { multiPV: 1 };
    const config2: StockfishConfig = { multiPV: 3 };

    const { rerender } = renderHook(
      ({ config }) =>
        useStockfishAnalysis({
          fen: startFen,
          config,
          workerOptions: defaultWorkerOptions,
        }),
      { initialProps: { config: config1 } },
    );

    mockEngine.startAnalysis.mockClear();

    rerender({ config: config2 });

    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(startFen, config2);
  });

  it("updates info when snapshot changes", () => {
    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    expect(result.current.info.status).toBe("initializing");

    // Simulate engine updating its state
    currentSnapshot = {
      ...getInitialState(),
      status: "analyzing",
      isEngineThinking: true,
      evaluation: { type: "cp", value: 50 },
      depth: 12,
      hasResults: true,
    };

    // Notify subscribers
    act(() => {
      subscribeCallback?.();
    });

    expect(result.current.info.status).toBe("analyzing");
    expect(result.current.info.isEngineThinking).toBe(true);
    expect(result.current.info.evaluation).toEqual({ type: "cp", value: 50 });
    expect(result.current.info.depth).toBe(12);
    expect(result.current.info.hasResults).toBe(true);
  });

  it("provides stable method references", () => {
    const { result } = renderHook(
      ({ fen }) =>
        useStockfishAnalysis({
          fen,
          workerOptions: defaultWorkerOptions,
        }),
      { initialProps: { fen: startFen } },
    );

    const methods1 = result.current.methods;

    // Simulate a snapshot change (should not change methods)
    currentSnapshot = {
      ...getInitialState(),
      status: "analyzing",
      depth: 5,
    };

    act(() => {
      subscribeCallback?.();
    });

    // Methods should be the same reference since fen didn't change
    expect(result.current.methods).toBe(methods1);
  });

  it("methods update when FEN changes", () => {
    const { result, rerender } = renderHook(
      ({ fen }) =>
        useStockfishAnalysis({
          fen,
          workerOptions: defaultWorkerOptions,
        }),
      { initialProps: { fen: startFen } },
    );

    const methods1 = result.current.methods;

    const newFen =
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
    rerender({ fen: newFen });

    // Methods should have a new reference since fen changed
    expect(result.current.methods).not.toBe(methods1);
  });

  it("startAnalysis method calls engine", () => {
    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    mockEngine.startAnalysis.mockClear();

    act(() => {
      result.current.methods.startAnalysis();
    });

    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(startFen, {});
  });

  it("stopAnalysis method calls engine", () => {
    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    act(() => {
      result.current.methods.stopAnalysis();
    });

    expect(mockEngine.stopAnalysis).toHaveBeenCalledTimes(1);
  });

  it("getBestMove method calls engine", () => {
    const bestMove = { uci: "e2e4", san: "e4" };
    mockEngine.getBestMove.mockReturnValue(bestMove);

    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    const move = result.current.methods.getBestMove();

    expect(mockEngine.getBestMove).toHaveBeenCalled();
    expect(move).toEqual(bestMove);
  });

  it("getBestMove returns null when engine has no results", () => {
    mockEngine.getBestMove.mockReturnValue(null);

    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    expect(result.current.methods.getBestMove()).toBeNull();
  });

  it("setConfig method calls engine", () => {
    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    act(() => {
      result.current.methods.setConfig({ multiPV: 5 });
    });

    expect(mockEngine.setConfig).toHaveBeenCalledWith({ multiPV: 5 });
  });

  it("catches init() errors without throwing", async () => {
    const initError = new Error("Init failed");
    mockEngine.init.mockRejectedValue(initError);

    // Should not throw
    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    // Wait for the promise rejection to be handled
    await act(async () => {
      await Promise.resolve();
    });

    // Simulate the engine setting its error state after init fails
    currentSnapshot = {
      ...getInitialState(),
      status: "error",
      error: initError,
    };

    // Notify subscribers to trigger re-render
    act(() => {
      subscribeCallback?.();
    });

    // Error should be reflected in the hook's output
    expect(result.current.info.error).toEqual(initError);
    expect(result.current.info.status).toBe("error");
  });

  it("returns initializing info when engine is not yet created", () => {
    // This tests the fallback path in getSnapshot when engineRef is null
    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    // The info should have initial values
    expect(result.current.info.status).toBe("initializing");
    expect(result.current.info.evaluation).toBeNull();
    expect(result.current.info.principalVariations).toEqual([]);
  });

  it("does not export AnalysisState in info (only AnalysisInfo fields)", () => {
    const { result } = renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    const info = result.current.info;

    // AnalysisInfo fields should be present
    expect(info).toHaveProperty("evaluation");
    expect(info).toHaveProperty("normalizedEvaluation");
    expect(info).toHaveProperty("bestLine");
    expect(info).toHaveProperty("principalVariations");
    expect(info).toHaveProperty("depth");
    expect(info).toHaveProperty("status");
    expect(info).toHaveProperty("isEngineThinking");
    expect(info).toHaveProperty("hasResults");
    expect(info).toHaveProperty("error");

    // AnalysisState-only fields should NOT be present
    expect(info).not.toHaveProperty("fen");
    expect(info).not.toHaveProperty("config");
  });

  it("uses default empty config when none provided", () => {
    renderHook(() =>
      useStockfishAnalysis({
        fen: startFen,
        workerOptions: defaultWorkerOptions,
      }),
    );

    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(startFen, {});
  });
});
