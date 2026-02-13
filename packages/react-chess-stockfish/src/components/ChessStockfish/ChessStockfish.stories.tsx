import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessStockfish } from "./index";
import {
  AnalysisRoot,
  EngineStatus,
  VerticalEvalBar,
  StyledEngineLines,
  EVAL_BAR_CLASS,
} from "@story-helpers/stockfish";
import { StoryHeader, StoryContainer } from "@story-helpers";

const FEN = {
  start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
};

const meta = {
  title: "React-Chess-Stockfish/Components/ChessStockfish",
  component: ChessStockfish.Root,
  tags: ["components", "stockfish", "analysis"],
  parameters: { layout: "centered" },
  args: {
    fen: FEN.start,
    workerOptions: { workerPath: "/stockfish.js" },
    children: null,
  },
} satisfies Meta<typeof ChessStockfish.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullLayout: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.start} config={{ multiPV: 3 }}>
      <StoryContainer>
        <StoryHeader
          title="Full layout"
          subtitle="Evaluation bar and engine lines combined"
          fen={FEN.start}
        />
        <div className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 items-start w-full">
          <VerticalEvalBar showEvaluation className={EVAL_BAR_CLASS} />
          <StyledEngineLines maxLines={3} />
        </div>
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};
