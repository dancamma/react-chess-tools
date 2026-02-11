import type { Meta } from "@storybook/react-vite";
import React from "react";
import { ChessStockfish } from "./index";
import { useStockfish } from "../../hooks/useStockfish";

const WORKER_PATH = "/stockfish.js";

// ============================================================================
// Styles (simplified)
// ============================================================================
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    fontFamily: "'Inter', -apple-system, sans-serif",
    maxWidth: "420px",
    margin: "0 auto",
  },
  header: { textAlign: "center" },
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
    textAlign: "center",
    margin: 0,
    lineHeight: 1.5,
  },
  monoText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "#7a7a72",
  },
} satisfies Record<string, React.CSSProperties>;

// Evaluation bar base styles (shared between vertical/horizontal)
const barBase: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "4px",
  background: "#403d39",
  border: "1px solid #5b5752",
};

const barStyles = {
  vertical: { ...barBase, width: "30px", height: "300px" },
  horizontal: { ...barBase, width: "300px", height: "30px" },
} satisfies Record<"vertical" | "horizontal", React.CSSProperties>;

// FEN positions
const FEN = {
  start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  italian:
    "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  whiteWinning: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 0 1",
  blackWinning:
    "rnbqkbnr/1ppp1ppp/p5Q1/4p3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 1",
};

// ============================================================================
// Evaluation Bar CSS (Chess.com style)
// ============================================================================
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
    transition: transform 1s ease-in;
  }

  [data-stockfish-eval-text] {
    display: var(--evaluation-bar-score-display, block);
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1;
    padding: 0.35rem 0;
    position: absolute;
    text-align: center;
    white-space: nowrap;
    width: 100%;
    z-index: 2;
    transition: all 0.2s ease;
  }

  /* Hover state */
  [data-stockfish-orientation]:hover [data-stockfish-eval-text] {
    border-radius: 6px;
    bottom: auto !important;
    font-weight: 700;
    left: 50% !important;
    padding: 0.1rem 0.5rem;
    right: auto !important;
    top: 50% !important;
    transform: translate(-50%, -50%);
    width: auto;
  }

  [data-stockfish-eval-value^="-"]:hover [data-stockfish-eval-text] {
    background: var(--eval-dark);
    color: var(--eval-light);
  }

  [data-stockfish-eval-value]:not([data-stockfish-eval-value^="-"]):hover [data-stockfish-eval-text] {
    background: var(--eval-light);
    color: var(--eval-dark);
  }

  /* Vertical - White perspective */
  [data-stockfish-orientation="vertical"][data-stockfish-perspective="white"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    top: 0;
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="white"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    bottom: 0;
    color: var(--eval-dark);
  }

  /* Vertical - Black perspective */
  [data-stockfish-orientation="vertical"][data-stockfish-perspective="black"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    bottom: 0;
    color: var(--eval-light);
  }

  [data-stockfish-orientation="vertical"][data-stockfish-perspective="black"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    color: var(--eval-dark);
    top: 0;
  }

  /* Horizontal */
  [data-stockfish-orientation="horizontal"] [data-stockfish-eval-text] {
    padding: 0 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: auto;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="white"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    right: 0;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="white"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    color: var(--eval-dark);
    left: 0;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="black"][data-stockfish-eval-value^="-"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    left: 0;
  }

  [data-stockfish-orientation="horizontal"][data-stockfish-perspective="black"]:not([data-stockfish-eval-value^="-"]) [data-stockfish-eval-text] {
    color: var(--eval-dark);
    right: 0;
  }

  /* No evaluation type */
  [data-stockfish-eval-type="none"] [data-stockfish-eval-text] {
    color: var(--eval-light);
    top: 50%;
    transform: translateY(-50%);
  }
`;

// Styled bar wrappers
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

// ============================================================================
// Helper Components
// ============================================================================
const EngineStatus = () => {
  const { info, methods } = useStockfish();
  const bestMove = methods.getBestMove();

  return (
    <div
      style={{
        ...styles.monoText,
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
};

// ============================================================================
// Meta
// ============================================================================
const meta = {
  title: "react-chess-stockfish/Components/ChessStockfish",
  component: ChessStockfish.Root,
  tags: ["components", "stockfish", "analysis"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ChessStockfish.Root>;

export default meta;

// ============================================================================
// Stories
// ============================================================================

export const Default = () => (
  <ChessStockfish.Root
    fen={FEN.start}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Evaluation Bar</h3>
        <p style={styles.subtitle}>Vertical bar with evaluation text</p>
      </div>
      <VerticalBar showEvaluation style={barStyles.vertical} />
      <EngineStatus />
      <p style={styles.hint}>White fills from bottom · Equal position ≈ 50%</p>
    </div>
  </ChessStockfish.Root>
);

export const HorizontalBarStory = () => (
  <ChessStockfish.Root
    fen={FEN.start}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Horizontal Bar</h3>
        <p style={styles.subtitle}>Same data, horizontal layout</p>
      </div>
      <HorizontalBar showEvaluation style={barStyles.horizontal} />
      <EngineStatus />
      <p style={styles.hint}>White fills from left</p>
    </div>
  </ChessStockfish.Root>
);

export const WhiteWinning = () => (
  <ChessStockfish.Root
    fen={FEN.whiteWinning}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>White Winning</h3>
        <p style={styles.subtitle}>
          Scholar&apos;s mate threat — significant advantage
        </p>
      </div>
      <VerticalBar showEvaluation style={barStyles.vertical} />
      <EngineStatus />
    </div>
  </ChessStockfish.Root>
);

export const BlackWinning = () => (
  <ChessStockfish.Root
    fen={FEN.blackWinning}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Black Winning</h3>
        <p style={styles.subtitle}>
          Two Minor Pieces — Black has a material advantage
        </p>
      </div>
      <VerticalBar showEvaluation style={barStyles.vertical} />
      <EngineStatus />
    </div>
  </ChessStockfish.Root>
);

export const MultiPV = () => (
  <ChessStockfish.Root
    fen={FEN.italian}
    config={{ multiPV: 3 }}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Multi-PV Analysis</h3>
        <p style={styles.subtitle}>Engine calculates 3 principal variations</p>
      </div>
      <VerticalBar showEvaluation style={barStyles.vertical} />
      <EngineStatus />
      <p style={styles.hint}>
        Italian Game — evaluation based on best line (PV 1)
      </p>
    </div>
  </ChessStockfish.Root>
);

export const CustomConfig = () => (
  <ChessStockfish.Root
    fen={FEN.start}
    config={{ skillLevel: 10, depth: 15 }}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Custom Engine Config</h3>
        <p style={styles.subtitle}>Skill Level 10, Depth 15</p>
      </div>
      <VerticalBar showEvaluation style={barStyles.vertical} />
      <EngineStatus />
      <p style={styles.hint}>
        Lower skill and depth for faster, weaker analysis
      </p>
    </div>
  </ChessStockfish.Root>
);

export const BarWithoutText = () => (
  <ChessStockfish.Root
    fen={FEN.start}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Minimal Bar</h3>
        <p style={styles.subtitle}>No evaluation text — just the fill</p>
      </div>
      <VerticalBar showEvaluation={false} style={barStyles.vertical} />
      <EngineStatus />
    </div>
  </ChessStockfish.Root>
);

export const MultipleBars = () => (
  <ChessStockfish.Root
    fen={FEN.italian}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Multiple Bars</h3>
        <p style={styles.subtitle}>
          Both orientations side by side — same context
        </p>
      </div>
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <VerticalBar
          showEvaluation
          style={{ ...barStyles.vertical, height: "200px" }}
        />
        <HorizontalBar
          showEvaluation
          style={{ ...barStyles.horizontal, width: "200px" }}
        />
      </div>
      <EngineStatus />
    </div>
  </ChessStockfish.Root>
);

export const AsChild = () => (
  <ChessStockfish.Root
    fen={FEN.start}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>asChild Pattern</h3>
        <p style={styles.subtitle}>
          Renders as a custom &lt;section&gt; via Radix Slot
        </p>
      </div>
      <ChessStockfish.EvaluationBar asChild showEvaluation>
        <section style={{ ...barStyles.vertical, border: "1px solid #e2e0db" }}>
          <style>{EVAL_BAR_CSS}</style>
        </section>
      </ChessStockfish.EvaluationBar>
      <EngineStatus />
      <p style={styles.hint}>
        Inspect the DOM — root element is &lt;section&gt; not &lt;div&gt;
      </p>
    </div>
  </ChessStockfish.Root>
);

export const Callbacks = () => {
  const [lastEval, setLastEval] = React.useState("Waiting...");
  const [depthHistory, setDepthHistory] = React.useState<number[]>([]);
  const [lastError, setLastError] = React.useState("");

  return (
    <ChessStockfish.Root
      fen={FEN.italian}
      config={{ multiPV: 3 }}
      workerOptions={{ workerPath: WORKER_PATH }}
      onEvaluationChange={(eval_) => {
        if (!eval_) return setLastEval("No evaluation");
        setLastEval(
          eval_.type === "cp"
            ? `${eval_.value > 0 ? "+" : ""}${(eval_.value / 100).toFixed(2)} pawns`
            : `Mate in ${eval_.value}`,
        );
      }}
      onDepthChange={(d) => setDepthHistory((prev) => [...prev.slice(-9), d])}
      onError={(e) => setLastError(e.message)}
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Callbacks</h3>
          <p style={styles.subtitle}>
            React to evaluation, depth, and error changes
          </p>
        </div>
        <VerticalBar showEvaluation style={barStyles.vertical} />
        <div
          style={{
            ...styles.monoText,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          <InfoBox label="Last eval" value={lastEval} />
          <InfoBox
            label="Depth history"
            value={
              depthHistory.length ? depthHistory.join(" → ") : "Waiting..."
            }
          />
          {lastError && <InfoBox label="Error" value={lastError} error />}
        </div>
        <EngineStatus />
        <p style={styles.hint}>
          Callbacks fire on every change · No useEffect needed
        </p>
      </div>
    </ChessStockfish.Root>
  );
};

// Small helper for the Callbacks story
const InfoBox = ({
  label,
  value,
  error,
}: {
  label: string;
  value: string;
  error?: boolean;
}) => (
  <div
    style={{
      padding: "8px 12px",
      background: error ? "#fee2e2" : "#fff",
      borderRadius: "4px",
      border: `1px solid ${error ? "#fca5a5" : "#e2e0db"}`,
      color: error ? "#991b1b" : undefined,
    }}
  >
    <span style={{ color: "#a5a59c" }}>{label}: </span>
    <span
      style={{
        color: error ? undefined : "#2d2d2d",
        fontWeight: error ? 600 : undefined,
      }}
    >
      {value}
    </span>
  </div>
);

export const Perspective = () => (
  <ChessStockfish.Root
    fen={FEN.italian}
    workerOptions={{ workerPath: WORKER_PATH }}
  >
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Perspective Flip</h3>
        <p style={styles.subtitle}>Same position, two perspectives</p>
      </div>
      <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
        {["white", "black"].map((p) => (
          <div
            key={p}
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textAlign: "center",
                color: "#7a7a72",
              }}
            >
              {p} perspective
            </span>
            <ChessStockfish.EvaluationBar
              perspective={p as "white" | "black"}
              showEvaluation
              style={barStyles.vertical}
            >
              <style>{EVAL_BAR_CSS}</style>
            </ChessStockfish.EvaluationBar>
          </div>
        ))}
      </div>
      <EngineStatus />
      <p style={styles.hint}>
        Perspective flips fill direction only · Use black perspective when the
        board is flipped
      </p>
    </div>
  </ChessStockfish.Root>
);
