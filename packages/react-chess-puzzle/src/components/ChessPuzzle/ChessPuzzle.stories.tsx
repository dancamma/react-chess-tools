import type { Meta } from "@storybook/react-vite";

import React from "react";
import { RootProps } from "./parts/Root";
import { ChessPuzzle } from ".";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import {
  StoryHeader,
  StoryContainer,
  BoardWrapper,
  Kbd,
  Button,
} from "@story-helpers";

const puzzles = [
  {
    fen: "4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
    moves: ["Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"],
    makeFirstMove: false,
  },
  {
    fen: "6k1/5p1p/p1q1p1p1/1pB1P3/1Pr3Pn/P4P1P/4Q3/3R2K1 b - - 0 31",
    moves: ["h4f3", "e2f3", "c4c5", "d1d8", "g8g7", "f3f6"],
    makeFirstMove: true,
  },
];

const meta = {
  title: "Packages/react-chess-puzzle/ChessPuzzle",
  component: ChessPuzzle.Root,
  tags: ["components", "puzzle"],
  argTypes: {
    onSolve: { action: "onSolve" },
    onFail: { action: "onFail" },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ChessPuzzle.Root>;

export default meta;

export const Example = (args: RootProps) => {
  const [puzzleIndex, setPuzzleIndex] = React.useState(0);
  const puzzle = puzzles[puzzleIndex];
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzle}>
      <StoryContainer>
        <StoryHeader
          title="Chess Puzzle"
          subtitle="Find the best move sequence"
        />
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-size-xs font-semibold bg-surface-alt rounded-full text-text-secondary">
          Puzzle {puzzleIndex + 1} of {puzzles.length}
        </span>
        <BoardWrapper>
          <ChessPuzzle.Board />
        </BoardWrapper>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <ChessPuzzle.Reset asChild>
            <Button variant="outline">Restart</Button>
          </ChessPuzzle.Reset>
          <ChessPuzzle.Reset
            asChild
            puzzle={puzzles[(puzzleIndex + 1) % puzzles.length]}
            onReset={() => setPuzzleIndex((puzzleIndex + 1) % puzzles.length)}
          >
            <Button variant="default">Next Puzzle</Button>
          </ChessPuzzle.Reset>
          <ChessPuzzle.Hint asChild>
            <Button variant="outline">Hint</Button>
          </ChessPuzzle.Hint>
        </div>
      </StoryContainer>
    </ChessPuzzle.Root>
  );
};

export const WithOrientation = (args: RootProps) => {
  const puzzle = {
    fen: "4kbnr/2p1pp1p/pp4p1/5b2/8/2NB1N2/PP3PPP/RKB4R b k - 0 1",
    makeFirstMove: false,
    moves: ["Bxd3"],
  };
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzle}>
      <StoryContainer>
        <StoryHeader
          title="Black to Move"
          subtitle="Board oriented from Black's perspective"
        />
        <BoardWrapper>
          <ChessPuzzle.Board options={{ boardOrientation: "black" }} />
        </BoardWrapper>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <ChessPuzzle.Reset asChild>
            <Button variant="outline">Restart</Button>
          </ChessPuzzle.Reset>
          <ChessPuzzle.Hint asChild>
            <Button variant="outline">Hint</Button>
          </ChessPuzzle.Hint>
        </div>
      </StoryContainer>
    </ChessPuzzle.Root>
  );
};

export const Underpromotion = (args: RootProps) => {
  const puzzle = {
    fen: "8/8/5R1p/8/3pb1P1/kpKp4/8/8 w - - 0 54",
    moves: ["c3d4", "d3d2", "d4c3", "d2d1n"],
    makeFirstMove: true,
  };
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzle}>
      <StoryContainer>
        <StoryHeader
          title="Underpromotion Challenge"
          subtitle="Promote to a knight instead of a queen"
        />
        <BoardWrapper>
          <ChessPuzzle.Board />
        </BoardWrapper>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <ChessPuzzle.Reset asChild>
            <Button variant="default">Solved! Restart</Button>
          </ChessPuzzle.Reset>
        </div>
        <div className="px-4 py-3 bg-info border border-info-border rounded-md text-size-sm text-info-text text-center">
          Sometimes promoting to a knight is better than a queen!
        </div>
      </StoryContainer>
    </ChessPuzzle.Root>
  );
};

export const WithSounds = (args: RootProps) => {
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzles[0]}>
      <ChessGame.Sounds />
      <StoryContainer>
        <StoryHeader
          title="Puzzle with Sound"
          subtitle="Audio feedback on every move"
        />
        <BoardWrapper>
          <ChessPuzzle.Board />
        </BoardWrapper>
        <p className="text-size-xs text-text-muted text-center m-0">
          Move pieces to hear different sounds
        </p>
      </StoryContainer>
    </ChessPuzzle.Root>
  );
};

export const WithKeyboardControls = (args: RootProps) => {
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzles[0]}>
      <ChessGame.KeyboardControls
        controls={{
          f: (context) => context.methods.flipBoard(),
          w: (context) => context.methods.goToStart(),
          s: (context) => context.methods.goToEnd(),
          a: (context) => context.methods.goToPreviousMove(),
          d: (context) => context.methods.goToNextMove(),
        }}
      />
      <StoryContainer>
        <StoryHeader
          title="Keyboard Navigation"
          subtitle="Use keyboard shortcuts to navigate"
        />
        <BoardWrapper>
          <ChessPuzzle.Board />
        </BoardWrapper>
        <div className="grid grid-cols-3 gap-2 justify-center mt-3">
          <div className="flex items-center gap-1.5 text-size-xs text-text">
            <Kbd>W</Kbd> Start
          </div>
          <div className="flex items-center gap-1.5 text-size-xs text-text">
            <Kbd>A</Kbd> Previous
          </div>
          <div className="flex items-center gap-1.5 text-size-xs text-text">
            <Kbd>F</Kbd> Flip
          </div>
          <div className="flex items-center gap-1.5 text-size-xs text-text">
            <Kbd>S</Kbd> End
          </div>
          <div className="flex items-center gap-1.5 text-size-xs text-text">
            <Kbd>D</Kbd> Next
          </div>
        </div>
      </StoryContainer>
    </ChessPuzzle.Root>
  );
};

const multiMatePuzzle = {
  fen: "7k/R7/1R6/2Q5/4Q3/8/8/7K w - - 0 1",
  moves: ["a7a8"],
  makeFirstMove: false,
};

export const MultiMatePuzzle = (args: RootProps) => {
  return (
    <ChessPuzzle.Root {...args} puzzle={multiMatePuzzle}>
      <StoryContainer>
        <StoryHeader
          title="Flexible Checkmate"
          subtitle="Any checkmate move solves the puzzle"
        />
        <div className="px-4 py-3 bg-success-bg border border-success rounded-md text-size-sm text-success-text text-center">
          <strong>solveOnCheckmate=true (default)</strong>
          <br />
          Try Qc8#, Qf8#, Rb8#, or the canonical Ra8#
        </div>
        <BoardWrapper>
          <ChessPuzzle.Board />
        </BoardWrapper>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <ChessPuzzle.Reset asChild>
            <Button variant="outline">Restart</Button>
          </ChessPuzzle.Reset>
        </div>
      </StoryContainer>
    </ChessPuzzle.Root>
  );
};

export const MultiMatePuzzleStrict = (args: RootProps) => {
  return (
    <ChessPuzzle.Root
      {...args}
      puzzle={multiMatePuzzle}
      solveOnCheckmate={false}
    >
      <StoryContainer>
        <StoryHeader
          title="Strict Checkmate"
          subtitle="Only the canonical solution is accepted"
        />
        <div className="px-4 py-3 bg-danger-bg border border-danger rounded-md text-size-sm text-danger-text text-center">
          <strong>solveOnCheckmate=false</strong>
          <br />
          Only Ra8# is accepted. Alternative mates like Qc8# will fail!
        </div>
        <BoardWrapper>
          <ChessPuzzle.Board />
        </BoardWrapper>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <ChessPuzzle.Reset asChild>
            <Button variant="outline">Restart</Button>
          </ChessPuzzle.Reset>
        </div>
      </StoryContainer>
    </ChessPuzzle.Root>
  );
};
