import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessStockfish } from "./index";
import { EngineLines } from "./parts/EngineLines";
import { StoryHeader } from "@story-helpers";
import {
  AnalysisRoot,
  StyledEngineLines,
  EngineStatus,
  ENGINE_LINES_CSS,
} from "@story-helpers/stockfish";

const FEN = {
  start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  italian:
    "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  whiteWinning: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 0 1",
  blackWinning:
    "rnbqkbnr/1ppp1ppp/p5Q1/4p3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 1",
  mateIn3: "r1b1kb1r/pppp1ppp/5q2/4n3/3KP3/2N3PN/PPP4P/R1BQ1B1R b kq - 0 1",
};

const meta = {
  title: "Packages/react-chess-stockfish/EngineLines",
  component: EngineLines,
  tags: ["components", "engine", "lines"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof EngineLines>;

export default meta;
type Story = StoryObj<typeof meta>;

const STORY_CONTAINER_CLASS =
  "flex flex-col gap-4 p-6 w-story max-w-full font-sans";

export const Basic: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.italian} config={{ multiPV: 3 }}>
      <div className={STORY_CONTAINER_CLASS}>
        <StoryHeader
          title="Engine lines"
          subtitle="Default composed rows with evaluation and move list"
          fen={FEN.italian}
        />
        <StyledEngineLines maxLines={3} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const BlackToMove: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.blackWinning} config={{ multiPV: 2 }}>
      <div className={STORY_CONTAINER_CLASS}>
        <StoryHeader
          title="Black to move"
          subtitle="First SAN token starts with the 1... prefix"
          fen={FEN.blackWinning}
        />
        <StyledEngineLines maxLines={2} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const WhiteWinning: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.whiteWinning} config={{ multiPV: 2 }}>
      <div className={STORY_CONTAINER_CLASS}>
        <StoryHeader
          title="White winning"
          subtitle="Position with large white advantage"
          fen={FEN.whiteWinning}
        />
        <StyledEngineLines maxLines={2} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const MateInThree: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.mateIn3} config={{ multiPV: 2 }}>
      <div className={STORY_CONTAINER_CLASS}>
        <StoryHeader
          title="Mate in three"
          subtitle="Forced checkmate position"
          fen={FEN.mateIn3}
        />
        <StyledEngineLines maxLines={2} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const Clickable: Story = {
  render: () => {
    const [selected, setSelected] = React.useState("Click a line");

    return (
      <AnalysisRoot fen={FEN.italian} config={{ multiPV: 3 }}>
        <div className={STORY_CONTAINER_CLASS}>
          <StoryHeader
            title="Clickable lines"
            subtitle="Inspect a variation with onLineClick"
            fen={FEN.italian}
          />
          <StyledEngineLines
            maxLines={3}
            onLineClick={(rank: number, pv: { moves: { san: string }[] }) =>
              setSelected(
                `PV ${rank}: ${pv.moves
                  .slice(0, 4)
                  .map((move: { san: string }) => move.san)
                  .join(" ")}`,
              )
            }
          />
          <div className="font-mono text-size-xs text-text-secondary bg-surface border border-border rounded-sm p-2 px-2.5 w-full">
            selected: <span className="text-text">{selected}</span>
          </div>
        </div>
      </AnalysisRoot>
    );
  },
};

export const AsChild: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.italian} config={{ multiPV: 2 }}>
      <div className={STORY_CONTAINER_CLASS}>
        <StoryHeader
          title="asChild pattern"
          subtitle="Render lines into a custom list element"
          fen={FEN.italian}
        />
        <ChessStockfish.EngineLines asChild maxLines={2}>
          <ul className="list-none m-0 p-0 border border-border rounded-sm overflow-hidden">
            <style>{ENGINE_LINES_CSS}</style>
          </ul>
        </ChessStockfish.EngineLines>
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const MaxLinesOverflow: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.start} config={{ multiPV: 2 }}>
      <div className={STORY_CONTAINER_CLASS}>
        <StoryHeader
          title="maxLines vs available PV"
          subtitle="maxLines=5 but only 2 PVs available (multiPV=2)"
          fen={FEN.start}
        />
        <StyledEngineLines maxLines={5} />
        <p className="text-size-xs text-text-muted m-0 leading-relaxed">
          Engine returns 2 lines, maxLines=5 gracefully shows what&apos;s
          available.
        </p>
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};

export const MultiPV: Story = {
  render: () => (
    <AnalysisRoot fen={FEN.italian} config={{ multiPV: 4 }}>
      <div className={STORY_CONTAINER_CLASS}>
        <StoryHeader
          title="MultiPV analysis"
          subtitle="Four principal variations"
          fen={FEN.italian}
        />
        <StyledEngineLines maxLines={4} />
        <EngineStatus />
      </div>
    </AnalysisRoot>
  ),
};
