import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessStockfish } from "./index";
import {
  AnalysisRoot,
  EngineStatus,
  VerticalEvalBar,
  HorizontalEvalBar,
  StyledEngineLines,
  EVAL_BAR_CLASS,
  HORIZONTAL_BAR_CLASS,
} from "@story-helpers/stockfish";
import { StoryHeader, StoryContainer, FEN_POSITIONS } from "@story-helpers";

const meta = {
  title: "Packages/react-chess-stockfish/ChessStockfish",
  component: ChessStockfish.Root,
  tags: ["components", "stockfish", "analysis"],
  parameters: { layout: "centered" },
  args: {
    fen: FEN_POSITIONS.starting,
    workerOptions: { workerPath: "/stockfish.js" },
    children: null,
  },
} satisfies Meta<typeof ChessStockfish.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullLayout: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.starting} config={{ multiPV: 3 }}>
      <StoryContainer>
        <StoryHeader
          title="Full layout"
          subtitle="Evaluation bar and engine lines combined"
          fen={FEN_POSITIONS.starting}
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

export const EvalBarOnly: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.italian}>
      <StoryContainer className="w-board-preview max-w-full">
        <StoryHeader
          title="Evaluation bar only"
          subtitle="Just the evaluation bar without engine lines"
          fen={FEN_POSITIONS.italian}
        />
        <VerticalEvalBar showEvaluation className={EVAL_BAR_CLASS} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const EngineLinesOnly: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.italian} config={{ multiPV: 3 }}>
      <StoryContainer>
        <StoryHeader
          title="Engine lines only"
          subtitle="Just the principal variations without evaluation bar"
          fen={FEN_POSITIONS.italian}
        />
        <StyledEngineLines maxLines={3} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const HorizontalLayout: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.whiteWinning} config={{ multiPV: 2 }}>
      <StoryContainer className="w-story max-w-full">
        <StoryHeader
          title="Horizontal layout"
          subtitle="Horizontal evaluation bar with lines"
          fen={FEN_POSITIONS.whiteWinning}
        />
        <HorizontalEvalBar showEvaluation className={HORIZONTAL_BAR_CLASS} />
        <StyledEngineLines maxLines={2} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const StatusIndicator: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.starting}>
      <StoryContainer className="w-board-preview max-w-full">
        <StoryHeader
          title="Status indicator"
          subtitle="Shows engine state (idle, analyzing, error)"
          fen={FEN_POSITIONS.starting}
        />
        <EngineStatus />
        <p className="text-size-xs text-text-muted m-0 leading-relaxed">
          The status updates automatically as the engine analyzes.
        </p>
      </StoryContainer>
    </AnalysisRoot>
  ),
};
