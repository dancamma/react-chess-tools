import type { Meta } from "@storybook/react-vite";
import React from "react";
import { ChessGame } from "./index";
import { themes } from "../../theme";
import { FEN_POSITIONS } from "@story-helpers";

const meta: Meta<typeof ChessGame.Root> = {
  title: "Packages/react-chess-game/Theming/Presets",
  component: ChessGame.Root,
  tags: ["theme", "presets"],
  decorators: [
    (Story) => (
      <div className="max-w-story-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

export const DefaultTheme = () => (
  <div className="max-w-board-preview">
    <h3>Default Theme</h3>
    <p className="text-size-sm text-text-muted mb-4 m-0">
      The original colors matching the classic chessboard look.
    </p>
    <ChessGame.Root theme={themes.default}>
      <ChessGame.Board />
    </ChessGame.Root>
  </div>
);

export const LichessTheme = () => (
  <div className="max-w-board-preview">
    <h3>Lichess Theme</h3>
    <p className="text-size-sm text-text-muted mb-4 m-0">
      Green highlights inspired by Lichess.org style.
    </p>
    <ChessGame.Root theme={themes.lichess}>
      <ChessGame.Board />
    </ChessGame.Root>
  </div>
);

export const ChessComTheme = () => (
  <div className="max-w-board-preview">
    <h3>Chess.com Theme</h3>
    <p className="text-size-sm text-text-muted mb-4 m-0">
      Green board with yellow highlights inspired by Chess.com.
    </p>
    <ChessGame.Root theme={themes.chessCom}>
      <ChessGame.Board />
    </ChessGame.Root>
  </div>
);

export const CustomThemeExample = () => {
  // Example of a custom dark theme
  const darkTheme = {
    board: {
      lightSquare: { backgroundColor: "#4a4a4a" },
      darkSquare: { backgroundColor: "#2d2d2d" },
    },
    state: {
      lastMove: "rgba(100, 150, 255, 0.5)",
      check: "rgba(255, 50, 50, 0.6)",
      activeSquare: "rgba(100, 150, 255, 0.5)",
      dropSquare: { backgroundColor: "rgba(100, 150, 255, 0.3)" },
    },
    indicators: {
      move: "rgba(200, 200, 200, 0.2)",
      capture: "rgba(255, 100, 100, 0.3)",
    },
  };

  return (
    <div className="max-w-board-preview">
      <h3>Custom Dark Theme Example</h3>
      <p className="text-size-sm text-text-muted mb-4 m-0">
        Example of a fully custom theme with dark colors and blue highlights.
      </p>
      <ChessGame.Root theme={darkTheme}>
        <ChessGame.Board />
      </ChessGame.Root>
      <details className="mt-4">
        <summary className="cursor-pointer text-size-sm">
          View theme code
        </summary>
        <pre className="text-size-xs bg-surface-alt p-3 overflow-auto border border-border rounded-sm">
          {JSON.stringify(darkTheme, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export const PartialThemeOverride = () => {
  // Only override specific colors
  const partialTheme = {
    state: {
      lastMove: "rgba(147, 112, 219, 0.5)", // Purple
      check: "rgba(255, 165, 0, 0.6)", // Orange
    },
  };

  return (
    <div className="max-w-board-preview">
      <h3>Partial Theme Override</h3>
      <p className="text-size-sm text-text-muted mb-4 m-0">
        Only override specific colors (purple last move, orange check). Other
        colors use defaults.
      </p>
      <ChessGame.Root fen={FEN_POSITIONS.withMove} theme={partialTheme}>
        <ChessGame.Board />
      </ChessGame.Root>
      <details className="mt-4">
        <summary className="cursor-pointer text-size-sm">
          View theme code
        </summary>
        <pre className="text-size-xs bg-surface-alt p-3 overflow-auto border border-border rounded-sm">
          {JSON.stringify(partialTheme, null, 2)}
        </pre>
      </details>
    </div>
  );
};
