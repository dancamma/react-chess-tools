import React, { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EngineLines } from "../EngineLines";
import { StockfishContext } from "../../../../hooks/useStockfishContext";
import type { StockfishContextValue } from "../../../../hooks/useStockfishContext";
import type {
  AnalysisMethods,
  AnalysisInfo,
  PrincipalVariation,
} from "../../../../types";
import { formatEvaluation } from "../../../../utils/evaluation";

const principalVariations: PrincipalVariation[] = [
  {
    rank: 1,
    evaluation: { type: "cp", value: 45 },
    moves: [
      { uci: "e2e4", san: "e4" },
      { uci: "e7e5", san: "e5" },
      { uci: "g1f3", san: "Nf3" },
    ],
  },
  {
    rank: 2,
    evaluation: { type: "cp", value: 10 },
    moves: [
      { uci: "d2d4", san: "d4" },
      { uci: "d7d5", san: "d5" },
    ],
  },
];

const mockInfo: AnalysisInfo = {
  evaluation: principalVariations[0].evaluation,
  normalizedEvaluation: 0.2,
  bestLine: principalVariations[0],
  principalVariations,
  depth: 22,
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

const contextValue: StockfishContextValue = {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  info: mockInfo,
  methods: mockMethods,
};

function renderWithContext(
  element: React.ReactElement,
  overrides?: Partial<StockfishContextValue>,
) {
  const value: StockfishContextValue = {
    ...contextValue,
    ...overrides,
    info: {
      ...contextValue.info,
      ...(overrides?.info ?? {}),
    },
    methods: overrides?.methods ?? contextValue.methods,
  };

  return render(
    <StockfishContext.Provider value={value}>
      {element}
    </StockfishContext.Provider>,
  );
}

describe("EngineLines", () => {
  it("renders principal variations with data attributes", () => {
    const { container } = renderWithContext(
      <EngineLines data-testid="engine-lines" />,
    );

    const root = screen.getByTestId("engine-lines");
    expect(root).toBeInTheDocument();

    const firstLine = container.querySelector('[data-pv-rank="1"]');
    expect(firstLine).toHaveAttribute(
      "data-eval",
      formatEvaluation(principalVariations[0].evaluation),
    );
    expect(firstLine).toHaveAttribute("data-depth", "22");
    expect(firstLine).toHaveAttribute("data-uci-moves", "e2e4 e7e5 g1f3");

    const move = container.querySelector('[data-uci="e2e4"]');
    expect(move).toHaveAttribute("data-move");
    expect(move).toHaveTextContent("e4");
  });

  it("renders evaluation text", () => {
    renderWithContext(<EngineLines />);
    expect(screen.getByText("+0.5")).toBeInTheDocument();
  });

  it("renders moves with move numbers", () => {
    renderWithContext(<EngineLines />);
    expect(screen.getByText("1.e4")).toBeInTheDocument();
    expect(screen.getByText("e5")).toBeInTheDocument();
    expect(screen.getByText("2.Nf3")).toBeInTheDocument();
  });

  it("renders move numbers correctly when black is to move", () => {
    renderWithContext(<EngineLines />, {
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
    });
    expect(screen.getByText("1...e4")).toBeInTheDocument();
    expect(screen.getByText("2.e5")).toBeInTheDocument();
  });

  it("respects maxLines", () => {
    const { container } = renderWithContext(<EngineLines maxLines={1} />);
    const lines = container.querySelectorAll("[data-pv-rank]");
    expect(lines).toHaveLength(1);
    expect(lines[0]).toHaveAttribute("data-pv-rank", "1");
  });

  it("calls onLineClick with rank and pv", () => {
    const onLineClick = jest.fn();
    const { container } = renderWithContext(
      <EngineLines onLineClick={onLineClick} />,
    );

    const secondLine = container.querySelector('[data-pv-rank="2"]');
    expect(secondLine).toBeTruthy();

    fireEvent.click(secondLine as HTMLElement);

    expect(onLineClick).toHaveBeenCalledTimes(1);
    expect(onLineClick).toHaveBeenCalledWith(2, principalVariations[1]);
  });

  it("supports keyboard interaction for clickable lines", () => {
    const onLineClick = jest.fn();
    const { container } = renderWithContext(
      <EngineLines onLineClick={onLineClick} />,
    );

    const firstLine = container.querySelector('[data-pv-rank="1"]');
    expect(firstLine).toHaveAttribute("role", "button");
    expect(firstLine).toHaveAttribute("tabIndex", "0");

    fireEvent.keyDown(firstLine as HTMLElement, { key: "Enter" });
    expect(onLineClick).toHaveBeenCalledWith(1, principalVariations[0]);

    fireEvent.keyDown(firstLine as HTMLElement, { key: " " });
    expect(onLineClick).toHaveBeenCalledTimes(2);
  });

  it("does not add button attributes when not interactive", () => {
    const { container } = renderWithContext(<EngineLines />);
    const firstLine = container.querySelector('[data-pv-rank="1"]');
    expect(firstLine).not.toHaveAttribute("role");
    expect(firstLine).not.toHaveAttribute("tabIndex");
  });

  it("supports asChild", () => {
    const { container } = renderWithContext(
      <EngineLines asChild>
        <section data-testid="custom-root" />
      </EngineLines>,
    );

    const root = screen.getByTestId("custom-root");
    expect(root.tagName).toBe("SECTION");
    expect(container.querySelector('[data-pv-rank="1"]')).toBeTruthy();
  });

  it("supports forwardRef", () => {
    const ref = createRef<HTMLDivElement>();
    renderWithContext(<EngineLines ref={ref} data-testid="engine-lines" />);

    expect(ref.current).toBe(screen.getByTestId("engine-lines"));
  });

  it("keeps non-template children appended after rendered lines", () => {
    const { container } = renderWithContext(
      <EngineLines maxLines={1}>
        <div data-testid="after-lines">after</div>
      </EngineLines>,
    );

    const line = container.querySelector('[data-pv-rank="1"]');
    const after = screen.getByTestId("after-lines");

    expect(line?.nextSibling).toBe(after);
  });
});
