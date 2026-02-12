import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessStockfish } from "./index";
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
  containerNarrow: {
    width: "320px",
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
  horizontal: { ...barBase, width: "100%", height: "30px", maxWidth: "320px" },
} satisfies Record<"vertical" | "horizontal", React.CSSProperties>;

const FEN = {
  start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  italian:
    "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  whiteWinning: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 0 1",
  blackWinning:
    "rnbqkbnr/1ppp1ppp/p5Q1/4p3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 1",
  mateIn3: "r1b1kb1r/pppp1ppp/5q2/4n3/3KP3/2N3PN/PPP4P/R1BQ1B1R b kq - 0 1",
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

const HorizontalBar = (
  props: Omit<
    React.ComponentProps<typeof ChessStockfish.EvaluationBar>,
    "orientation"
  >,
) => (
  <ChessStockfish.EvaluationBar orientation="horizontal" {...props}>
    <style>{EVAL_BAR_CSS}</style>
  </ChessStockfish.EvaluationBar>
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
  title: "React-Chess-Stockfish/Components/EvaluationBar",
  component: ChessStockfish.EvaluationBar,
  tags: ["components", "evaluation", "bar"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ChessStockfish.EvaluationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.start}>
      <div style={{ ...styles.container, ...styles.containerNarrow }}>
        <StoryHeader
          title="Vertical evaluation bar"
          subtitle="White fills from bottom, black fills from top"
          fen={FEN.start}
        />
        <VerticalBar showEvaluation style={barStyles.vertical} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.whiteWinning}>
      <div style={styles.container}>
        <StoryHeader
          title="Horizontal evaluation bar"
          subtitle="Same evaluation data in horizontal orientation"
          fen={FEN.whiteWinning}
        />
        <HorizontalBar showEvaluation style={barStyles.horizontal} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const Perspective: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.whiteWinning}>
      <div style={styles.container}>
        <StoryHeader
          title="Perspective switch"
          subtitle="Same eval value rendered from white and black perspectives"
          fen={FEN.whiteWinning}
        />
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {(["w", "b"] as const).map((perspective) => (
            <div
              key={perspective}
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <span style={{ ...styles.mono }}>
                {perspective === "w" ? "white" : "black"} perspective
              </span>
              <VerticalBar
                perspective={perspective}
                showEvaluation
                style={barStyles.vertical}
              />
            </div>
          ))}
        </div>
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const NoText: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.start}>
      <div style={{ ...styles.container, ...styles.containerNarrow }}>
        <StoryHeader
          title="Bar only"
          subtitle="Fill animation without score label"
          fen={FEN.start}
        />
        <VerticalBar showEvaluation={false} style={barStyles.vertical} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const AsChild: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.start}>
      <div style={{ ...styles.container, ...styles.containerNarrow }}>
        <StoryHeader
          title="asChild pattern"
          subtitle="Render the bar into a custom section element"
          fen={FEN.start}
        />
        <ChessStockfish.EvaluationBar asChild showEvaluation>
          <section
            style={{ ...barStyles.vertical, border: "1px solid #e2e0db" }}
          >
            <style>{EVAL_BAR_CSS}</style>
          </section>
        </ChessStockfish.EvaluationBar>
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const MateScore: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.mateIn3}>
      <div style={{ ...styles.container, ...styles.containerNarrow }}>
        <StoryHeader
          title="Mate score display"
          subtitle="Forced checkmate position shows #N notation"
          fen={FEN.mateIn3}
        />
        <VerticalBar showEvaluation style={barStyles.vertical} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const WhiteWinning: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.whiteWinning}>
      <div style={styles.container}>
        <StoryHeader
          title="White winning position"
          subtitle="Large positive evaluation"
          fen={FEN.whiteWinning}
        />
        <HorizontalBar showEvaluation style={barStyles.horizontal} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const BlackWinning: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.blackWinning}>
      <div style={styles.container}>
        <StoryHeader
          title="Black winning position"
          subtitle="Large negative evaluation"
          fen={FEN.blackWinning}
        />
        <HorizontalBar showEvaluation style={barStyles.horizontal} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};
