/**
 * Tests for useStockfish hook
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { useStockfish } from "../useStockfish";
import { StockfishContext } from "../useStockfishContext";
import type { StockfishContextValue } from "../useStockfishContext";
import type { AnalysisInfo, AnalysisMethods } from "../../types";

// Mock context value for testing
const mockInfo: AnalysisInfo = {
  evaluation: { type: "cp", value: 123 },
  normalizedEvaluation: 0.12,
  bestLine: null,
  principalVariations: [],
  depth: 15,
  status: "analyzing",
  isEngineThinking: true,
  hasResults: true,
  error: null,
};

const mockMethods: AnalysisMethods = {
  startAnalysis: jest.fn(),
  stopAnalysis: jest.fn(),
  getBestMove: jest.fn(),
  setConfig: jest.fn(),
};

const mockContextValue: StockfishContextValue = {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  info: mockInfo,
  methods: mockMethods,
};

describe("useStockfish", () => {
  it("returns context value when used within provider", () => {
    function TestComponent() {
      const context = useStockfish();
      return (
        <div>
          <span data-testid="fen">{context.fen}</span>
          <span data-testid="status">{context.info.status}</span>
          <span data-testid="eval">{context.info.evaluation?.value}</span>
        </div>
      );
    }

    render(
      <StockfishContext.Provider value={mockContextValue}>
        <TestComponent />
      </StockfishContext.Provider>,
    );

    expect(screen.getByTestId("fen")).toHaveTextContent(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    );
    expect(screen.getByTestId("status")).toHaveTextContent("analyzing");
    expect(screen.getByTestId("eval")).toHaveTextContent("123");
  });

  it("throws descriptive error when used outside provider", () => {
    // Suppress console.error for this test (React logs the error twice)
    const originalError = console.error;
    console.error = jest.fn();

    function TestComponent() {
      useStockfish();
      return <div>Should not render</div>;
    }

    expect(() => render(<TestComponent />)).toThrow(
      "useStockfish must be used within a ChessStockfish.Root provider",
    );

    console.error = originalError;
  });

  it("provides stable methods reference", () => {
    const contexts: StockfishContextValue[] = [];

    function TestComponent() {
      const context = useStockfish();
      contexts.push(context);
      return null;
    }

    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <StockfishContext.Provider value={mockContextValue}>
          {children}
        </StockfishContext.Provider>
      );
    }

    const { rerender } = render(
      <Wrapper>
        <TestComponent />
      </Wrapper>,
    );

    // Trigger a re-render to capture the context again
    rerender(
      <Wrapper>
        <TestComponent />
      </Wrapper>,
    );

    // Should have captured context on both renders
    expect(contexts.length).toBeGreaterThanOrEqual(2);
    // Methods should be the same reference
    expect(contexts[0].methods).toBe(contexts[1].methods);
    expect(contexts[0].methods.startAnalysis).toBe(
      contexts[1].methods.startAnalysis,
    );
  });

  it("provides all expected context properties", () => {
    const contexts: StockfishContextValue[] = [];

    function TestComponent() {
      const context = useStockfish();
      contexts.push(context);
      return null;
    }

    render(
      <StockfishContext.Provider value={mockContextValue}>
        <TestComponent />
      </StockfishContext.Provider>,
    );

    const capturedContext = contexts[0];
    expect(capturedContext).toBeDefined();
    expect(capturedContext).toHaveProperty("fen");
    expect(capturedContext).toHaveProperty("info");
    expect(capturedContext).toHaveProperty("methods");
    expect(capturedContext.fen).toBe(mockContextValue.fen);
    expect(capturedContext.info).toBe(mockContextValue.info);
    expect(capturedContext.methods).toBe(mockContextValue.methods);
  });
});
