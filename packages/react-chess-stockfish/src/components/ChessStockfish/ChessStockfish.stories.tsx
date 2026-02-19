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
import { StoryHeader, StoryContainer } from "@story-helpers";

const FEN = {
  start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  italian:
    "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  whiteWinning: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 0 1",
};

const meta = {
  title: "Packages/react-chess-stockfish/ChessStockfish",
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

export const EvalBarOnly: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.italian}>
      <StoryContainer className="w-board-preview max-w-full">
        <StoryHeader
          title="Evaluation bar only"
          subtitle="Just the evaluation bar without engine lines"
          fen={FEN.italian}
        />
        <VerticalEvalBar showEvaluation className={EVAL_BAR_CLASS} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const EngineLinesOnly: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.italian} config={{ multiPV: 3 }}>
      <StoryContainer>
        <StoryHeader
          title="Engine lines only"
          subtitle="Just the principal variations without evaluation bar"
          fen={FEN.italian}
        />
        <StyledEngineLines maxLines={3} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const HorizontalLayout: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.whiteWinning} config={{ multiPV: 2 }}>
      <StoryContainer className="w-story max-w-full">
        <StoryHeader
          title="Horizontal layout"
          subtitle="Horizontal evaluation bar with lines"
          fen={FEN.whiteWinning}
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
    <AnalysisRoot fen={FEN.start}>
      <StoryContainer className="w-board-preview max-w-full">
        <StoryHeader
          title="Status indicator"
          subtitle="Shows engine state (idle, analyzing, error)"
          fen={FEN.start}
        />
        <EngineStatus />
        <p className="text-size-xs text-text-muted m-0 leading-relaxed">
          The status updates automatically as the engine analyzes.
        </p>
      </StoryContainer>
    </AnalysisRoot>
  ),
};
