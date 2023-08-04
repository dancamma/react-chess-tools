import type { Meta } from "@storybook/react";

import React from "react";
import { RootProps } from "./parts/Root";
import { ChessPuzzle } from ".";

const puzzles = [
  {
    fen: "4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
    moves: ["Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"],
    makeFirstMove: false,
  },
  {
    fen: "q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17",
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
    onSolve: { action: "onSolve" },
    onFail: { action: "onFail" },
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
  const [puzzleIndex, setPuzzleIndex] = React.useState(0);
  const puzzle = puzzles[puzzleIndex];
  return (
    <div>
      <ChessPuzzle.Root {...args} puzzle={puzzle}>
        <ChessPuzzle.Board />
        <ChessPuzzle.Reset asChild>
          <button>restart</button>
        </ChessPuzzle.Reset>
        <ChessPuzzle.Reset
          asChild
          puzzle={puzzles[(puzzleIndex + 1) % puzzles.length]}
          onReset={() => setPuzzleIndex((puzzleIndex + 1) % puzzles.length)}
        >
          <button>next</button>
        </ChessPuzzle.Reset>
        <ChessPuzzle.Hint>hint</ChessPuzzle.Hint>
      </ChessPuzzle.Root>
    </div>
  );
};

export const Underpromotion = (args: RootProps) => {
  const puzzle = {
    fen: "8/8/5R1p/8/3pb1P1/kpKp4/8/8 w - - 0 54",
    moves: ["c3d4", "d3d2", "d4c3", "d2d1n"],
    makeFirstMove: true,
  };
  return (
    <div>
      <ChessPuzzle.Root {...args} puzzle={puzzle}>
        <ChessPuzzle.Board />
        <ChessPuzzle.Reset asChild>
          <button>done! Restart</button>
        </ChessPuzzle.Reset>
      </ChessPuzzle.Root>
    </div>
  );
};
