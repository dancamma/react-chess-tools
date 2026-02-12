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
  hint: {
    fontSize: "12px",
    color: "#a5a59c",
    margin: 0,
    lineHeight: 1.5,
  },
  mono: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "#7a7a72",
  },
  rootCombined: {
    display: "grid",
    gridTemplateColumns: "30px minmax(0, 1fr)",
    gap: "12px",
    alignItems: "start",
    width: "100%",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
  },
  selectedLine: {
    background: "#fff",
    border: "1px solid #e2e0db",
    borderRadius: "6px",
    padding: "8px 10px",
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
  horizontal: { ...barBase, width: "100%", height: "30px", maxWidth: "320px" },
} satisfies Record<"vertical" | "horizontal", React.CSSProperties>;

const FEN = {
  start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  italian:
    "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  whiteWinning: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 0 1",
  blackWinning:
    "rnbqkbnr/1ppp1ppp/p5Q1/4p3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 1",
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

function StoryHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={styles.header}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.subtitle}>{subtitle}</p>
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
  title: "react-chess-stockfish/Components/ChessStockfish",
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

// Root stories (bar + lines)
export const RootDefault: Story = {
  name: "Root/Default (Bar + Lines)",
  render: () => (
    <AnalysisRoot fen={FEN.start} config={{ multiPV: 3 }}>
      <div style={styles.container}>
        <StoryHeader
          title="Root composition"
          subtitle="Default position with evaluation bar and lines"
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

export const RootItalianMultiPV: Story = {
  name: "Root/Italian MultiPV (Bar + Lines)",
  render: () => (
    <AnalysisRoot fen={FEN.italian} config={{ multiPV: 4 }}>
      <div style={styles.container}>
        <StoryHeader
          title="Root with multiPV"
          subtitle="Italian opening with four principal variations"
        />
        <div style={styles.rootCombined}>
          <VerticalBar showEvaluation style={barStyles.vertical} />
          <StyledEngineLines maxLines={4} />
        </div>
        <EngineStatus />
        <p style={styles.hint}>PV1 drives the evaluation bar value.</p>
      </div>
    </AnalysisRoot>
  ),
};

export const RootBlackToMove: Story = {
  name: "Root/Black To Move (Bar + Lines)",
  render: () => (
    <AnalysisRoot fen={FEN.blackWinning} config={{ multiPV: 2 }}>
      <div style={styles.container}>
        <StoryHeader
          title="Root black-to-move view"
          subtitle="Horizontal bar plus lines with black starting move"
        />
        <div style={styles.stack}>
          <HorizontalBar showEvaluation style={barStyles.horizontal} />
          <StyledEngineLines maxLines={2} />
        </div>
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

// EvaluationBar stories
export const EvaluationBarVertical: Story = {
  name: "EvaluationBar/Vertical",
  render: () => (
    <AnalysisRoot fen={FEN.start}>
      <div style={{ ...styles.container, ...styles.containerNarrow }}>
        <StoryHeader
          title="Vertical evaluation bar"
          subtitle="White fills from bottom, black fills from top"
        />
        <VerticalBar showEvaluation style={barStyles.vertical} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const EvaluationBarHorizontal: Story = {
  name: "EvaluationBar/Horizontal",
  render: () => (
    <AnalysisRoot fen={FEN.whiteWinning}>
      <div style={styles.container}>
        <StoryHeader
          title="Horizontal evaluation bar"
          subtitle="Same evaluation data in horizontal orientation"
        />
        <HorizontalBar showEvaluation style={barStyles.horizontal} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const EvaluationBarPerspective: Story = {
  name: "EvaluationBar/Perspective",
  render: () => (
    <AnalysisRoot fen={FEN.italian}>
      <div style={styles.container}>
        <StoryHeader
          title="Perspective switch"
          subtitle="Same eval value rendered from white and black perspectives"
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

export const EvaluationBarNoText: Story = {
  name: "EvaluationBar/No Text",
  render: () => (
    <AnalysisRoot fen={FEN.start}>
      <div style={{ ...styles.container, ...styles.containerNarrow }}>
        <StoryHeader
          title="Bar only"
          subtitle="Fill animation without score label"
        />
        <VerticalBar showEvaluation={false} style={barStyles.vertical} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const EvaluationBarAsChild: Story = {
  name: "EvaluationBar/asChild",
  render: () => (
    <AnalysisRoot fen={FEN.start}>
      <div style={{ ...styles.container, ...styles.containerNarrow }}>
        <StoryHeader
          title="asChild pattern"
          subtitle="Render the bar into a custom section element"
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

// Lines stories
export const LinesBasic: Story = {
  name: "Lines/Basic",
  render: () => (
    <AnalysisRoot fen={FEN.italian} config={{ multiPV: 3 }}>
      <div style={styles.container}>
        <StoryHeader
          title="Engine lines"
          subtitle="Default composed rows with evaluation and move list"
        />
        <StyledEngineLines maxLines={3} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const LinesBlackToMove: Story = {
  name: "Lines/Black To Move",
  render: () => (
    <AnalysisRoot fen={FEN.blackWinning} config={{ multiPV: 2 }}>
      <div style={styles.container}>
        <StoryHeader
          title="Black-to-move lines"
          subtitle="First SAN token starts with the 1... prefix"
        />
        <StyledEngineLines maxLines={2} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const LinesClickable: Story = {
  name: "Lines/Clickable",
  render: () => {
    const [selected, setSelected] = React.useState("Click a line");

    return (
      <AnalysisRoot fen={FEN.italian} config={{ multiPV: 3 }}>
        <div style={styles.container}>
          <StoryHeader
            title="Clickable lines"
            subtitle="Inspect a variation with onLineClick"
          />
          <StyledEngineLines
            maxLines={3}
            onLineClick={(rank, pv) =>
              setSelected(
                `PV ${rank}: ${pv.moves
                  .slice(0, 4)
                  .map((move) => move.san)
                  .join(" ")}`,
              )
            }
          />
          <div style={{ ...styles.mono, ...styles.selectedLine }}>
            selected: <span style={{ color: "#2d2d2d" }}>{selected}</span>
          </div>
        </div>
      </AnalysisRoot>
    );
  },
};
