import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import {
  ChessStockfish,
  useStockfish,
} from "@react-chess-tools/react-chess-stockfish";

const meta = {
  title: "Home",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

// Worker path for Stockfish
const WORKER_PATH = "/stockfish.js";

// Engine status component
function EngineStatus() {
  const { info, methods } = useStockfish();
  const bestMove = methods.getBestMove();

  return (
    <div className="font-mono text-size-xs text-text-secondary flex flex-col gap-1">
      <div className="flex gap-3">
        <span>depth: {info.depth}</span>
        <span>
          status:{" "}
          {info.isEngineThinking ? (
            <span className="text-success">analyzing</span>
          ) : (
            <span className="text-text-muted">ready</span>
          )}
        </span>
      </div>
      {bestMove && (
        <span>
          best: <span className="text-text font-semibold">{bestMove.san}</span>
        </span>
      )}
    </div>
  );
}

// Engine lines with styling
function EngineLines({ maxLines = 3 }: { maxLines?: number }) {
  const { info } = useStockfish();
  const lines = info.lines?.slice(0, maxLines) || [];

  return (
    <div className="flex flex-col min-w-[200px]">
      {lines.length === 0 ? (
        <div className="text-size-xs text-text-muted p-2">
          Waiting for analysis...
        </div>
      ) : (
        lines.map((line, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 border-b border-border last:border-b-0"
          >
            <span className="text-size-xs font-semibold text-accent min-w-[40px]">
              {line.evaluation?.type === "mate"
                ? `M${line.evaluation.value}`
                : line.evaluation?.value !== undefined
                  ? (line.evaluation.value / 100).toFixed(2)
                  : "0.00"}
            </span>
            <span className="text-size-xs text-text truncate">
              {line.pv?.join(" ") || ""}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// Evaluation bar
function EvaluationBar() {
  const { info } = useStockfish();
  const evalValue = info.evaluation?.value || 0;
  const evalType = info.evaluation?.type || "cp";

  // Convert mate scores to extreme values
  let normalizedEval = evalValue;
  if (evalType === "mate") {
    normalizedEval = evalValue > 0 ? 1000 : -1000;
  }

  // Clamp and convert to percentage (range: -10 to +10 pawns)
  const clampedEval = Math.max(-1000, Math.min(1000, normalizedEval));
  const percentage = ((clampedEval + 1000) / 2000) * 100;

  const displayValue =
    evalType === "mate"
      ? `M${Math.abs(evalValue)}`
      : (evalValue / 100).toFixed(1);

  return (
    <div className="relative w-[30px] h-[360px] bg-dark-bg border border-dark-border rounded overflow-hidden">
      <div
        className="absolute bottom-0 left-0 right-0 bg-white transition-all duration-500"
        style={{ height: `${percentage}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-size-xs font-bold text-dark-bg writing-mode-vertical rotate-180">
          {displayValue > 0 ? `+${displayValue}` : displayValue}
        </span>
      </div>
    </div>
  );
}

// CTA Button component
function CTAButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-accent text-white text-size-sm font-medium rounded hover:opacity-90 transition-opacity"
    >
      {children}
    </button>
  );
}

export const Landing: StoryObj = {
  render: () => {
    const [fen, setFen] = React.useState(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    );

    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-size-2xl font-bold text-text mb-2">
            react-chess-tools
          </h1>
          <p className="text-size-md text-text-secondary">
            Build beautiful chess experiences with React
          </p>
        </div>

        {/* Main Layout */}
        <ChessStockfish.Root
          fen={fen}
          onFenChange={setFen}
          workerOptions={{ workerPath: WORKER_PATH }}
          config={{ multiPV: 3 }}
        >
          <ChessGame.Root
            fen={fen}
            onMove={(move, game) => setFen(game.fen())}
            timeControl={{ time: "5+3", clockStart: "firstMove" }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              {/* Left: Evaluation Bar */}
              <div className="hidden lg:block">
                <EvaluationBar />
              </div>

              {/* Center: Board and Clocks */}
              <div className="flex flex-col gap-4">
                {/* Top Clock */}
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-dark-bg text-white text-size-lg font-mono rounded">
                    <ChessGame.Clock.Display color="black" />
                  </div>
                </div>

                {/* Board */}
                <ChessGame.Board boardWidth={400} />
                <ChessGame.Sounds />
                <ChessGame.KeyboardControls />

                {/* Bottom Clock */}
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-dark-bg text-white text-size-lg font-mono rounded">
                    <ChessGame.Clock.Display color="white" />
                  </div>
                </div>
              </div>

              {/* Right: Engine Lines */}
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-surface-alt rounded border border-border">
                  <h3 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Engine Analysis
                  </h3>
                  <EngineLines maxLines={3} />
                  <div className="mt-2">
                    <EngineStatus />
                  </div>
                </div>
              </div>
            </div>
          </ChessGame.Root>
        </ChessStockfish.Root>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <CTAButton
            onClick={() =>
              (window.location.href =
                "?path=/docs/getting-started-quick-start--docs")
            }
          >
            Quick Start
          </CTAButton>
          <CTAButton
            onClick={() =>
              (window.location.href =
                "?path=/story/packages-react-chess-game-chess-game--docs")
            }
          >
            Explore Packages
          </CTAButton>
          <CTAButton
            onClick={() =>
              (window.location.href = "?path=/docs/theming-overview--docs")
            }
          >
            View Themes
          </CTAButton>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-center">
          <p className="text-size-xs text-text-muted">
            Keyboard: Arrow keys for history, Home/End for start/end, F to flip
          </p>
        </div>
      </div>
    );
  },
};
