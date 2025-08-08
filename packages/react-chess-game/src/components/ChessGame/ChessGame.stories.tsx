import type { Meta } from "@storybook/react";

import React from "react";
import { ChessGame } from "./index";
import type { RootProps } from "./parts/Root";

type StoryProps = RootProps & {
  animationDuration?: number;
  areArrowsAllowed?: boolean;
};

const StoryComponent: React.FC<StoryProps> = ({
  fen,
  orientation,
  animationDuration,
  areArrowsAllowed,
}) => (
  <ChessGame.Root fen={fen} orientation={orientation}>
    <ChessGame.KeyboardControls />
    <ChessGame.Board
      animationDuration={animationDuration}
      areArrowsAllowed={areArrowsAllowed}
    />
  </ChessGame.Root>
);

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "react-chess-game/Components/ChessGame",
  component: StoryComponent,
  tags: ["components", "game", "board"],
  argTypes: {
    fen: {
      control: { type: "text" },
      description: "Starting position in FEN format",
    },
    orientation: {
      control: { type: "inline-radio" },
      options: ["w", "b"],
      description: "Board orientation (w = white at bottom, b = black)",
    },
  },
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
} satisfies Meta<typeof StoryComponent>;

export default meta;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Default = (args: StoryProps) => {
  return <StoryComponent {...args} />;
};

Default.args = {
  orientation: "w",
  animationDuration: 300,
  areArrowsAllowed: true,
};

export const WithSounds = (args: StoryProps) => {
  return (
    <ChessGame.Root fen={args.fen} orientation={args.orientation}>
      <ChessGame.Sounds />
      <ChessGame.Board
        animationDuration={args.animationDuration}
        areArrowsAllowed={args.areArrowsAllowed}
      />
    </ChessGame.Root>
  );
};

WithSounds.args = {
  orientation: "w",
  animationDuration: 300,
  areArrowsAllowed: true,
};

export const WithKeyboardControls = (args: StoryProps) => {
  return (
    <ChessGame.Root fen={args.fen} orientation={args.orientation}>
      <ChessGame.KeyboardControls
        controls={{
          f: (context) => context.methods.flipBoard(),
          w: (context) => context.methods.goToStart(),
          s: (context) => context.methods.goToEnd(),
          a: (context) => context.methods.goToPreviousMove(),
          d: (context) => context.methods.goToNextMove(),
        }}
      />
      <ChessGame.Board
        animationDuration={args.animationDuration}
        areArrowsAllowed={args.areArrowsAllowed}
      />
    </ChessGame.Root>
  );
};

WithKeyboardControls.args = {
  orientation: "w",
  animationDuration: 300,
  areArrowsAllowed: true,
};
