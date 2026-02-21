import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { StoryHeader, BoardWrapper } from "@story-helpers";

const meta = {
  title: "Use Cases/Create Puzzles",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

// Sample puzzles
const puzzles = {
  mateInOne: {
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    solution: ["Qxf7#"],
    hint: "Look for a checkmate on f7",
  },
  mateInTwo: {
    fen: "r1b1k2r/ppppqppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1",
    solution: ["Bxf7+", "Ke7", "Bg5#"],
    hint: "First, put pressure on f7",
  },
  tactic: {
    fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    solution: ["Ng5", "O-O", "Nxf7"],
    hint: "Attack the weak f7 square",
  },
};

export const SimplePuzzle: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
      <StoryHeader
        title="Simple Puzzle"
        subtitle="Mate in one - find the winning move"
      />
      <BoardWrapper>
        <ChessPuzzle.Root puzzle={puzzles.mateInOne}>
          <ChessPuzzle.Board />
        </ChessPuzzle.Root>
      </BoardWrapper>
      <p className="text-size-xs text-text-muted">
        White to move. Find the checkmate!
      </p>
    </div>
  ),
};

export const PuzzleWithHints: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
      <StoryHeader
        title="Puzzle with Hints"
        subtitle="Get help when you're stuck"
      />
      <BoardWrapper>
        <ChessPuzzle.Root puzzle={puzzles.mateInTwo}>
          <div className="flex flex-col gap-2">
            <ChessPuzzle.Board />
            <div className="flex gap-2">
              <ChessPuzzle.Hint />
              <ChessPuzzle.Reset />
            </div>
          </div>
        </ChessPuzzle.Root>
      </BoardWrapper>
      <p className="text-size-xs text-text-muted">
        Click "Show Hint" if you need help. White to move.
      </p>
    </div>
  ),
};

export const PuzzleWithSounds: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
      <StoryHeader
        title="Puzzle with Sounds"
        subtitle="Audio feedback for moves"
      />
      <BoardWrapper>
        <ChessPuzzle.Root puzzle={puzzles.tactic}>
          <ChessGame.Sounds />
          <ChessPuzzle.Board />
          <div className="flex gap-2 mt-2">
            <ChessPuzzle.Hint />
            <ChessPuzzle.Reset />
          </div>
        </ChessPuzzle.Root>
      </BoardWrapper>
      <p className="text-size-xs text-text-muted">
        Sounds enhance the experience. Try it!
      </p>
    </div>
  ),
};

export const PuzzlePlatform: StoryObj = {
  render: () => {
    const [currentPuzzle, setCurrentPuzzle] = React.useState(0);
    const puzzleList = [puzzles.mateInOne, puzzles.mateInTwo, puzzles.tactic];

    return (
      <div className="flex flex-col gap-4 p-6 max-w-story-xl mx-auto">
        <StoryHeader
          title="Puzzle Platform"
          subtitle="Multiple puzzles with progress tracking"
        />
        <div className="flex gap-2 mb-2">
          {puzzleList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPuzzle(index)}
              className={`px-3 py-1 text-size-sm rounded ${
                currentPuzzle === index
                  ? "bg-accent text-white"
                  : "bg-surface-alt text-text-secondary hover:bg-surface"
              }`}
            >
              Puzzle {index + 1}
            </button>
          ))}
        </div>
        <BoardWrapper>
          <ChessPuzzle.Root
            puzzle={puzzleList[currentPuzzle]}
            key={currentPuzzle}
          >
            <ChessGame.Sounds />
            <ChessPuzzle.Board />
            <div className="flex gap-2 mt-2">
              <ChessPuzzle.Hint />
              <ChessPuzzle.Reset />
              <button
                aria-label="Go to next puzzle"
                onClick={() =>
                  setCurrentPuzzle((p) =>
                    Math.min(p + 1, puzzleList.length - 1),
                  )
                }
                className="px-3 py-1 text-size-sm bg-surface-alt text-text-secondary rounded hover:bg-surface"
              >
                Next Puzzle
              </button>
            </div>
          </ChessPuzzle.Root>
        </BoardWrapper>
        <p className="text-size-xs text-text-muted">
          Solve puzzles and track your progress!
        </p>
      </div>
    );
  },
};
