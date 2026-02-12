/**
 * Tests for StockfishEngine class.
 *
 * These tests use a mocked Web Worker to verify the UCI protocol,
 * info parsing, throttling, generation counter, and error handling.
 */

import { StockfishEngine } from "../stockfishEngine";
import type { WorkerOptions } from "../../types";
import { InvalidFenError } from "../../utils/evaluation";

// Mock Web Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;

  private messageHandlers = new Set<(event: MessageEvent) => void>();
  private errorHandlers = new Set<(event: ErrorEvent) => void>();

  postMessage = jest.fn();

  addEventListener = jest.fn((type: string, handler: EventListener) => {
    if (type === "message") {
      this.messageHandlers.add(handler);
    } else if (type === "error") {
      this.errorHandlers.add(handler);
    }
  });

  removeEventListener = jest.fn((type: string, handler: EventListener) => {
    if (type === "message") {
      this.messageHandlers.delete(handler);
    } else if (type === "error") {
      this.errorHandlers.delete(handler);
    }
  });

  terminate = jest.fn(() => {
    this.terminated = true;
  });

  // Helper to simulate messages from Stockfish
  simulateMessage(message: string) {
    this.messageHandlers.forEach((handler) => {
      handler(new MessageEvent("message", { data: message }));
    });
  }

  // Helper to simulate worker errors
  simulateError(message: string) {
    this.errorHandlers.forEach((handler) => {
      handler(new ErrorEvent("error", { message }));
    });
  }
}

// Mock Worker constructor
global.Worker = jest.fn((_url: string) => {
  return new MockWorker() as unknown as Worker;
}) as unknown as typeof Worker;

describe("StockfishEngine", () => {
  let mockWorker: MockWorker;
  let engine: StockfishEngine;

  const defaultWorkerOptions: WorkerOptions = {
    workerPath: "https://example.com/stockfish.js",
  };

  // Helper to complete UCI handshake
  async function completeInit(
    eng: StockfishEngine,
    worker: MockWorker,
  ): Promise<void> {
    const initPromise = eng.init();
    worker.simulateMessage("uciok");
    worker.simulateMessage("readyok");
    await initPromise;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockWorker = new MockWorker() as MockWorker;

    // Make Worker constructor return our mock
    (global.Worker as jest.Mock).mockImplementation(() => mockWorker);
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
  });

  describe("initialization", () => {
    it("initializes with UCI handshake sequence", async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      const initPromise = engine.init();

      // Should send uci command
      expect(mockWorker.postMessage).toHaveBeenCalledTimes(1);
      expect(mockWorker.postMessage).toHaveBeenCalledWith("uci");

      // Simulate uciok response
      mockWorker.simulateMessage("uciok");

      // Should send isready
      expect(mockWorker.postMessage).toHaveBeenCalledTimes(2);
      expect(mockWorker.postMessage).toHaveBeenLastCalledWith("isready");

      // Simulate readyok
      mockWorker.simulateMessage("readyok");

      // Should resolve init promise
      await initPromise;

      const snapshot = engine.getSnapshot();
      expect(snapshot.status).toBe("ready");
    });

    it("sets status to initializing on creation", () => {
      engine = new StockfishEngine(defaultWorkerOptions);

      const snapshot = engine.getSnapshot();
      expect(snapshot.status).toBe("initializing");
      expect(snapshot.isEngineThinking).toBe(false);
    });

    it("times out after timeout ms", async () => {
      jest.useFakeTimers();

      engine = new StockfishEngine({
        workerPath: "https://example.com/stockfish.js",
        timeout: 1000,
      });

      const initPromise = engine.init();

      // Fast-forward past timeout
      jest.advanceTimersByTime(1001);

      await expect(initPromise).rejects.toThrow("timeout");

      jest.useRealTimers();
    });

    it("fails initialization on invalid workerPath", async () => {
      engine = new StockfishEngine({
        workerPath: "javascript:alert('xss')",
      });

      await expect(engine.init()).rejects.toThrow("workerPath");
      expect(engine.getSnapshot().status).toBe("error");
    });
  });

  describe("startAnalysis", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      // Simulate full UCI handshake
      const initPromise = engine.init();
      mockWorker.simulateMessage("uciok");
      mockWorker.simulateMessage("readyok");
      await initPromise;
      jest.clearAllMocks();
    });

    it("sends position and waits for readyok before go", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      engine.startAnalysis(fen);

      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        `position fen ${fen}`,
      );
      expect(mockWorker.postMessage).toHaveBeenCalledWith("isready");
      expect(mockWorker.postMessage).not.toHaveBeenCalledWith("go infinite");

      mockWorker.simulateMessage("readyok");
      expect(mockWorker.postMessage).toHaveBeenCalledWith("go infinite");
    });

    it("sends go depth N only after readyok", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      engine.startAnalysis(fen, { depth: 15 });

      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        `position fen ${fen}`,
      );
      expect(mockWorker.postMessage).toHaveBeenCalledWith("isready");
      expect(mockWorker.postMessage).not.toHaveBeenCalledWith("go depth 15");

      mockWorker.simulateMessage("readyok");
      expect(mockWorker.postMessage).toHaveBeenCalledWith("go depth 15");
    });

    it("sets status to analyzing", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      engine.startAnalysis(fen);

      expect(engine.getSnapshot().status).toBe("analyzing");
      expect(engine.getSnapshot().isEngineThinking).toBe(true);
    });

    it("deduplicates same FEN and config", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const config = { multiPV: 3 };

      engine.startAnalysis(fen, config);
      jest.clearAllMocks();

      engine.startAnalysis(fen, config);

      expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });

    it("handles invalid FEN gracefully", () => {
      const invalidFen = "invalid-fen-string";

      engine.startAnalysis(invalidFen);

      const snapshot = engine.getSnapshot();
      expect(snapshot.status).toBe("ready"); // Not "error" - recoverable
      expect(snapshot.error).toBeInstanceOf(InvalidFenError);
      expect(snapshot.isEngineThinking).toBe(false);
    });

    it("recovers from invalid FEN on next valid FEN", () => {
      engine.startAnalysis("invalid-fen");

      expect(engine.getSnapshot().error).toBeInstanceOf(InvalidFenError);

      const validFen =
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      engine.startAnalysis(validFen);

      expect(engine.getSnapshot().error).toBeNull();
      expect(engine.getSnapshot().status).toBe("analyzing");
    });

    it("does not emit go before readyok", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      engine.startAnalysis(fen);

      expect(mockWorker.postMessage).toHaveBeenCalledWith("isready");
      expect(mockWorker.postMessage).not.toHaveBeenCalledWith("go infinite");
    });
  });

  describe("info parsing", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      await completeInit(engine, mockWorker);
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
    });

    it("parses centipawn evaluation", (done) => {
      const listener = jest.fn();
      engine.subscribe(listener);

      mockWorker.simulateMessage("info depth 20 score cp 123 pv e2e4");

      // Wait for throttled update
      setTimeout(() => {
        const snapshot = engine.getSnapshot();
        expect(snapshot.evaluation).toEqual({ type: "cp", value: 123 });
        expect(snapshot.depth).toBe(20);
        done();
      }, 150);
    });

    it("parses mate evaluation", (done) => {
      const listener = jest.fn();
      engine.subscribe(listener);

      mockWorker.simulateMessage(
        "info depth 15 score mate 3 pv e2e4 e7e5 g1f3",
      );

      setTimeout(() => {
        const snapshot = engine.getSnapshot();
        expect(snapshot.evaluation).toEqual({ type: "mate", value: 3 });
        expect(snapshot.depth).toBe(15);
        done();
      }, 150);
    });

    it("parses multiPV lines", (done) => {
      const listener = jest.fn();
      engine.subscribe(listener);

      // Set multiPV config before starting analysis to avoid restart
      // (setConfig during analysis triggers restart, which would block info lines)
      engine.stopAnalysis();
      engine.setConfig({ multiPV: 2 });
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );

      mockWorker.simulateMessage(
        "info multipv 1 depth 20 score cp 123 pv e2e4",
      );
      mockWorker.simulateMessage("info multipv 2 depth 20 score cp 50 pv d2d4");

      setTimeout(() => {
        const snapshot = engine.getSnapshot();
        expect(snapshot.principalVariations).toHaveLength(2);
        expect(snapshot.principalVariations[0].rank).toBe(1);
        expect(snapshot.principalVariations[1].rank).toBe(2);
        expect(snapshot.bestLine).toEqual(snapshot.principalVariations[0]);
        expect(snapshot.evaluation).toEqual({ type: "cp", value: 123 });
        done();
      }, 150);
    });

    it("parses PV moves", (done) => {
      const listener = jest.fn();
      engine.subscribe(listener);

      mockWorker.simulateMessage(
        "info depth 20 score cp 123 pv e2e4 e7e5 g1f3",
      );

      setTimeout(() => {
        const snapshot = engine.getSnapshot();
        expect(snapshot.bestLine).not.toBeNull();
        expect(snapshot.bestLine?.moves).toHaveLength(3);
        expect(snapshot.bestLine?.moves[0].uci).toBe("e2e4");
        expect(snapshot.bestLine?.moves[0].san).toBe("e4");
        done();
      }, 150);
    });

    it("normalizes evaluation", (done) => {
      const listener = jest.fn();
      engine.subscribe(listener);

      mockWorker.simulateMessage("info depth 20 score cp 1000 pv e2e4");

      setTimeout(() => {
        const snapshot = engine.getSnapshot();
        expect(snapshot.normalizedEvaluation).toBeCloseTo(0.95, 2);
        done();
      }, 150);
    });

    it("normalizes scores to white perspective when black is to move", (done) => {
      engine.stopAnalysis();
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      );

      mockWorker.simulateMessage("info depth 20 score cp 100 pv e7e5");

      setTimeout(() => {
        const snapshot = engine.getSnapshot();
        expect(snapshot.evaluation).toEqual({ type: "cp", value: -100 });
        expect(snapshot.normalizedEvaluation).toBeLessThan(0);
        done();
      }, 150);
    });

    it("normalizes mate scores to white perspective when black is to move", (done) => {
      engine.stopAnalysis();
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      );

      mockWorker.simulateMessage("info depth 20 score mate 3 pv e7e5");

      setTimeout(() => {
        const snapshot = engine.getSnapshot();
        expect(snapshot.evaluation).toEqual({ type: "mate", value: -3 });
        expect(snapshot.normalizedEvaluation).toBe(-1);
        done();
      }, 150);
    });

    it("sets hasResults to true when info received", (done) => {
      const listener = jest.fn();
      engine.subscribe(listener);

      expect(engine.getSnapshot().hasResults).toBe(false);

      mockWorker.simulateMessage("info depth 1 score cp 0 pv e2e4");

      setTimeout(() => {
        expect(engine.getSnapshot().hasResults).toBe(true);
        done();
      }, 150);
    });
  });

  describe("throttling", () => {
    beforeEach(async () => {
      jest.useFakeTimers();
      engine = new StockfishEngine({
        workerPath: "https://example.com/stockfish.js",
        throttleMs: 100,
      });
      await completeInit(engine, mockWorker);
      // Don't start analysis yet - wait for the test to do it
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("throttles rapid updates", () => {
      // Start analysis and let the leading-edge emit happen
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );

      // Advance past throttle window so next info hits leading edge fresh
      jest.advanceTimersByTime(100);

      const listener = jest.fn();
      engine.subscribe(listener);

      // First info message hits leading edge (timeSinceLastUpdate >= throttleMs)
      mockWorker.simulateMessage("info depth 20 score cp 100 pv e2e4");
      expect(listener).toHaveBeenCalledTimes(1);
      listener.mockClear();

      // Rapid subsequent messages within the throttle window should not emit immediately
      mockWorker.simulateMessage("info depth 21 score cp 110 pv e2e4");
      mockWorker.simulateMessage("info depth 22 score cp 120 pv e2e4");
      expect(listener).not.toHaveBeenCalled();

      // After throttle window, trailing edge fires once
      jest.advanceTimersByTime(100);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("emits trailing edge with latest state", () => {
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );

      // Advance past throttle window
      jest.advanceTimersByTime(100);

      const listener = jest.fn();
      engine.subscribe(listener);

      // Leading edge fires immediately
      mockWorker.simulateMessage("info depth 20 score cp 100 pv e2e4");
      expect(listener).toHaveBeenCalledTimes(1);
      listener.mockClear();

      // Within throttle window, send another message
      mockWorker.simulateMessage("info depth 21 score cp 110 pv e2e4");

      // Advance past throttle window for trailing edge
      jest.advanceTimersByTime(100);

      // Trailing edge should have fired
      expect(listener).toHaveBeenCalledTimes(1);

      // Verify the snapshot reflects the latest data
      const snapshot = engine.getSnapshot();
      expect(snapshot.depth).toBe(21);
    });

    it("resets lastUpdate when FEN changes", () => {
      const fen1 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const fen2 =
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

      const listener = jest.fn();
      engine.subscribe(listener);

      // Start first analysis
      engine.startAnalysis(fen1);
      listener.mockClear();

      // Advance PAST throttle window
      jest.advanceTimersByTime(100);

      // Trigger an info update (sets lastUpdate to now)
      mockWorker.simulateMessage("info depth 20 score cp 100 pv e2e4");
      expect(listener).toHaveBeenCalledTimes(1);
      listener.mockClear();

      // Stop and immediately start new analysis
      // Both stopAnalysis and startAnalysis call emitUpdate, resetting lastUpdate
      engine.stopAnalysis();
      engine.startAnalysis(fen2);
      listener.mockClear();

      // Advance PAST throttle window from the last emitUpdate
      jest.advanceTimersByTime(100);

      // Now send info - should emit immediately (leading edge)
      mockWorker.simulateMessage("info depth 1 score cp 50 pv d2d4");
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("generation counter", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      await completeInit(engine, mockWorker);
    });

    it("discards stale analysis when FEN changes", () => {
      jest.useFakeTimers();

      const fen1 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      const fen2 =
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

      engine.startAnalysis(fen1);

      // Before bestmove, change FEN
      engine.startAnalysis(fen2);

      // Simulate bestmove for first FEN (should be ignored)
      mockWorker.simulateMessage("bestmove e2e4");

      jest.advanceTimersByTime(100);

      // Should be analyzing second FEN, not stuck on first
      expect(engine.getSnapshot().fen).toBe(fen2);

      jest.useRealTimers();
    });
  });

  describe("config options", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      await completeInit(engine, mockWorker);
      jest.clearAllMocks();
    });

    it("applies skill level via setoption", () => {
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        {
          skillLevel: 10,
        },
      );

      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        "setoption name Skill Level value 10",
      );
    });

    it("clamps skill level to 0-20 range", () => {
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        {
          skillLevel: 25,
        },
      );

      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        "setoption name Skill Level value 20",
      );
    });

    it("applies multiPV via setoption", () => {
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        {
          multiPV: 3,
        },
      );

      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        "setoption name MultiPV value 3",
      );
    });

    it("clamps multiPV to 1-500 range", () => {
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        {
          multiPV: 600,
        },
      );

      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        "setoption name MultiPV value 500",
      );
    });

    it("updates config during analysis", () => {
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
      mockWorker.simulateMessage("readyok");

      jest.clearAllMocks();

      engine.setConfig({ skillLevel: 5 });

      // Should restart analysis with new config
      expect(mockWorker.postMessage).toHaveBeenCalledWith("stop");
    });
  });

  describe("stopAnalysis", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      await completeInit(engine, mockWorker);
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
      // Wait for readyok so that go is actually sent
      mockWorker.simulateMessage("readyok");
      jest.clearAllMocks();
    });

    it("sends stop command", () => {
      engine.stopAnalysis();

      expect(mockWorker.postMessage).toHaveBeenCalledWith("stop");
    });

    it("sets status to ready", () => {
      engine.stopAnalysis();

      expect(engine.getSnapshot().status).toBe("ready");
      expect(engine.getSnapshot().isEngineThinking).toBe(false);
    });

    it("is no-op when not analyzing", () => {
      engine.stopAnalysis();
      jest.clearAllMocks();

      engine.stopAnalysis();

      expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });

    it("does not restart analysis when bestmove arrives after stop", () => {
      engine.stopAnalysis();
      jest.clearAllMocks();

      // Simulate bestmove arriving after stop (from the stop command)
      mockWorker.simulateMessage("bestmove e2e4");

      // Should NOT send any position/go commands
      expect(mockWorker.postMessage).not.toHaveBeenCalled();
      expect(engine.getSnapshot().status).toBe("ready");
    });

    it("ignores info lines after stop without crashing", () => {
      engine.stopAnalysis();

      expect(() => {
        mockWorker.simulateMessage("info depth 15 score cp 45 pv e2e4 e7e5");
      }).not.toThrow();

      const snapshot = engine.getSnapshot();
      expect(snapshot.status).toBe("ready");
      expect(snapshot.isEngineThinking).toBe(false);
    });
  });

  describe("getBestMove", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      await completeInit(engine, mockWorker);
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
    });

    it("returns first move of best PV", (done) => {
      const listener = jest.fn();
      engine.subscribe(listener);

      mockWorker.simulateMessage("info depth 20 score cp 123 pv e2e4 e7e5");

      setTimeout(() => {
        const bestMove = engine.getBestMove();
        expect(bestMove).not.toBeNull();
        expect(bestMove?.uci).toBe("e2e4");
        expect(bestMove?.san).toBe("e4");
        done();
      }, 150);
    });

    it("returns null when no results", () => {
      const bestMove = engine.getBestMove();
      expect(bestMove).toBeNull();
    });
  });

  describe("subscribe/getSnapshot", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      await completeInit(engine, mockWorker);
    });

    it("returns current snapshot", () => {
      const snapshot = engine.getSnapshot();

      expect(snapshot).toHaveProperty("status");
      expect(snapshot).toHaveProperty("evaluation");
      expect(snapshot).toHaveProperty("principalVariations");
      expect(snapshot).toHaveProperty("depth");
      expect(snapshot).toHaveProperty("isEngineThinking");
    });

    it("returns cached snapshot until state changes", () => {
      const snapshot1 = engine.getSnapshot();
      const snapshot2 = engine.getSnapshot();

      // Same reference when no state change
      expect(snapshot1).toBe(snapshot2);

      // After a state change, returns a new reference
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
      const snapshot3 = engine.getSnapshot();

      expect(snapshot3).not.toBe(snapshot1);
      expect(snapshot3.status).toBe("analyzing");
    });

    it("notifies subscribers on updates", () => {
      const listener = jest.fn();
      engine.subscribe(listener);

      expect(listener).not.toHaveBeenCalled();

      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );

      // Should be called when state changes
      expect(listener).toHaveBeenCalled();
    });

    it("unsubscribe removes listener", () => {
      const listener = jest.fn();
      const unsubscribe = engine.subscribe(listener);

      unsubscribe();
      listener.mockClear();

      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );

      // Listener should not be called after unsubscribe
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("handles worker error event", async () => {
      // Create engine with error handler
      const onError = jest.fn();
      engine = new StockfishEngine({
        workerPath: "https://example.com/stockfish.js",
        onError,
      });

      // Start init but don't await - we'll trigger error
      engine.init().catch(() => {
        // Expected - init fails due to error
      });

      // Wait for Worker creation
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Simulate worker error during init
      mockWorker.simulateError("Worker crashed");

      // Wait for error to be processed
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(onError).toHaveBeenCalled();
      expect(engine.getSnapshot().status).toBe("error");
      expect(engine.getSnapshot().isEngineThinking).toBe(false);
    });

    it("enters permanent error state on worker crash", async () => {
      engine = new StockfishEngine(defaultWorkerOptions);

      // Start init but don't await
      engine.init().catch(() => {
        // Expected - init fails due to error
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      mockWorker.simulateError("Worker crashed");

      await new Promise((resolve) => setTimeout(resolve, 50));

      const snapshot = engine.getSnapshot();
      expect(snapshot.status).toBe("error");
      expect(snapshot.error).not.toBeNull();

      // Cannot recover from error state without remount
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );

      expect(mockWorker.postMessage).not.toHaveBeenCalledWith("go");
      expect(engine.getSnapshot().status).toBe("error");
    });

    it("rejects init() when called again after entering error state", async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      engine.init().catch(() => {
        // expected during simulated crash
      });

      await new Promise((resolve) => setTimeout(resolve, 0));
      mockWorker.simulateError("Worker crashed");
      await new Promise((resolve) => setTimeout(resolve, 50));

      await expect(engine.init()).rejects.toThrow(
        "Cannot recover an engine in error state",
      );
    });
  });

  describe("cleanup", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      await completeInit(engine, mockWorker);
    });

    it("sends quit and terminates worker on destroy", () => {
      engine.destroy();

      expect(mockWorker.postMessage).toHaveBeenCalledWith("quit");
      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it("removes event listeners on destroy", () => {
      engine.destroy();

      expect(mockWorker.removeEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function),
      );
      expect(mockWorker.removeEventListener).toHaveBeenCalledWith(
        "error",
        expect.any(Function),
      );
    });

    it("clears listeners on destroy", () => {
      const listener = jest.fn();
      engine.subscribe(listener);

      engine.destroy();

      // Modifying snapshot after destroy shouldn't call listeners
      listener.mockClear();

      // Try to emit update (shouldn't call listeners)
      expect(listener).not.toHaveBeenCalled();
    });

    it("prevents operations after destroy", () => {
      engine.destroy();

      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );

      // Should not send messages after destroy
      expect(mockWorker.postMessage).not.toHaveBeenCalledWith("position");
    });

    it("clears trailing timeout on destroy", async () => {
      jest.useFakeTimers();

      // Create a new mock worker for this test
      const testMockWorker = new MockWorker() as MockWorker;
      (global.Worker as jest.Mock).mockImplementation(() => testMockWorker);

      const testEngine = new StockfishEngine({
        workerPath: "https://example.com/stockfish.js",
        throttleMs: 100,
      });

      await completeInit(testEngine, testMockWorker);

      testEngine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );

      // Trigger a throttled update (creates timeout)
      testMockWorker.simulateMessage("info depth 20 score cp 100 pv e2e4");

      // Destroy before timeout completes
      testEngine.destroy();

      // Advance timers - should not call listeners
      jest.advanceTimersByTime(200);

      jest.useRealTimers();
    });
  });

  describe("setConfig", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      await completeInit(engine, mockWorker);
      engine.startAnalysis(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      );
      mockWorker.simulateMessage("readyok");
      jest.clearAllMocks();
    });

    it("merges config with existing config", () => {
      // setConfig while analyzing should restart analysis with merged config
      engine.setConfig({ skillLevel: 10 });

      // Should send stop to restart analysis
      expect(mockWorker.postMessage).toHaveBeenCalledWith("stop");
    });

    it("does nothing when destroyed", () => {
      engine.destroy();

      // Clear the "quit" call from destroy
      jest.clearAllMocks();

      engine.setConfig({ skillLevel: 5 });

      expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });
  });

  describe("edge cases and coverage gaps", () => {
    beforeEach(async () => {
      engine = new StockfishEngine(defaultWorkerOptions);
      await completeInit(engine, mockWorker);
    });

    describe("T1: bestmove restart-after-stop path", () => {
      it("handles bestmove after stop when startAnalysis is called", () => {
        jest.useFakeTimers();

        const fen1 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const fen2 =
          "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

        // Start analysis with first FEN
        engine.startAnalysis(fen1);
        mockWorker.simulateMessage("readyok");
        expect(mockWorker.postMessage).toHaveBeenCalledWith("isready");

        // Stop analysis
        jest.clearAllMocks();
        engine.stopAnalysis();
        expect(mockWorker.postMessage).toHaveBeenCalledWith("stop");

        // Start analysis with new FEN before bestmove arrives
        mockWorker.postMessage.mockClear();
        engine.startAnalysis(fen2);
        expect(mockWorker.postMessage).toHaveBeenCalledWith("isready");

        // Now bestmove from first analysis arrives (should NOT trigger restart)
        mockWorker.postMessage.mockClear();
        mockWorker.simulateMessage("bestmove e2e4");

        // Should NOT send position/go again (the new analysis is already running)
        expect(mockWorker.postMessage).not.toHaveBeenCalledWith("position");
        expect(mockWorker.postMessage).not.toHaveBeenCalledWith("go");

        jest.useRealTimers();
      });

      it("restarts analysis when stop is triggered by startAnalysis", () => {
        jest.useFakeTimers();

        const fen1 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const fen2 =
          "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

        // Start analysis with first FEN
        engine.startAnalysis(fen1);
        mockWorker.simulateMessage("readyok");
        expect(mockWorker.postMessage).toHaveBeenCalledWith("isready");

        // Start analysis with new FEN while still analyzing (sends stop)
        jest.clearAllMocks();
        engine.startAnalysis(fen2);
        expect(mockWorker.postMessage).toHaveBeenCalledWith("stop");

        // Bestmove arrives - should restart with new FEN
        mockWorker.postMessage.mockClear();
        mockWorker.simulateMessage("bestmove e2e4");

        expect(mockWorker.postMessage).toHaveBeenCalledWith(
          `position fen ${fen2}`,
        );
        expect(mockWorker.postMessage).toHaveBeenCalledWith("isready");
        expect(mockWorker.postMessage).not.toHaveBeenCalledWith("go infinite");

        mockWorker.simulateMessage("readyok");
        expect(mockWorker.postMessage).toHaveBeenCalledWith("go infinite");

        jest.useRealTimers();
      });

      it("CRITICAL: prevents stale bestmove from corrupting state after stop → start race", () => {
        jest.useFakeTimers();

        const fen1 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const fen2 =
          "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

        // Start analysis with first FEN
        engine.startAnalysis(fen1);
        mockWorker.simulateMessage("readyok");
        expect(engine.getSnapshot().status).toBe("analyzing");

        // Stop analysis - sets isAnalyzing = false immediately, but bestmove hasn't arrived yet
        engine.stopAnalysis();
        expect(engine.getSnapshot().status).toBe("ready");

        // Start new analysis with fen2 - this should be analyzing
        engine.startAnalysis(fen2);
        expect(engine.getSnapshot().status).toBe("analyzing");
        expect(engine.getSnapshot().fen).toBe(fen2);

        // Stale bestmove from fen1 arrives (from the stop command)
        // This should NOT corrupt the state - status should remain "analyzing"
        mockWorker.simulateMessage("bestmove e2e4");

        // Critical assertion: status should still be "analyzing", not "ready"
        expect(engine.getSnapshot().status).toBe("analyzing");
        expect(engine.getSnapshot().fen).toBe(fen2);
        expect(engine.getSnapshot().isEngineThinking).toBe(true);

        jest.useRealTimers();
      });
    });

    describe("T2: Mate score normalization", () => {
      it("normalizes mate scores to ±1", (done) => {
        const listener = jest.fn();
        engine.subscribe(listener);

        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        // Mate in 3 for white
        mockWorker.simulateMessage("info depth 15 score mate 3 pv e2e4");

        setTimeout(() => {
          const snapshot = engine.getSnapshot();
          expect(snapshot.evaluation).toEqual({ type: "mate", value: 3 });
          expect(snapshot.normalizedEvaluation).toBe(1); // Full advantage for white
          done();
        }, 150);
      });

      it("normalizes negative mate scores to -1", (done) => {
        const listener = jest.fn();
        engine.subscribe(listener);

        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        // Mate in 5 for black (negative value)
        mockWorker.simulateMessage("info depth 15 score mate -5 pv e2e4");

        setTimeout(() => {
          const snapshot = engine.getSnapshot();
          expect(snapshot.evaluation).toEqual({ type: "mate", value: -5 });
          expect(snapshot.normalizedEvaluation).toBe(-1); // Full advantage for black
          done();
        }, 150);
      });
    });

    describe("T3: Double init() call", () => {
      it("guards against double initialization", async () => {
        const initialWorkerCallCount = (global.Worker as jest.Mock).mock.calls
          .length;

        const testMockWorker = new MockWorker() as MockWorker;
        (global.Worker as jest.Mock).mockImplementation(() => testMockWorker);

        const engine2 = new StockfishEngine(defaultWorkerOptions);

        // First init
        const init1 = engine2.init();
        // Second init (should not create a new worker)
        const init2 = engine2.init();

        // Complete the UCI handshake
        testMockWorker.simulateMessage("uciok");
        testMockWorker.simulateMessage("readyok");

        // Both should resolve
        await Promise.all([init1, init2]);

        // Should only have created one new worker (for engine2)
        expect((global.Worker as jest.Mock).mock.calls.length).toBe(
          initialWorkerCallCount + 1,
        );

        engine2.destroy();

        // Reset to main mock
        (global.Worker as jest.Mock).mockImplementation(() => mockWorker);
      });

      it("returns existing promise when init is called during initialization", async () => {
        const testMockWorker = new MockWorker() as MockWorker;
        (global.Worker as jest.Mock).mockImplementation(() => testMockWorker);

        const engine2 = new StockfishEngine(defaultWorkerOptions);

        // Start first init (don't await)
        const initPromise = engine2.init();

        // Call init again while still initializing
        const secondPromise = engine2.init();

        // Both should resolve to the same result
        testMockWorker.simulateMessage("uciok");
        testMockWorker.simulateMessage("readyok");

        await Promise.all([initPromise, secondPromise]);

        expect(engine2.getSnapshot().status).toBe("ready");

        engine2.destroy();

        // Reset to main mock
        (global.Worker as jest.Mock).mockImplementation(() => mockWorker);
      });

      it("resolves immediately if already ready", async () => {
        // First init completes
        await engine.init();

        // Second init should resolve immediately
        await engine.init();

        expect(mockWorker.postMessage).toHaveBeenCalledTimes(2); // uci and isready from first init only
      });
    });

    describe("T4: Multiline worker messages", () => {
      it("handles multiline messages with \\n separator", () => {
        jest.useFakeTimers();

        const listener = jest.fn();
        engine.subscribe(listener);

        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        // Simulate multiline message
        mockWorker.simulateMessage(
          "info depth 20 score cp 123 pv e2e4\ninfo depth 21 score cp 125 pv e2e4 e7e5",
        );

        // Both lines should be parsed
        jest.advanceTimersByTime(150);

        const snapshot = engine.getSnapshot();
        // Last line's depth should be in state
        expect(snapshot.depth).toBe(21);

        jest.useRealTimers();
      });
    });

    describe("T5: destroy() during pending init()", () => {
      it("handles destroy called during initialization", async () => {
        const testMockWorker = new MockWorker() as MockWorker;
        (global.Worker as jest.Mock).mockImplementation(() => testMockWorker);

        const engine2 = new StockfishEngine({
          workerPath: "https://example.com/stockfish.js",
          timeout: 1000,
        });

        // Start init but don't complete it
        engine2.init().catch(() => {
          // May or may not reject depending on destroy timing
        });

        // Wait for worker creation
        await Promise.resolve();

        // Immediately destroy - this should clear the timeout
        engine2.destroy();

        // Worker should be terminated
        expect(testMockWorker.terminated).toBe(true);

        // Verify no unhandled errors or hanging timeouts
        // The key is that destroy() doesn't throw and cleans up properly

        // Reset to main mock
        (global.Worker as jest.Mock).mockImplementation(() => mockWorker);
      });

      it("rejects init promise when destroy is called during init", async () => {
        const testMockWorker = new MockWorker() as MockWorker;
        (global.Worker as jest.Mock).mockImplementation(() => testMockWorker);

        const engine2 = new StockfishEngine({
          workerPath: "https://example.com/stockfish.js",
          timeout: 1000,
        });

        // Start init but don't complete it
        const initPromise = engine2.init();

        // Wait for worker creation
        await Promise.resolve();

        // Destroy should reject the init promise
        engine2.destroy();

        // Init promise should reject
        await expect(initPromise).rejects.toThrow(
          "destroyed during initialization",
        );

        // Reset to main mock
        (global.Worker as jest.Mock).mockImplementation(() => mockWorker);
      });
    });

    describe("T6: Null/undefined event.data", () => {
      it("handles null event.data gracefully", () => {
        const listener = jest.fn();
        engine.subscribe(listener);

        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        // Simulate null message
        mockWorker.simulateMessage(null as unknown as string);

        // Should not throw or cause issues
        expect(engine.getSnapshot().status).toBe("analyzing");
      });

      it("handles undefined event.data gracefully", () => {
        const listener = jest.fn();
        engine.subscribe(listener);

        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        // Simulate undefined message
        mockWorker.simulateMessage(undefined as unknown as string);

        // Should not throw or cause issues
        expect(engine.getSnapshot().status).toBe("analyzing");
      });

      it("handles empty string message gracefully", () => {
        const listener = jest.fn();
        engine.subscribe(listener);

        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        // Simulate empty message
        mockWorker.simulateMessage("");

        // Should not throw or cause issues
        expect(engine.getSnapshot().status).toBe("analyzing");
      });
    });

    describe("T7: bestmove (none) response", () => {
      it("handles bestmove (none) without error", () => {
        const listener = jest.fn();
        engine.subscribe(listener);

        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        // Simulate bestmove (none) - happens in stalemate or checkmate positions
        mockWorker.simulateMessage("bestmove (none)");

        // Should handle gracefully
        expect(engine.getSnapshot().status).toBe("ready");
        expect(engine.getSnapshot().isEngineThinking).toBe(false);
      });

      it("does not set hasResults when bestmove is (none)", () => {
        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        // Clear hasResults from initialization
        expect(engine.getSnapshot().hasResults).toBe(false);

        // Simulate bestmove (none)
        mockWorker.simulateMessage("bestmove (none)");

        // hasResults should still be false
        expect(engine.getSnapshot().hasResults).toBe(false);
      });
    });

    describe("T8: startAnalysis before readyok", () => {
      it("queues startAnalysis until readyok is received", () => {
        const testMockWorker = new MockWorker() as MockWorker;
        (global.Worker as jest.Mock).mockImplementation(() => testMockWorker);

        const engine2 = new StockfishEngine(defaultWorkerOptions);

        // Start init but don't send readyok yet
        engine2.init();
        testMockWorker.simulateMessage("uciok");

        jest.clearAllMocks();

        // Call startAnalysis before readyok
        engine2.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        // Should not send position/go yet
        expect(testMockWorker.postMessage).not.toHaveBeenCalledWith("position");

        // Send readyok
        testMockWorker.simulateMessage("readyok");

        // Now should send position/isready for analysis phase
        expect(testMockWorker.postMessage).toHaveBeenCalledWith(
          `position fen rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`,
        );
        expect(testMockWorker.postMessage).toHaveBeenCalledWith("isready");
        expect(testMockWorker.postMessage).not.toHaveBeenCalledWith(
          "go infinite",
        );

        // Analysis readyok should trigger go
        testMockWorker.simulateMessage("readyok");
        expect(testMockWorker.postMessage).toHaveBeenCalledWith("go infinite");

        engine2.destroy();

        // Reset to main mock
        (global.Worker as jest.Mock).mockImplementation(() => mockWorker);
      });
    });

    describe("snapshot immutability", () => {
      it("returns deeply immutable snapshots", () => {
        jest.useFakeTimers();

        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );
        mockWorker.simulateMessage("info depth 20 score cp 123 pv e2e4 e7e5");

        jest.advanceTimersByTime(150);

        const snapshot1 = engine.getSnapshot();
        const snapshot2 = engine.getSnapshot();

        // Same reference when cached
        expect(snapshot1).toBe(snapshot2);

        // Mutating the snapshot should not affect internal state
        if (snapshot1.principalVariations[0]) {
          snapshot1.principalVariations[0].rank = 999;
        }

        // Trigger a state change to get a fresh snapshot
        engine.stopAnalysis();
        const snapshot3 = engine.getSnapshot();

        // The mutation to snapshot1 shouldn't affect snapshot3
        // (which shows the ready state, not the PV data)
        expect(snapshot3.status).toBe("ready");

        jest.useRealTimers();
      });

      it("returns new snapshot reference after update", () => {
        const snapshot1 = engine.getSnapshot();

        engine.startAnalysis(
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        );

        const snapshot2 = engine.getSnapshot();

        // Should be different reference after state change
        expect(snapshot1).not.toBe(snapshot2);
        expect(snapshot2.status).toBe("analyzing");
      });
    });

    describe("FEN change clears stale data", () => {
      it("clears previous analysis data when FEN changes", () => {
        jest.useFakeTimers();

        const fen1 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const fen2 =
          "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

        engine.startAnalysis(fen1);
        mockWorker.simulateMessage("info depth 20 score cp 123 pv e2e4");

        jest.advanceTimersByTime(150);

        let snapshot = engine.getSnapshot();
        expect(snapshot.depth).toBe(20);
        expect(snapshot.evaluation).toEqual({ type: "cp", value: 123 });
        expect(snapshot.principalVariations.length).toBe(1);

        // Stop analysis first to avoid the stop+restart flow
        engine.stopAnalysis();

        // Now start analysis with new FEN - should have cleared data
        engine.startAnalysis(fen2);

        snapshot = engine.getSnapshot();
        expect(snapshot.fen).toBe(fen2);
        expect(snapshot.depth).toBe(0); // Cleared
        expect(snapshot.evaluation).toBeNull(); // Cleared
        expect(snapshot.principalVariations.length).toBe(0); // Cleared
        expect(snapshot.hasResults).toBe(false); // Cleared

        jest.useRealTimers();
      });

      it("MAJOR: invalidates snapshot when clearing stale data before stopping", () => {
        jest.useFakeTimers();

        const fen1 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const fen2 =
          "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

        // Start analysis with first FEN and get some results
        engine.startAnalysis(fen1);
        mockWorker.simulateMessage("info depth 20 score cp 123 pv e2e4");

        jest.advanceTimersByTime(150);

        // Get snapshot with old data
        const snapshot1 = engine.getSnapshot();
        expect(snapshot1.fen).toBe(fen1);
        expect(snapshot1.depth).toBe(20);

        // Start new analysis while still analyzing (triggers stop)
        // This clears the mutableState but returns early before sendPositionAndGo
        engine.startAnalysis(fen2);

        // The snapshot should immediately reflect the cleared state
        // (previously this was stale until handleBestMove fired)
        const snapshot2 = engine.getSnapshot();
        expect(snapshot2.fen).toBe(fen2);
        expect(snapshot2.depth).toBe(0); // Should be cleared immediately
        expect(snapshot2.evaluation).toBeNull(); // Should be cleared immediately
        expect(snapshot2.principalVariations.length).toBe(0); // Should be cleared immediately

        jest.useRealTimers();
      });

      it("discards stale info lines after FEN change", () => {
        jest.useFakeTimers();

        const fen1 = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        const fen2 =
          "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";

        // Start analysis with first FEN
        engine.startAnalysis(fen1);
        mockWorker.simulateMessage("readyok");

        // Simulate info line for FEN1
        mockWorker.simulateMessage("info depth 20 score cp 123 pv e2e4");
        jest.advanceTimersByTime(150);

        let snapshot = engine.getSnapshot();
        expect(snapshot.depth).toBe(20);
        expect(snapshot.evaluation).toEqual({ type: "cp", value: 123 });

        // Start new analysis while still analyzing (triggers stop)
        engine.startAnalysis(fen2);

        // State should be cleared
        snapshot = engine.getSnapshot();
        expect(snapshot.depth).toBe(0);
        expect(snapshot.evaluation).toBeNull();

        // Simulate a late info line from the OLD analysis (FEN1)
        // This should be discarded, not applied
        mockWorker.simulateMessage("info depth 22 score cp 456 pv e2e5 e7e6");
        jest.advanceTimersByTime(150);

        // State should remain cleared - old info line was discarded
        snapshot = engine.getSnapshot();
        expect(snapshot.depth).toBe(0);
        expect(snapshot.evaluation).toBeNull();
        expect(snapshot.principalVariations.length).toBe(0);

        jest.useRealTimers();
      });
    });

    describe("config comparison", () => {
      it("does not restart when only config order differs", () => {
        const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

        engine.startAnalysis(fen, { skillLevel: 10, multiPV: 3, depth: 15 });

        jest.clearAllMocks();

        // Same config but different property order (object key order can vary)
        engine.startAnalysis(fen, { depth: 15, skillLevel: 10, multiPV: 3 });

        // Should not send new commands (config is the same)
        expect(mockWorker.postMessage).not.toHaveBeenCalledWith("position");
        expect(mockWorker.postMessage).not.toHaveBeenCalledWith("go");
      });
    });
  });
});
