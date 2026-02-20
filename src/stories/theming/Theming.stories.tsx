import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { themes } from "@react-chess-tools/react-chess-game";
import { StoryHeader, BoardWrapper } from "@story-helpers";

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

// Position with a move played to show lastMove highlight
const POSITION_WITH_MOVE =
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2";

const ThemeCard = ({
  title,
  description,
  theme,
  fen = POSITION_WITH_MOVE,
}: {
  title: string;
  description: string;
  theme: object;
  fen?: string;
}) => (
  <div className="flex flex-col items-center gap-3 p-4 bg-surface rounded-lg border border-border">
    <div className="text-center">
      <h3 className="text-size-md font-semibold text-text mb-1">{title}</h3>
      <p className="text-size-xs text-text-muted m-0">{description}</p>
    </div>
    <BoardWrapper>
      <ChessGame.Root theme={theme} fen={fen}>
        <ChessGame.Board />
      </ChessGame.Root>
    </BoardWrapper>
  </div>
);

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
