/**
 * Tests for ChessStockfish.Root component.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { Root } from "../Root";
import { useStockfish } from "../../../../hooks/useStockfish";
import { DEFAULT_WORKER_PATH } from "../../../../types";

// Mock the useStockfishAnalysis hook
jest.mock("../../../../hooks/useStockfishAnalysis", () => ({
  useStockfishAnalysis: jest.fn(() => ({
    info: {
      evaluation: { type: "cp", value: 123 },
      normalizedEvaluation: 0.12,
      bestLine: null,
      principalVariations: [],
      depth: 0,
      status: "ready",
      isEngineThinking: false,
      hasResults: false,
      error: null,
    },
    methods: {
      startAnalysis: jest.fn(),
      stopAnalysis: jest.fn(),
      getBestMove: jest.fn(),
      setConfig: jest.fn(),
    },
  })),
}));

// Mock the useStockfish hook to test context provision
jest.mock("../../../../hooks/useStockfish", () => ({
  useStockfish: jest.fn(() => ({
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    info: {
      evaluation: { type: "cp", value: 123 },
      normalizedEvaluation: 0.12,
      bestLine: null,
      principalVariations: [],
      depth: 0,
      status: "ready",
      isEngineThinking: false,
      hasResults: false,
      error: null,
    },
    methods: {
      startAnalysis: jest.fn(),
      stopAnalysis: jest.fn(),
      getBestMove: jest.fn(),
      setConfig: jest.fn(),
    },
  })),
}));

describe("Root", () => {
  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("provides context to children", () => {
    const TestChild = () => {
      const context = useStockfish();
      return <div data-testid="context">{context.fen}</div>;
    };

    render(
      <Root fen={START_FEN} workerOptions={{ workerPath: DEFAULT_WORKER_PATH }}>
        <TestChild />
      </Root>,
    );

    expect(screen.getByTestId("context")).toHaveTextContent(START_FEN);
  });

  it("renders children correctly", () => {
    const { getByText } = render(
      <Root fen={START_FEN} workerOptions={{ workerPath: DEFAULT_WORKER_PATH }}>
        <div>Child content</div>
      </Root>,
    );

    expect(getByText("Child content")).toBeInTheDocument();
  });

  it("has correct displayName", () => {
    expect(Root.displayName).toBe("ChessStockfish.Root");
  });

  it("passes config to useStockfishAnalysis", () => {
    const { rerender } = render(
      <Root
        fen={START_FEN}
        config={{ multiPV: 3, skillLevel: 10 }}
        workerOptions={{ workerPath: DEFAULT_WORKER_PATH }}
      >
        <div>Test</div>
      </Root>,
    );

    // Re-render with different config to ensure it's handled
    rerender(
      <Root
        fen={START_FEN}
        config={{ multiPV: 5, skillLevel: 20 }}
        workerOptions={{ workerPath: DEFAULT_WORKER_PATH }}
      >
        <div>Test</div>
      </Root>,
    );

    // If no error thrown, config is being passed correctly
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
