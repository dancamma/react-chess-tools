import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import {
  ChessStockfish,
  useStockfish,
} from "@react-chess-tools/react-chess-stockfish";
import { StoryHeader, BoardWrapper } from "@story-helpers";

const meta = {
  title: "Use Cases/Build Analysis Tools",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

// FEN positions for analysis
const POSITIONS = {
  starting: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  italian: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
  sicilian: "rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
  endgame: "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
};

// Analysis status component
function AnalysisStatus() {
  const { info, methods } = useStockfish();
  const bestMove = methods.getBestMove();

  return (
    <div className="p-3 bg-surface-alt rounded border border-border text-size-xs">
      <div className="flex gap-4 mb-2">
        <span className="text-text-secondary">Depth: {info.depth}</span>
        <span className="text-text-secondary">
          Status:{" "}
          {info.isEngineThinking ? (
            <span className="text-success">Analyzing</span>
          ) : (
            <span className="text-text-muted">Ready</span>
          )}
        </span>
      </div>
      {bestMove && (
        <div className="text-text">
          Best move:{" "}
          <span className="font-bold text-accent">{bestMove.san}</span>
        </div>
      )}
    </div>
  );
}

// Evaluation bar component
function EvalBar() {
  const { info } = useStockfish();
  const evalValue = info.evaluation?.value || 0;
  const evalType = info.evaluation?.type || "cp";

  let normalizedEval = evalValue;
  if (evalType === "mate") {
    normalizedEval = evalValue > 0 ? 1000 : -1000;
  }

  const clampedEval = Math.max(-1000, Math.min(1000, normalizedEval));
  const percentage = ((clampedEval + 1000) / 2000) * 100;

  const displayValue =
    evalType === "mate"
      ? `M${Math.abs(evalValue)}`
      : (evalValue / 100).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[24px] h-[300px] bg-dark-bg border border-dark-border rounded overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 bg-white transition-all duration-500"
          style={{ height: `${percentage}%` }}
        />
      </div>
      <span className="text-size-xs font-mono text-text">
        {evalValue >= 0 ? "+" : ""}
        {displayValue}
      </span>
    </div>
  );
}

export const PositionAnalysis: StoryObj = {
  render: () => {
    const [fen, setFen] = React.useState(POSITIONS.italian);

    return (
      <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
        <StoryHeader
          title="Position Analysis"
          subtitle="Analyze any position with Stockfish"
        />
        <div className="flex gap-2 flex-wrap mb-2">
          {Object.entries(POSITIONS).map(([name, position]) => (
            <button
              key={name}
              onClick={() => setFen(position)}
              className={`px-2 py-1 text-size-xs rounded ${
                fen === position
                  ? "bg-accent text-white"
                  : "bg-surface-alt text-text-secondary hover:bg-surface"
              }`}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
        <BoardWrapper>
          <ChessStockfish.Root
            fen={fen}
            onFenChange={setFen}
            workerOptions={{ workerPath: "/stockfish.js" }}
            config={{ multiPV: 3 }}
          >
            <ChessGame.Root
              fen={fen}
              onMove={(move, game) => setFen(game.fen())}
            >
              <div className="flex gap-4 items-start">
                <EvalBar />
                <ChessGame.Board boardWidth={320} />
                <ChessStockfish.EngineLines maxLines={3} />
              </div>
            </ChessGame.Root>
          </ChessStockfish.Root>
        </BoardWrapper>
        <AnalysisStatus />
      </div>
    );
  },
};

export const EngineEvaluation: StoryObj = {
  render: () => {
    const [fen, setFen] = React.useState(POSITIONS.sicilian);
    const [multiPV, setMultiPV] = React.useState(3);

    return (
      <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
        <StoryHeader
          title="Engine Evaluation"
          subtitle="Compare multiple lines"
        />
        <div className="flex gap-2 items-center mb-2">
          <span className="text-size-xs text-text-secondary">Lines:</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setMultiPV(n)}
              className={`px-2 py-1 text-size-xs rounded ${
                multiPV === n
                  ? "bg-accent text-white"
                  : "bg-surface-alt text-text-secondary hover:bg-surface"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <BoardWrapper>
          <ChessStockfish.Root
            fen={fen}
            onFenChange={setFen}
            workerOptions={{ workerPath: "/stockfish.js" }}
            config={{ multiPV }}
          >
            <ChessGame.Root
              fen={fen}
              onMove={(move, game) => setFen(game.fen())}
            >
              <div className="flex gap-4 items-start">
                <ChessGame.Board boardWidth={300} />
                <div className="flex flex-col gap-2">
                  <h4 className="text-size-xs font-semibold text-text-muted uppercase">
                    Top {multiPV} Lines
                  </h4>
                  <ChessStockfish.EngineLines maxLines={multiPV} />
                </div>
              </div>
            </ChessGame.Root>
          </ChessStockfish.Root>
        </BoardWrapper>
      </div>
    );
  },
};

export const GameReview: StoryObj = {
  render: () => {
    const [fen, setFen] = React.useState(POSITIONS.starting);

    return (
      <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
        <StoryHeader
          title="Game Review"
          subtitle="Navigate through moves with engine analysis"
        />
        <BoardWrapper>
          <ChessStockfish.Root
            fen={fen}
            onFenChange={setFen}
            workerOptions={{ workerPath: "/stockfish.js" }}
            config={{ multiPV: 2 }}
          >
            <ChessGame.Root
              fen={fen}
              onMove={(move, game) => setFen(game.fen())}
            >
              <div className="flex flex-col gap-2">
                <ChessGame.Board boardWidth={360} />
                <div className="flex gap-2 justify-center">
                  <ChessGame.Reset />
                </div>
              </div>
              <ChessGame.Sounds />
              <ChessGame.KeyboardControls />
              <div className="flex flex-col gap-2 min-w-[200px]">
                <h4 className="text-size-xs font-semibold text-text-muted uppercase">
                  Analysis
                </h4>
                <EvalBar />
                <ChessStockfish.EngineLines maxLines={2} />
              </div>
            </ChessGame.Root>
          </ChessStockfish.Root>
        </BoardWrapper>
        <p className="text-size-xs text-text-muted text-center">
          Use arrow keys to navigate. Engine evaluates each position.
        </p>
      </div>
    );
  },
};
