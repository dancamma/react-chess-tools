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
import { StyledEngineLines } from "@story-helpers/stockfish";

const meta = {
  title: "Use Cases/Build a Chess Game",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

export const BasicGame: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
      <StoryHeader
        title="Basic Game"
        subtitle="Simple board with sound effects"
      />
      <BoardWrapper>
        <ChessGame.Root>
          <ChessGame.Board />
          <ChessGame.Sounds />
        </ChessGame.Root>
      </BoardWrapper>
      <p className="text-size-xs text-text-muted">
        Drag pieces or click to move. Sounds play automatically.
      </p>
    </div>
  ),
};

export const GameWithClock: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
      <StoryHeader
        title="Game with Clock"
        subtitle="5+3 Blitz game with Fischer increment"
      />
      <ChessGame.Root timeControl={{ time: "5+3", clockStart: "firstMove" }}>
        <div className="flex flex-col gap-2">
          <div className="px-3 py-1 bg-dark-bg text-white text-size-sm font-mono rounded text-center">
            <ChessGame.Clock.Display color="black" />
          </div>
          <BoardWrapper>
            <ChessGame.Board />
          </BoardWrapper>
          <div className="px-3 py-1 bg-dark-bg text-white text-size-sm font-mono rounded text-center">
            <ChessGame.Clock.Display color="white" />
          </div>
        </div>
        <ChessGame.Sounds />
      </ChessGame.Root>
      <p className="text-size-xs text-text-muted">
        Clock starts on first move. Auto-switches after each move.
      </p>
    </div>
  ),
};

export const GameWithAnalysis: StoryObj = {
  render: () => {
    const [fen, setFen] = React.useState(FEN_POSITIONS.italian);

    return (
      <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
        <StoryHeader
          title="Game with Analysis"
          subtitle="Board + Stockfish engine evaluation"
        />
        <BoardWrapper>
          <ChessStockfish.Root
            fen={fen}
            workerOptions={{ workerPath: STOCKFISH_WORKER_PATH }}
          >
            <ChessGame.Root
              fen={fen}
              onMove={(_move, game) => setFen(game.fen())}
            >
              <div className="flex gap-4 items-start">
                <ChessGame.Board />
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <StyledEngineLines maxLines={3} />
                </div>
              </div>
              <ChessGame.Sounds />
            </ChessGame.Root>
          </ChessStockfish.Root>
        </BoardWrapper>
        <p className="text-size-xs text-text-muted">
          Engine analyzes the position and shows top moves.
        </p>
      </div>
    );
  },
};

export const FullFeaturedGame: StoryObj = {
  render: () => {
    const [fen, setFen] = React.useState(FEN_POSITIONS.starting);

    return (
      <div className="flex flex-col gap-4 p-6 max-w-3xl mx-auto">
        <StoryHeader
          title="Full Featured Game"
          subtitle="Board, clock, sounds, keyboard controls, and analysis"
        />
        <ChessStockfish.Root
          fen={fen}
          workerOptions={{ workerPath: STOCKFISH_WORKER_PATH }}
          config={{ multiPV: 2 }}
        >
          <ChessGame.Root
            fen={fen}
            onMove={(_move, game) => setFen(game.fen())}
            timeControl={{ time: "5+3", clockStart: "firstMove" }}
          >
            <div className="flex gap-4 items-start">
              {/* Left: Board and Clocks */}
              <div className="flex flex-col gap-2">
                <div className="px-3 py-1 bg-dark-bg text-white text-size-sm font-mono rounded text-center">
                  <ChessGame.Clock.Display color="black" />
                </div>
                <ChessGame.Board />
                <div className="px-3 py-1 bg-dark-bg text-white text-size-sm font-mono rounded text-center">
                  <ChessGame.Clock.Display color="white" />
                </div>
              </div>

              {/* Right: Analysis */}
              <div className="flex flex-col gap-2 min-w-[180px]">
                <StyledEngineLines maxLines={2} />
              </div>
            </div>

            <ChessGame.Sounds />
            <ChessGame.KeyboardControls />
          </ChessGame.Root>
        </ChessStockfish.Root>

        <div className="text-size-xs text-text-muted text-center">
          Keyboard: Arrow keys for history, Home/End for start/end, F to flip
        </div>
      </div>
    );
  },
};
