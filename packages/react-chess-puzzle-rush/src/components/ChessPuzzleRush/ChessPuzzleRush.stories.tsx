import type { Meta } from "@storybook/react";

import React from "react";
import { RootProps } from "./parts/Root";
import { ChessPuzzleRush } from ".";

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
  title: "react-chess-puzzle-rush/Components/PuzzleRush",
  component: ChessPuzzleRush.Root,
  tags: ["components", "puzzle"],
  argTypes: {},
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
} satisfies Meta<typeof ChessPuzzleRush.Root>;

export default meta;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Example = (args: RootProps) => {
  return (
    <div>
      <ChessPuzzleRush.Root></ChessPuzzleRush.Root>
    </div>
  );
};
