import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";
import {
  BoardWrapper,
  STOCKFISH_WORKER_PATH,
  FEN_POSITIONS,
} from "@story-helpers";
import {
  EngineStatus,
  StyledEngineLines,
  VerticalEvalBar,
} from "@story-helpers/stockfish";

const meta = {
  title: "Home",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Interactive landing page showcasing the full capabilities of react-chess-tools. Features a playable board with real-time Stockfish analysis, chess clocks, and sound effects.",
      },
    },
  },
} satisfies Meta;

export default meta;

// Storybook navigation paths (centralized for maintainability)
const STORY_PATHS = {
  quickStart: "/docs/getting-started-quick-start--docs",
  chessGame: "/story/packages-react-chess-game-chess-game--default",
  theming: "/docs/theming-overview--docs",
} as const;

// CTA Button component
function CTAButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <button
      onClick={() => {
        try {
          const target = window.parent !== window ? window.parent : window;
          const url = new URL(target.location.href);
          url.searchParams.set("path", href);
          target.location.href = url.toString();
        } catch {
          // Cross-origin iframe fallback - navigate within current window
          const url = new URL(window.location.href);
          url.searchParams.set("path", href);
          window.location.href = url.toString();
        }
      }}
      className="px-4 py-2 bg-accent text-white text-size-sm font-medium rounded hover:opacity-90 transition-opacity"
    >
      {children}
    </button>
  );
}

export const Landing: StoryObj = {
  render: () => {
    const [fen, setFen] = React.useState(FEN_POSITIONS.starting);

    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-size-lg font-bold text-text mb-2">
            react-chess-tools
          </h1>
          <p className="text-size-md text-text-secondary">
            Build beautiful chess experiences with React
          </p>
        </div>

        {/* Main Layout */}
        <ChessStockfish.Root
          fen={fen}
          workerOptions={{ workerPath: STOCKFISH_WORKER_PATH }}
          config={{ multiPV: 3 }}
        >
          <ChessGame.Root
            fen={fen}
            onMove={(_move, game) => setFen(game.fen())}
            timeControl={{ time: "5+3", clockStart: "delayed" }}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              {/* Left: Evaluation Bar */}
              <div className="hidden lg:block">
                <VerticalEvalBar showEvaluation height={360} width={30} />
              </div>

              {/* Center: Board and Clocks */}
              <div className="flex flex-col gap-4">
                {/* Top Clock */}
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-dark-bg text-white text-size-lg font-mono rounded">
                    <ChessGame.Clock.Display color="black" />
                  </div>
                </div>

                {/* Board */}
                <BoardWrapper>
                  <ChessGame.Board />
                </BoardWrapper>
                <ChessGame.Sounds />
                <ChessGame.KeyboardControls />

                {/* Bottom Clock */}
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-dark-bg text-white text-size-lg font-mono rounded">
                    <ChessGame.Clock.Display color="white" />
                  </div>
                </div>
              </div>

              {/* Right: Engine Lines */}
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-surface-alt rounded border border-border">
                  <h3 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                    Engine Analysis
                  </h3>
                  <StyledEngineLines maxLines={3} />
                  <div className="mt-2">
                    <EngineStatus />
                  </div>
                </div>
              </div>
            </div>
          </ChessGame.Root>
        </ChessStockfish.Root>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <CTAButton href={STORY_PATHS.quickStart}>Quick Start</CTAButton>
          <CTAButton href={STORY_PATHS.chessGame}>Explore Packages</CTAButton>
          <CTAButton href={STORY_PATHS.theming}>View Themes</CTAButton>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-center">
          <p className="text-size-xs text-text-muted">
            Keyboard: Arrow keys for history, Home/End for start/end, F to flip
          </p>
        </div>
      </div>
    );
  },
};
