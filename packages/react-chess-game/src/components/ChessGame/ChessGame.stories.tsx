import type { Meta } from "@storybook/react";

import React from "react";
import { ChessGame } from "./index";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "react-chess-game/Components/ChessGame",
  component: ChessGame.Root,
  tags: ["components", "game", "board"],
  argTypes: {},
  parameters: {
    actions: { argTypesRegex: "^_on.*" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "600px" }}>
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChessGame.Root>;

export default meta;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Default = () => {
  return (
    <ChessGame.Root>
      <ChessGame.KeyboardControls />
      <ChessGame.Board />
    </ChessGame.Root>
  );
};

export const WithSounds = () => {
  return (
    <ChessGame.Root>
      <ChessGame.Sounds />
      <ChessGame.Board />
    </ChessGame.Root>
  );
};

export const WithKeyboardControls = () => {
  return (
    <ChessGame.Root>
      <ChessGame.KeyboardControls
        controls={{
          f: (context) => context.methods.flipBoard(),
          w: (context) => context.methods.goToStart(),
          s: (context) => context.methods.goToEnd(),
          a: (context) => context.methods.goToPreviousMove(),
          d: (context) => context.methods.goToNextMove(),
        }}
      />
      <ChessGame.Board />
    </ChessGame.Root>
  );
};
