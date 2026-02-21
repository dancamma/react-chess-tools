import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessStockfish } from "./index";
import {
  AnalysisRoot,
  EngineStatus,
  VerticalEvalBar,
  HorizontalEvalBar,
  EVAL_BAR_CLASS,
  HORIZONTAL_BAR_CLASS,
  EVAL_BAR_CSS,
} from "@story-helpers/stockfish";
import { StoryHeader, StoryContainer, FEN_POSITIONS } from "@story-helpers";

// Additional FEN positions specific to evaluation bar stories
const FEN = {
  blackWinning:
    "rnbqkbnr/1ppp1ppp/p5Q1/4p3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 1",
  mateIn3: "r1b1kb1r/pppp1ppp/5q2/4n3/3KP3/2N3PN/PPP4P/R1BQ1B1R b kq - 0 1",
};

const meta = {
  title: "Packages/react-chess-stockfish/EvaluationBar",
  component: ChessStockfish.EvaluationBar,
  tags: ["components", "evaluation", "bar"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ChessStockfish.EvaluationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.starting}>
      <StoryContainer>
        <StoryHeader
          title="Vertical evaluation bar"
          subtitle="White fills from bottom, black fills from top"
          fen={FEN_POSITIONS.starting}
        />
        <VerticalEvalBar showEvaluation className={EVAL_BAR_CLASS} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.whiteWinning}>
      <StoryContainer className="w-story max-w-full">
        <StoryHeader
          title="Horizontal evaluation bar"
          subtitle="Same evaluation data in horizontal orientation"
          fen={FEN_POSITIONS.whiteWinning}
        />
        <HorizontalEvalBar showEvaluation className={HORIZONTAL_BAR_CLASS} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const Perspective: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.whiteWinning}>
      <StoryContainer className="w-story max-w-full">
        <StoryHeader
          title="Perspective switch"
          subtitle="Same eval value rendered from white and black perspectives"
          fen={FEN_POSITIONS.whiteWinning}
        />
        <div className="flex gap-7 items-center">
          {(["w", "b"] as const).map((perspective) => (
            <div key={perspective} className="flex flex-col gap-2">
              <span className="font-mono text-size-xs text-text-secondary">
                {perspective === "w" ? "white" : "black"} perspective
              </span>
              <VerticalEvalBar
                perspective={perspective}
                showEvaluation
                className={EVAL_BAR_CLASS}
              />
            </div>
          ))}
        </div>
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const NoText: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.starting}>
      <StoryContainer className="w-board-preview max-w-full">
        <StoryHeader
          title="Bar only"
          subtitle="Fill animation without score label"
          fen={FEN_POSITIONS.starting}
        />
        <VerticalEvalBar showEvaluation={false} className={EVAL_BAR_CLASS} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const AsChild: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.starting}>
      <StoryContainer className="w-board-preview max-w-full">
        <StoryHeader
          title="asChild pattern"
          subtitle="Render the bar into a custom section element"
          fen={FEN_POSITIONS.starting}
        />
        <ChessStockfish.EvaluationBar asChild showEvaluation>
          <section className={EVAL_BAR_CLASS}>
            <style>{EVAL_BAR_CSS}</style>
          </section>
        </ChessStockfish.EvaluationBar>
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const MateScore: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.mateIn3}>
      <StoryContainer className="w-board-preview max-w-full">
        <StoryHeader
          title="Mate score display"
          subtitle="Forced checkmate position shows #N notation"
          fen={FEN.mateIn3}
        />
        <VerticalEvalBar showEvaluation className={EVAL_BAR_CLASS} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const WhiteWinning: Story = {
  render: () => (
    <AnalysisRoot fen={FEN_POSITIONS.whiteWinning}>
      <StoryContainer className="w-story max-w-full">
        <StoryHeader
          title="White winning position"
          subtitle="Large positive evaluation"
          fen={FEN_POSITIONS.whiteWinning}
        />
        <HorizontalEvalBar showEvaluation className={HORIZONTAL_BAR_CLASS} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};

export const BlackWinning: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.blackWinning}>
      <StoryContainer className="w-story max-w-full">
        <StoryHeader
          title="Black winning position"
          subtitle="Large negative evaluation"
          fen={FEN.blackWinning}
        />
        <HorizontalEvalBar showEvaluation className={HORIZONTAL_BAR_CLASS} />
        <EngineStatus />
      </StoryContainer>
    </AnalysisRoot>
  ),
};
