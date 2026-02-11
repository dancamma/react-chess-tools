/**
 * Tests for ChessStockfish.EvaluationBar component.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { ChessStockfish } from "../../index";

// Mock worker path for tests
const MOCK_WORKER_PATH = "https://example.com/stockfish.js";

// Mock Worker constructor - simple mock for component tests
const mockWorker = {
  onmessage: null,
  onerror: null,
  onmessageerror: null,
  postMessage: jest.fn(),
  terminate: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(() => true),
};

beforeEach(() => {
  jest.clearAllMocks();
  global.Worker = jest.fn(
    () => mockWorker as unknown as Worker,
  ) as unknown as typeof Worker;
});

describe("EvaluationBar", () => {
  const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  it("renders with data attributes", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar data-testid="eval-bar" />
      </ChessStockfish.Root>,
    );

    const bar = screen.getByTestId("eval-bar");

    // Check orientation data attribute
    expect(bar).toHaveAttribute("data-stockfish-orientation", "vertical");

    // Check perspective data attribute (default is "white")
    expect(bar).toHaveAttribute("data-stockfish-perspective", "white");

    // Check evaluation data attributes
    expect(bar).toHaveAttribute("data-stockfish-eval-type");
    expect(bar).not.toHaveAttribute("data-stockfish-eval-value");

    // Check fill-percentage data attribute
    expect(bar).toHaveAttribute("data-stockfish-fill-percentage");
  });

  it("renders horizontal orientation correctly", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar
          orientation="horizontal"
          data-testid="eval-bar"
        />
      </ChessStockfish.Root>,
    );

    const bar = screen.getByTestId("eval-bar");
    expect(bar).toHaveAttribute("data-stockfish-orientation", "horizontal");
  });

  it("shows evaluation text when showEvaluation is true", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar showEvaluation data-testid="eval-bar" />
      </ChessStockfish.Root>,
    );

    const evalBar = screen.getByTestId("eval-bar");
    expect(evalBar.querySelector("[data-stockfish-eval-text]")).toBeTruthy();
  });

  it("hides evaluation text when showEvaluation is false", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar
          showEvaluation={false}
          data-testid="eval-bar"
        />
      </ChessStockfish.Root>,
    );

    const bar = screen.getByTestId("eval-bar");
    expect(bar.querySelector("[data-stockfish-eval-text]")).toBeNull();
  });

  it("renders fill div with scaleY transform for vertical orientation", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar data-testid="eval-bar" />
      </ChessStockfish.Root>,
    );

    const bar = screen.getByTestId("eval-bar");
    const fill = bar.querySelector("[data-stockfish-fill]");
    expect(fill).toBeTruthy();

    // Vertical orientation should use scaleY transform
    expect(fill?.getAttribute("style")).toContain("scaleY");
  });

  it("renders fill div with scaleX transform for horizontal orientation", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar
          orientation="horizontal"
          data-testid="eval-bar"
        />
      </ChessStockfish.Root>,
    );

    const bar = screen.getByTestId("eval-bar");
    const fill = bar.querySelector("[data-stockfish-fill]");
    expect(fill).toBeTruthy();

    // Horizontal orientation should use scaleX transform
    expect(fill?.getAttribute("style")).toContain("scaleX");
  });

  it("applies custom className", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar
          className="custom-class"
          data-testid="eval-bar"
        />
      </ChessStockfish.Root>,
    );

    const bar = screen.getByTestId("eval-bar");
    expect(bar).toHaveClass("custom-class");
  });

  it("supports asChild pattern", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar asChild>
          <section data-testid="custom-element" />
        </ChessStockfish.EvaluationBar>
      </ChessStockfish.Root>,
    );

    // Should render as section instead of div
    const element = screen.getByTestId("custom-element");
    expect(element.tagName).toBe("SECTION");
  });

  it("calculates fill percentage correctly", () => {
    // This is a conceptual test - actual fill percentage depends on engine output
    // The component should normalize the evaluation to 0-100% range
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar data-testid="eval-bar" />
      </ChessStockfish.Root>,
    );

    const bar = screen.getByTestId("eval-bar");
    const fillPercentage = bar.getAttribute("data-stockfish-fill-percentage");

    // Should be a number between 0 and 100
    expect(fillPercentage).toBeTruthy();
    const num = parseInt(fillPercentage || "", 10);
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThanOrEqual(100);
  });

  it("renders with black perspective", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar
          perspective="black"
          data-testid="eval-bar"
        />
      </ChessStockfish.Root>,
    );

    const bar = screen.getByTestId("eval-bar");
    expect(bar).toHaveAttribute("data-stockfish-perspective", "black");
    expect(bar).toHaveAttribute("data-stockfish-fill-origin", "top");
  });

  it("keeps fill percentage semantics identical across perspectives", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar
          perspective="white"
          data-testid="eval-bar-white"
        />
        <ChessStockfish.EvaluationBar
          perspective="black"
          data-testid="eval-bar-black"
        />
      </ChessStockfish.Root>,
    );

    const barWhite = screen.getByTestId("eval-bar-white");
    const barBlack = screen.getByTestId("eval-bar-black");

    const fillWhite = parseInt(
      barWhite.getAttribute("data-stockfish-fill-percentage") || "",
      10,
    );
    const fillBlack = parseInt(
      barBlack.getAttribute("data-stockfish-fill-percentage") || "",
      10,
    );

    // Perspective should only affect visual origin, not semantic value mapping.
    expect(fillWhite).toBe(fillBlack);
  });

  it("changes vertical fill anchor based on perspective", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar
          perspective="white"
          data-testid="eval-bar-white"
        />
        <ChessStockfish.EvaluationBar
          perspective="black"
          data-testid="eval-bar-black"
        />
      </ChessStockfish.Root>,
    );

    const barWhite = screen.getByTestId("eval-bar-white");
    const barBlack = screen.getByTestId("eval-bar-black");

    expect(barWhite).toHaveAttribute("data-stockfish-fill-origin", "bottom");
    expect(barBlack).toHaveAttribute("data-stockfish-fill-origin", "top");

    const whiteFill = barWhite.querySelector(
      "[data-stockfish-fill]",
    ) as HTMLDivElement | null;
    const blackFill = barBlack.querySelector(
      "[data-stockfish-fill]",
    ) as HTMLDivElement | null;

    expect(whiteFill).toBeTruthy();
    expect(blackFill).toBeTruthy();
    expect(whiteFill?.style.transformOrigin).toBe("bottom");
    expect(blackFill?.style.transformOrigin).toBe("top");
  });

  it("changes horizontal fill anchor based on perspective", () => {
    render(
      <ChessStockfish.Root
        fen={START_FEN}
        workerOptions={{ workerPath: MOCK_WORKER_PATH }}
      >
        <ChessStockfish.EvaluationBar
          orientation="horizontal"
          perspective="white"
          data-testid="eval-bar-white"
        />
        <ChessStockfish.EvaluationBar
          orientation="horizontal"
          perspective="black"
          data-testid="eval-bar-black"
        />
      </ChessStockfish.Root>,
    );

    const barWhite = screen.getByTestId("eval-bar-white");
    const barBlack = screen.getByTestId("eval-bar-black");

    expect(barWhite).toHaveAttribute("data-stockfish-fill-origin", "left");
    expect(barBlack).toHaveAttribute("data-stockfish-fill-origin", "right");

    const whiteFill = barWhite.querySelector(
      "[data-stockfish-fill]",
    ) as HTMLDivElement | null;
    const blackFill = barBlack.querySelector(
      "[data-stockfish-fill]",
    ) as HTMLDivElement | null;

    expect(whiteFill).toBeTruthy();
    expect(blackFill).toBeTruthy();
    expect(whiteFill?.style.transformOrigin).toBe("left");
    expect(blackFill?.style.transformOrigin).toBe("right");
  });
});

describe("EvaluationBar displayName", () => {
  it("has correct displayName for DevTools", () => {
    // Import directly from the component file to check displayName
    const { EvaluationBar } = require("../EvaluationBar");
    expect(EvaluationBar.displayName).toBe("ChessStockfish.EvaluationBar");
  });
});
