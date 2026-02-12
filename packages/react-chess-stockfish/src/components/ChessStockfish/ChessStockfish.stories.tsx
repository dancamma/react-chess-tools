import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessStockfish } from "./index";
import { EngineLines } from "./parts/EngineLines";
import { useStockfish } from "../../hooks/useStockfish";

const WORKER_PATH = "/stockfish.js";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "24px",
    width: "420px",
    maxWidth: "100%",
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  header: {
    textAlign: "center",
  },
  title: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#2d2d2d",
    margin: "0 0 4px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#7a7a72",
    margin: 0,
    lineHeight: 1.4,
  },
  mono: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "#7a7a72",
  },
  fen: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "#a5a59c",
    background: "#f9f9f9",
    padding: "6px 8px",
    borderRadius: "4px",
    wordBreak: "break-all",
    lineHeight: 1.4,
  },
  rootCombined: {
    display: "grid",
    gridTemplateColumns: "30px minmax(0, 1fr)",
    gap: "12px",
    alignItems: "start",
    width: "100%",
  },
} satisfies Record<string, React.CSSProperties>;

const barBase: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "4px",
  background: "#403d39",
  border: "1px solid #5b5752",
};

const barStyles = {
  vertical: { ...barBase, width: "30px", height: "220px" },
} satisfies Record<"vertical", React.CSSProperties>;

const FEN = {
  start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
};

const EVAL_BAR_CSS = `
  [data-stockfish-orientation="vertical"],
  [data-stockfish-orientation="horizontal"] {
    --eval-light: #fff;
    --eval-dark: #403d39;
    position: relative;
    overflow: hidden;
    border-radius: 4px;
    user-select: none;
  }

  [data-stockfish-fill] {
    position: absolute;
    inset: 0;
    background: var(--eval-light);
    transition: transform 0.8s ease;
  }

  [data-stockfish-eval-text] {
    display: var(--evaluation-bar-score-display, block);
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1;
    position: absolute;
    text-align: center;
    white-space: nowrap;
    width: 100%;
    z-index: 2;
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="w"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    top: 6px;
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="w"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    bottom: 6px;
    color: var(--eval-dark);
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="b"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    bottom: 6px;
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="b"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    color: var(--eval-dark);
    top: 6px;
  }

  [data-stockfish-orientation="horizontal"] [data-stockfish-eval-text] {
    padding: 0 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: auto;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="w"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    right: 0;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="w"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    color: var(--eval-dark);
    left: 0;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="b"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    left: 0;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="b"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    color: var(--eval-dark);
    right: 0;
  }

  [data-stockfish-eval-type="none"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    top: 50%;
    transform: translateY(-50%);
  }
`;

const ENGINE_LINES_CSS = `
  [data-pv-rank] {
    align-items: baseline;
    background: #f7f7f7;
    border-bottom: 1px solid #d8d8d8;
    display: grid;
    font-family: "Noto Sans", "Inter", sans-serif;
    font-size: 15px;
    grid-template-columns: 64px minmax(0, 1fr);
    line-height: 1.35;
    padding: 6px 10px;
  }

  [data-eval-text] {
    color: #1f1f1f;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }

  [data-moves] {
    color: #2e2e2e;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [data-pv-rank="1"] {
    border-top: 1px solid #d8d8d8;
  }
`;

type RootProps = Omit<
  React.ComponentProps<typeof ChessStockfish.Root>,
  "workerOptions"
>;

function AnalysisRoot(props: RootProps) {
  return (
    <ChessStockfish.Root
      workerOptions={{ workerPath: WORKER_PATH }}
      {...props}
    />
  );
}

function StoryHeader({
  title,
  subtitle,
  fen,
}: {
  title: string;
  subtitle: string;
  fen?: string;
}) {
  return (
    <div style={styles.header}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.subtitle}>{subtitle}</p>
      {fen && <div style={styles.fen}>{fen}</div>}
    </div>
  );
}

const VerticalBar = (
  props: Omit<
    React.ComponentProps<typeof ChessStockfish.EvaluationBar>,
    "orientation"
  >,
) => (
  <ChessStockfish.EvaluationBar orientation="vertical" {...props}>
    <style>{EVAL_BAR_CSS}</style>
  </ChessStockfish.EvaluationBar>
);

const StyledEngineLines = (props: React.ComponentProps<typeof EngineLines>) => (
  <EngineLines {...props}>
    <style>{ENGINE_LINES_CSS}</style>
  </EngineLines>
);

function EngineStatus() {
  const { info, methods } = useStockfish();
  const bestMove = methods.getBestMove();

  return (
    <div
      style={{
        ...styles.mono,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div style={{ display: "flex", gap: "12px" }}>
        <span>depth: {info.depth}</span>
        <span>
          status:{" "}
          {info.isEngineThinking ? (
            <span style={{ color: "#22c55e" }}>thinking</span>
          ) : (
            <span style={{ color: "#a5a59c" }}>ready</span>
          )}
        </span>
      </div>
      {bestMove && (
        <span>
          best:{" "}
          <span style={{ color: "#2d2d2d", fontWeight: 600 }}>
            {bestMove.san}
          </span>
        </span>
      )}
    </div>
  );
}

const meta = {
  title: "React-Chess-Stockfish/Components/ChessStockfish",
  component: ChessStockfish.Root,
  tags: ["components", "stockfish", "analysis"],
  parameters: { layout: "centered" },
  args: {
    fen: FEN.start,
    workerOptions: { workerPath: WORKER_PATH },
    children: null,
  },
} satisfies Meta<typeof ChessStockfish.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullLayout: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.start} config={{ multiPV: 3 }}>
      <div style={styles.container}>
        <StoryHeader
          title="Full layout"
          subtitle="Evaluation bar and engine lines combined"
          fen={FEN.start}
        />
        <div style={styles.rootCombined}>
          <VerticalBar showEvaluation style={barStyles.vertical} />
          <StyledEngineLines maxLines={3} />
        </div>
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};
