import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { themes } from "@react-chess-tools/react-chess-game";
import { StoryHeader, ThemeCard } from "@story-helpers";

const meta = {
  title: "Theming/Presets",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Compare available theme presets side by side. Click on any board to interact with it.",
      },
    },
  },
} satisfies Meta;

export default meta;

export const Gallery: StoryObj = {
  render: () => (
    <div className="flex flex-col items-center gap-6 p-6 max-w-4xl mx-auto">
      <StoryHeader
        title="Theme Preset Gallery"
        subtitle="Compare available presets side by side"
      />
      <div className="grid grid-cols-3 gap-4">
        <ThemeCard
          title="Default"
          description="Classic brown board"
          theme={themes.default}
        />
        <ThemeCard
          title="Lichess"
          description="Green highlights"
          theme={themes.lichess}
        />
        <ThemeCard
          title="Chess.com"
          description="Green board, yellow highlights"
          theme={themes.chessCom}
        />
      </div>
    </div>
  ),
};
