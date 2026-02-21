import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";
import {
  StoryHeader,
  BoardWrapper,
  STOCKFISH_WORKER_PATH,
  FEN_POSITIONS,
} from "@story-helpers";
import { EngineStatus } from "@story-helpers/stockfish";

const meta = {
  title: "Use Cases/Build Analysis Tools",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

export const PositionAnalysis: StoryObj = {
  render: () => {
    const [fen, setFen] = React.useState(FEN_POSITIONS.italian);

    return (
      <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
        <StoryHeader
          title="Position Analysis"
          subtitle="Analyze any position with Stockfish"
        />
        <div className="flex gap-2 flex-wrap mb-2">
          {Object.entries(FEN_POSITIONS).map(([name, position]) => (
            <button
              key={name}
              aria-label={`Load ${name} position`}
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
            workerOptions={{ workerPath: STOCKFISH_WORKER_PATH }}
            config={{ multiPV: 3 }}
          >
            <ChessGame.Root
              fen={fen}
              onMove={(_move, game) => setFen(game.fen())}
            >
              <div className="flex gap-4 items-start">
                <ChessStockfish.EvaluationBar
                  height={300}
                  width={24}
                  showLabel
                />
                <ChessGame.Board />
                <ChessStockfish.EngineLines maxLines={3} />
              </div>
            </ChessGame.Root>
            <EngineStatus />
          </ChessStockfish.Root>
        </BoardWrapper>
      </div>
    );
  },
};

export const EngineEvaluation: StoryObj = {
  render: () => {
    const [fen, setFen] = React.useState(FEN_POSITIONS.sicilian);
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
              aria-label={`Show ${n} engine line${n > 1 ? "s" : ""}`}
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
            workerOptions={{ workerPath: STOCKFISH_WORKER_PATH }}
            config={{ multiPV }}
          >
            <ChessGame.Root
              fen={fen}
              onMove={(_move, game) => setFen(game.fen())}
            >
              <div className="flex gap-4 items-start">
                <ChessGame.Board />
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
    const [fen, setFen] = React.useState(FEN_POSITIONS.starting);

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
            workerOptions={{ workerPath: STOCKFISH_WORKER_PATH }}
            config={{ multiPV: 2 }}
          >
            <ChessGame.Root
              fen={fen}
              onMove={(_move, game) => setFen(game.fen())}
            >
              <div className="flex flex-col gap-2">
                <ChessGame.Board />
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
                <ChessStockfish.EvaluationBar
                  height={200}
                  width={24}
                  showLabel
                />
                <ChessStockfish.EngineLines maxLines={2} />
              </div>
            </ChessGame.Root>
          </ChessStockfish.Root>
        </BoardWrapper>
        <p className="text-size-xs text-text-muted text-center">
          Keyboard: Arrow keys for history, Home/End for start/end, F to flip
        </p>
      </div>
    );
  },
};
