import type { Meta } from "@storybook/react-vite";
import React from "react";
import { ChessGame } from "./index";
import { themes } from "../../theme";

const meta = {
  title: "react-chess-game/Theme/Presets",
  component: ChessGame.Root,
  tags: ["theme", "presets"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "1200px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChessGame.Root>;

export default meta;

// Position with a move played (to show lastMove highlight)
const POSITION_WITH_MOVE =
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2";

export const DefaultTheme = () => (
  <div style={{ maxWidth: "500px" }}>
    <h3>Default Theme</h3>
    <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
      The original colors matching the classic chessboard look.
    </p>
    <ChessGame.Root theme={themes.default}>
      <ChessGame.Board />
    </ChessGame.Root>
  </div>
);

export const LichessTheme = () => (
  <div style={{ maxWidth: "500px" }}>
    <h3>Lichess Theme</h3>
    <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
      Green highlights inspired by Lichess.org style.
    </p>
    <ChessGame.Root theme={themes.lichess}>
      <ChessGame.Board />
    </ChessGame.Root>
  </div>
);

export const ChessComTheme = () => (
  <div style={{ maxWidth: "500px" }}>
    <h3>Chess.com Theme</h3>
    <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
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
    <div style={{ maxWidth: "500px" }}>
      <h3>Custom Dark Theme Example</h3>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
        Example of a fully custom theme with dark colors and blue highlights.
      </p>
      <ChessGame.Root theme={darkTheme}>
        <ChessGame.Board />
      </ChessGame.Root>
      <details style={{ marginTop: "16px" }}>
        <summary style={{ cursor: "pointer", fontSize: "14px" }}>
          View theme code
        </summary>
        <pre
          style={{
            fontSize: "11px",
            background: "#f5f5f5",
            padding: "12px",
            overflow: "auto",
          }}
        >
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
    <div style={{ maxWidth: "500px" }}>
      <h3>Partial Theme Override</h3>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px" }}>
        Only override specific colors (purple last move, orange check). Other
        colors use defaults.
      </p>
      <ChessGame.Root fen={POSITION_WITH_MOVE} theme={partialTheme}>
        <ChessGame.Board />
      </ChessGame.Root>
      <details style={{ marginTop: "16px" }}>
        <summary style={{ cursor: "pointer", fontSize: "14px" }}>
          View theme code
        </summary>
        <pre
          style={{
            fontSize: "11px",
            background: "#f5f5f5",
            padding: "12px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(partialTheme, null, 2)}
        </pre>
      </details>
    </div>
  );
};
