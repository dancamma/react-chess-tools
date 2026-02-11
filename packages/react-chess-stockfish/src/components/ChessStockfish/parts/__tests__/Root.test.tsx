/**
 * Tests for ChessStockfish.Root component.
 *
 * These tests use real integration with useStockfishAnalysis hook but mock
 * the StockfishEngine at the engine level. This allows testing the actual
 * component behavior without the overhead of a real Web Worker.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Root } from "../Root";
import { useStockfish } from "../../../../hooks/useStockfish";
import { StockfishEngine } from "../../../../engine/stockfishEngine";
import type {
  AnalysisState,
  WorkerOptions,
  StockfishConfig,
} from "../../../../types";
import { getInitialState } from "../../../../utils/config";

// Mock the StockfishEngine module - this is the correct level to mock
jest.mock("../../../../engine/stockfishEngine");

const MockedStockfishEngine = StockfishEngine as jest.MockedClass<
  typeof StockfishEngine
>;

// Mock worker path for tests
const MOCK_WORKER_PATH = "https://example.com/stockfish.js";

describe("Root", () => {
  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  let mockEngine: jest.Mocked<StockfishEngine>;
  let subscribeCallback: (() => void) | null = null;
  let currentSnapshot: AnalysisState;

  const defaultWorkerOptions: WorkerOptions = {
    workerPath: MOCK_WORKER_PATH,
  };

  beforeEach(() => {
    subscribeCallback = null;
    currentSnapshot = getInitialState();

    MockedStockfishEngine.mockClear();

    // Create a mock engine instance that simulates real behavior
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

  // Test component that consumes the Stockfish context
  const TestChild = () => {
    const context = useStockfish();
    return (
      <div>
        <div data-testid="fen">{context.fen}</div>
        <div data-testid="status">{context.info.status}</div>
        <button
          onClick={() => context.methods.startAnalysis()}
          data-testid="start-btn"
        >
          Start
        </button>
        <button
          onClick={() => context.methods.stopAnalysis()}
          data-testid="stop-btn"
        >
          Stop
        </button>
        <div data-testid="depth">{context.info.depth}</div>
      </div>
    );
  };

  it("creates and initializes StockfishEngine on mount", async () => {
    render(
      <Root fen={START_FEN} workerOptions={defaultWorkerOptions}>
        <TestChild />
      </Root>,
    );

    // Engine should be created with workerOptions
    expect(MockedStockfishEngine).toHaveBeenCalledTimes(1);
    expect(MockedStockfishEngine).toHaveBeenCalledWith(defaultWorkerOptions);

    // init() should be called
    await waitFor(() => {
      expect(mockEngine.init).toHaveBeenCalledTimes(1);
    });
  });

  it("provides context to children with correct fen", () => {
    render(
      <Root fen={START_FEN} workerOptions={defaultWorkerOptions}>
        <TestChild />
      </Root>,
    );

    expect(screen.getByTestId("fen")).toHaveTextContent(START_FEN);
  });

  it("renders children correctly", () => {
    render(
      <Root fen={START_FEN} workerOptions={defaultWorkerOptions}>
        <div>Child content</div>
      </Root>,
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("has correct displayName", () => {
    expect(Root.displayName).toBe("ChessStockfish.Root");
  });

  it("auto-starts analysis on mount", () => {
    render(
      <Root fen={START_FEN} workerOptions={defaultWorkerOptions}>
        <TestChild />
      </Root>,
    );

    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(START_FEN, {});
  });

  it("passes config to useStockfishAnalysis and engine", () => {
    const config: StockfishConfig = { multiPV: 3, skillLevel: 10 };

    render(
      <Root
        fen={START_FEN}
        config={config}
        workerOptions={defaultWorkerOptions}
      >
        <TestChild />
      </Root>,
    );

    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(START_FEN, config);
  });

  it("restarts analysis when config changes", () => {
    const config1: StockfishConfig = { multiPV: 1 };
    const config2: StockfishConfig = { multiPV: 3 };

    const { rerender } = render(
      <Root
        fen={START_FEN}
        config={config1}
        workerOptions={defaultWorkerOptions}
      >
        <TestChild />
      </Root>,
    );

    // Clear calls from initial render
    mockEngine.startAnalysis.mockClear();

    // Re-render with different config
    rerender(
      <Root
        fen={START_FEN}
        config={config2}
        workerOptions={defaultWorkerOptions}
      >
        <TestChild />
      </Root>,
    );

    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(START_FEN, config2);
  });

  it("restarts analysis when fen changes", () => {
    const { rerender } = render(
      <Root fen={START_FEN} workerOptions={defaultWorkerOptions}>
        <TestChild />
      </Root>,
    );

    // Clear calls from initial render
    mockEngine.startAnalysis.mockClear();

    const newFen =
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
    rerender(
      <Root fen={newFen} workerOptions={defaultWorkerOptions}>
        <TestChild />
      </Root>,
    );

    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(newFen, {});
  });

  it("exposes engine state through context", async () => {
    render(
      <Root fen={START_FEN} workerOptions={defaultWorkerOptions}>
        <TestChild />
      </Root>,
    );

    // Initial state should be "initializing"
    expect(screen.getByTestId("status")).toHaveTextContent("initializing");
    expect(screen.getByTestId("depth")).toHaveTextContent("0");

    // Simulate engine state update
    currentSnapshot = {
      ...getInitialState(),
      status: "analyzing",
      isEngineThinking: true,
      evaluation: { type: "cp", value: 50 },
      depth: 12,
      hasResults: true,
    };

    // Notify subscribers - wrap in act since it triggers React state update
    await waitFor(() => {
      if (subscribeCallback) {
        subscribeCallback();
      }
    });

    // State should be updated in the UI
    expect(screen.getByTestId("status")).toHaveTextContent("analyzing");
    expect(screen.getByTestId("depth")).toHaveTextContent("12");
  });

  it("provides working methods through context", async () => {
    render(
      <Root fen={START_FEN} workerOptions={defaultWorkerOptions}>
        <TestChild />
      </Root>,
    );

    // Test stopAnalysis method
    mockEngine.startAnalysis.mockClear();
    mockEngine.stopAnalysis.mockClear();

    screen.getByTestId("stop-btn").click();

    expect(mockEngine.stopAnalysis).toHaveBeenCalledTimes(1);

    // Test startAnalysis method
    screen.getByTestId("start-btn").click();

    expect(mockEngine.startAnalysis).toHaveBeenCalled();
  });

  it("destroys engine on unmount", () => {
    const { unmount } = render(
      <Root fen={START_FEN} workerOptions={defaultWorkerOptions}>
        <TestChild />
      </Root>,
    );

    unmount();

    expect(mockEngine.destroy).toHaveBeenCalledTimes(1);
  });

  it("uses default empty config when none provided", () => {
    render(
      <Root fen={START_FEN} workerOptions={defaultWorkerOptions}>
        <TestChild />
      </Root>,
    );

    expect(mockEngine.startAnalysis).toHaveBeenCalledWith(START_FEN, {});
  });

  describe("callbacks", () => {
    it("calls onEvaluationChange when evaluation changes", async () => {
      const onEvaluationChange = jest.fn();

      render(
        <Root
          fen={START_FEN}
          workerOptions={defaultWorkerOptions}
          onEvaluationChange={onEvaluationChange}
        >
          <TestChild />
        </Root>,
      );

      // Initial state has no evaluation
      expect(onEvaluationChange).not.toHaveBeenCalled();

      // Simulate engine state update with evaluation
      currentSnapshot = {
        ...getInitialState(),
        evaluation: { type: "cp", value: 50 },
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onEvaluationChange).toHaveBeenCalledWith({
        type: "cp",
        value: 50,
      });

      // Simulate another evaluation change
      currentSnapshot = {
        ...currentSnapshot,
        evaluation: { type: "cp", value: 100 },
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onEvaluationChange).toHaveBeenCalledWith({
        type: "cp",
        value: 100,
      });
    });

    it("calls onDepthChange when depth changes", async () => {
      const onDepthChange = jest.fn();

      render(
        <Root
          fen={START_FEN}
          workerOptions={defaultWorkerOptions}
          onDepthChange={onDepthChange}
        >
          <TestChild />
        </Root>,
      );

      // Initial depth is 0, callback should not be called on mount
      expect(onDepthChange).not.toHaveBeenCalled();

      // Simulate depth change
      currentSnapshot = {
        ...getInitialState(),
        depth: 12,
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onDepthChange).toHaveBeenCalledWith(12);

      // Simulate another depth change
      currentSnapshot = {
        ...currentSnapshot,
        depth: 15,
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onDepthChange).toHaveBeenCalledWith(15);
    });

    it("calls onError when error occurs", async () => {
      const onError = jest.fn();
      const testError = new Error("Worker failed to load");

      render(
        <Root
          fen={START_FEN}
          workerOptions={defaultWorkerOptions}
          onError={onError}
        >
          <TestChild />
        </Root>,
      );

      // Initial state has no error
      expect(onError).not.toHaveBeenCalled();

      // Simulate error state
      currentSnapshot = {
        ...getInitialState(),
        status: "error",
        error: testError,
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onError).toHaveBeenCalledWith(testError);
    });

    it("calls onError for distinct error objects with same message", async () => {
      const onError = jest.fn();
      const error1 = new Error("Worker failed to load");
      const error2 = new Error("Worker failed to load");

      render(
        <Root
          fen={START_FEN}
          workerOptions={defaultWorkerOptions}
          onError={onError}
        >
          <TestChild />
        </Root>,
      );

      currentSnapshot = {
        ...getInitialState(),
        status: "error",
        error: error1,
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      currentSnapshot = {
        ...getInitialState(),
        status: "error",
        error: error2,
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onError).toHaveBeenCalledTimes(2);
      expect(onError).toHaveBeenNthCalledWith(1, error1);
      expect(onError).toHaveBeenNthCalledWith(2, error2);
    });

    it("does not call onEvaluationChange when evaluation is the same", async () => {
      const onEvaluationChange = jest.fn();
      const evaluation = { type: "cp" as const, value: 50 };

      render(
        <Root
          fen={START_FEN}
          workerOptions={defaultWorkerOptions}
          onEvaluationChange={onEvaluationChange}
        >
          <TestChild />
        </Root>,
      );

      // Simulate first evaluation
      currentSnapshot = {
        ...getInitialState(),
        evaluation,
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onEvaluationChange).toHaveBeenCalledTimes(1);

      // Trigger another snapshot update (e.g., depth change) with same evaluation
      currentSnapshot = {
        ...currentSnapshot,
        depth: 10,
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      // Should still be called only once since evaluation didn't change
      expect(onEvaluationChange).toHaveBeenCalledTimes(1);
    });

    it("handles mate score evaluation changes", async () => {
      const onEvaluationChange = jest.fn();

      render(
        <Root
          fen={START_FEN}
          workerOptions={defaultWorkerOptions}
          onEvaluationChange={onEvaluationChange}
        >
          <TestChild />
        </Root>,
      );

      // Simulate mate evaluation
      currentSnapshot = {
        ...getInitialState(),
        evaluation: { type: "mate", value: 3 },
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onEvaluationChange).toHaveBeenCalledWith({
        type: "mate",
        value: 3,
      });
    });

    it("calls onEvaluationChange when evaluation transitions from cp to mate", async () => {
      const onEvaluationChange = jest.fn();

      render(
        <Root
          fen={START_FEN}
          workerOptions={defaultWorkerOptions}
          onEvaluationChange={onEvaluationChange}
        >
          <TestChild />
        </Root>,
      );

      // Start with cp evaluation
      currentSnapshot = {
        ...getInitialState(),
        evaluation: { type: "cp", value: 500 },
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onEvaluationChange).toHaveBeenCalledWith({
        type: "cp",
        value: 500,
      });

      // Transition to mate
      currentSnapshot = {
        ...currentSnapshot,
        evaluation: { type: "mate", value: 2 },
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onEvaluationChange).toHaveBeenCalledWith({
        type: "mate",
        value: 2,
      });
    });

    it("works with all callbacks simultaneously", async () => {
      const onEvaluationChange = jest.fn();
      const onDepthChange = jest.fn();
      const onError = jest.fn();

      render(
        <Root
          fen={START_FEN}
          workerOptions={defaultWorkerOptions}
          onEvaluationChange={onEvaluationChange}
          onDepthChange={onDepthChange}
          onError={onError}
        >
          <TestChild />
        </Root>,
      );

      // Simulate state update with all values changing
      currentSnapshot = {
        ...getInitialState(),
        evaluation: { type: "cp", value: 75 },
        depth: 18,
        status: "analyzing",
        isEngineThinking: true,
        hasResults: true,
      };

      await waitFor(() => {
        if (subscribeCallback) subscribeCallback();
      });

      expect(onEvaluationChange).toHaveBeenCalledWith({
        type: "cp",
        value: 75,
      });
      expect(onDepthChange).toHaveBeenCalledWith(18);
      expect(onError).not.toHaveBeenCalled();
    });
  });
});
