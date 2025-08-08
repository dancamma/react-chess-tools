import type { Meta } from "@storybook/react";

import React from "react";
import { RootProps } from "./parts/Root";
import { ChessPuzzle } from ".";
import { ChessGame } from "@react-chess-tools/react-chess-game";

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

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "react-chess-puzzle/Components/Puzzle",
  component: ChessPuzzle.Root,
  tags: ["components", "puzzle"],
  argTypes: {
    puzzle: {
      control: {
        type: "select",
        labels: {
          0: "Mate in 3 (white)",
          1: "Tactical motif (black)",
        },
      },
      mapping: {
        0: puzzles[0],
        1: puzzles[1],
      },
      options: [0, 1],
      description: "The puzzle definition (fen + solution moves)",
    },
    onSolve: { action: "onSolve" },
    onFail: { action: "onFail" },
    animationDuration: {
      control: { type: "range", min: 0, max: 2000, step: 50 },
      description: "Animation duration for piece movements in milliseconds",
    },
    computerMoveDelay: {
      control: { type: "range", min: 0, max: 3000, step: 100 },
      description:
        "Delay before computer makes a move in milliseconds (default: 150ms)",
    },
  },
  parameters: {
    actions: { argTypesRegex: "^_on.*" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChessPuzzle.Root>;

export default meta;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Example = (args: RootProps) => {
  return (
    <div>
      <ChessPuzzle.Root {...args}>
        <ChessPuzzle.Board />
        <ChessPuzzle.Reset asChild>
          <button>restart</button>
        </ChessPuzzle.Reset>
        <ChessPuzzle.Hint>hint</ChessPuzzle.Hint>
      </ChessPuzzle.Root>
    </div>
  );
};

Example.args = {
  puzzle: puzzles[0],
  animationDuration: 300,
  computerMoveDelay: 150,
};

export const Underpromotion = (args: RootProps) => {
  return (
    <div>
      <ChessPuzzle.Root {...args}>
        <ChessPuzzle.Board />
        <ChessPuzzle.Reset asChild>
          <button>done! Restart</button>
        </ChessPuzzle.Reset>
      </ChessPuzzle.Root>
    </div>
  );
};

Underpromotion.args = {
  puzzle: {
    fen: "8/8/5R1p/8/3pb1P1/kpKp4/8/8 w - - 0 54",
    moves: ["c3d4", "d3d2", "d4c3", "d2d1n"],
    makeFirstMove: true,
  },
};

export const WithSounds = (args: RootProps) => {
  return (
    <ChessPuzzle.Root {...args}>
      <ChessGame.Sounds />
      <ChessPuzzle.Board />
    </ChessPuzzle.Root>
  );
};

WithSounds.args = {
  puzzle: puzzles[0],
};

export const WithKeyboardControls = (args: RootProps) => {
  return (
    <ChessPuzzle.Root {...args}>
      <ChessGame.KeyboardControls
        controls={{
          f: (context) => context.methods.flipBoard(),
          w: (context) => context.methods.goToStart(),
          s: (context) => context.methods.goToEnd(),
          a: (context) => context.methods.goToPreviousMove(),
          d: (context) => context.methods.goToNextMove(),
        }}
      />
      <ChessPuzzle.Board />
    </ChessPuzzle.Root>
  );
};

WithKeyboardControls.args = {
  puzzle: puzzles[0],
};

export const SmoothAnimations = (args: RootProps) => {
  return (
    <div>
      <h3>Smooth Computer Moves (slower animation + delay)</h3>
      <ChessPuzzle.Root
        {...args}
        animationDuration={args.animationDuration ?? 800}
        computerMoveDelay={args.computerMoveDelay ?? 1200}
      >
        <ChessPuzzle.Board />
        <ChessPuzzle.Reset asChild>
          <button>restart</button>
        </ChessPuzzle.Reset>
        <ChessPuzzle.Hint>hint</ChessPuzzle.Hint>
      </ChessPuzzle.Root>
    </div>
  );
};

SmoothAnimations.args = {
  puzzle: puzzles[0],
};

export const FastAnimations = (args: RootProps) => {
  return (
    <div>
      <h3>Fast Computer Moves (faster animation + delay)</h3>
      <ChessPuzzle.Root
        {...args}
        animationDuration={args.animationDuration ?? 150}
        computerMoveDelay={args.computerMoveDelay ?? 300}
      >
        <ChessPuzzle.Board />
        <ChessPuzzle.Reset asChild>
          <button>restart</button>
        </ChessPuzzle.Reset>
        <ChessPuzzle.Hint>hint</ChessPuzzle.Hint>
      </ChessPuzzle.Root>
    </div>
  );
};

FastAnimations.args = {
  puzzle: puzzles[0],
};

export const ThinkingDelay = (args: RootProps) => {
  return (
    <div>
      <h3>Thinking Computer (long delay, normal animation)</h3>
      <p>Computer takes 2 seconds to “think” before moving</p>
      <ChessPuzzle.Root
        {...args}
        animationDuration={args.animationDuration ?? 300}
        computerMoveDelay={args.computerMoveDelay ?? 2000}
      >
        <ChessPuzzle.Board />
        <ChessPuzzle.Reset asChild>
          <button>restart</button>
        </ChessPuzzle.Reset>
        <ChessPuzzle.Hint>hint</ChessPuzzle.Hint>
      </ChessPuzzle.Root>
    </div>
  );
};

ThinkingDelay.args = {
  puzzle: puzzles[0],
};

export const InstantMoves = (args: RootProps) => {
  return (
    <div>
      <h3>Instant Computer Moves (no delay, fast animation)</h3>
      <p>Computer moves immediately like the original behavior</p>
      <ChessPuzzle.Root
        {...args}
        animationDuration={args.animationDuration ?? 200}
        computerMoveDelay={args.computerMoveDelay ?? 0}
      >
        <ChessPuzzle.Board />
        <ChessPuzzle.Reset asChild>
          <button>restart</button>
        </ChessPuzzle.Reset>
        <ChessPuzzle.Hint>hint</ChessPuzzle.Hint>
      </ChessPuzzle.Root>
    </div>
  );
};

InstantMoves.args = {
  puzzle: puzzles[0],
};
