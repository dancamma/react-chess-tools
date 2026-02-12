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
  selectedLine: {
    background: "#fff",
    border: "1px solid #e2e0db",
    borderRadius: "6px",
    padding: "8px 10px",
    width: "100%",
  },
} satisfies Record<string, React.CSSProperties>;

const FEN = {
  start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  italian:
    "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  whiteWinning: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 0 1",
  blackWinning:
    "rnbqkbnr/1ppp1ppp/p5Q1/4p3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 1",
  mateIn3: "r1b1kb1r/pppp1ppp/5q2/4n3/3KP3/2N3PN/PPP4P/R1BQ1B1R b kq - 0 1",
};

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
  title: "React-Chess-Stockfish/Components/EngineLines",
  component: EngineLines,
  tags: ["components", "engine", "lines"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof EngineLines>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.italian} config={{ multiPV: 3 }}>
      <div style={styles.container}>
        <StoryHeader
          title="Engine lines"
          subtitle="Default composed rows with evaluation and move list"
          fen={FEN.italian}
        />
        <StyledEngineLines maxLines={3} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const BlackToMove: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.blackWinning} config={{ multiPV: 2 }}>
      <div style={styles.container}>
        <StoryHeader
          title="Black to move"
          subtitle="First SAN token starts with the 1... prefix"
          fen={FEN.blackWinning}
        />
        <StyledEngineLines maxLines={2} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const WhiteWinning: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.whiteWinning} config={{ multiPV: 2 }}>
      <div style={styles.container}>
        <StoryHeader
          title="White winning"
          subtitle="Position with large white advantage"
          fen={FEN.whiteWinning}
        />
        <StyledEngineLines maxLines={2} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const MateInThree: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.mateIn3} config={{ multiPV: 2 }}>
      <div style={styles.container}>
        <StoryHeader
          title="Mate in three"
          subtitle="Forced checkmate position"
          fen={FEN.mateIn3}
        />
        <StyledEngineLines maxLines={2} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const Clickable: Story = {
  render: () => {
    const [selected, setSelected] = React.useState("Click a line");

    return (
      <AnalysisRoot fen={FEN.italian} config={{ multiPV: 3 }}>
        <div style={styles.container}>
          <StoryHeader
            title="Clickable lines"
            subtitle="Inspect a variation with onLineClick"
            fen={FEN.italian}
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

export const AsChild: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.italian} config={{ multiPV: 2 }}>
      <div style={styles.container}>
        <StoryHeader
          title="asChild pattern"
          subtitle="Render lines into a custom list element"
          fen={FEN.italian}
        />
        <ChessStockfish.EngineLines asChild maxLines={2}>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              border: "1px solid #e2e0db",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <style>{ENGINE_LINES_CSS}</style>
          </ul>
        </ChessStockfish.EngineLines>
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const MaxLinesOverflow: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.start} config={{ multiPV: 2 }}>
      <div style={styles.container}>
        <StoryHeader
          title="maxLines vs available PV"
          subtitle="maxLines=5 but only 2 PVs available (multiPV=2)"
          fen={FEN.start}
        />
        <StyledEngineLines maxLines={5} />
        <p style={styles.hint}>
          Engine returns 2 lines, maxLines=5 gracefully shows what&apos;s
          available.
        </p>
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const MultiPV: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.italian} config={{ multiPV: 4 }}>
      <div style={styles.container}>
        <StoryHeader
          title="MultiPV analysis"
          subtitle="Four principal variations"
          fen={FEN.italian}
        />
        <StyledEngineLines maxLines={4} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};
