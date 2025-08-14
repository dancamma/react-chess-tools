import type { Meta } from "@storybook/react";
import React from "react";
import { ChessGame } from "./index";
import { themes } from "../../theme";
import { ThemePlayground } from "../../../../../.storybook";

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

export const WithTheme = (args: { themeName: keyof typeof themes }) => {
  const theme = themes[args.themeName] ?? themes.blue;
  return (
    <ChessGame.Root theme={theme}>
      <ChessGame.Board />
    </ChessGame.Root>
  );
};

WithTheme.argTypes = {
  themeName: {
    control: { type: "select" },
    options: Object.keys(themes),
  },
};

WithTheme.args = {
  themeName: "blue",
};

// Theme Playground Story - now using extracted component
const ThemePlaygroundStory = () => <ThemePlayground />;

// Override the global decorator for fullscreen experience
ThemePlaygroundStory.decorators = [
  (Story: React.ComponentType) => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        zIndex: 1000,
      }}
    >
      <Story />
    </div>
  ),
];

ThemePlaygroundStory.parameters = {
  layout: "fullscreen",
  viewport: {
    disable: true,
  },
};

export { ThemePlaygroundStory as ThemePlayground };
