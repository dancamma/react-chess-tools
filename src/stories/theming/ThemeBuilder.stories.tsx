import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import {
  themes,
  mergeTheme,
  type DeepPartial,
  type ChessGameTheme,
} from "@react-chess-tools/react-chess-game";
import { StoryHeader, BoardWrapper, ColorInput } from "@story-helpers";

const meta = {
  title: "Theming/Theme Builder",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

// Helper to safely extract background color from theme square
const getSquareColor = (square: unknown, fallback: string): string => {
  if (
    square &&
    typeof square === "object" &&
    square !== null &&
    "backgroundColor" in square &&
    typeof (square as { backgroundColor: unknown }).backgroundColor === "string"
  ) {
    return (square as { backgroundColor: string }).backgroundColor;
  }
  return fallback;
};

export const Builder: StoryObj = {
  render: () => {
    const [baseThemeKey, setBaseThemeKey] =
      React.useState<keyof typeof themes>("default");

    // Custom colors
    const [lightSquare, setLightSquare] = React.useState("#f0d9b5");
    const [darkSquare, setDarkSquare] = React.useState("#b58863");
    const [lastMove, setLastMove] = React.useState("rgba(255, 255, 0, 0.4)");
    const [check, setCheck] = React.useState("rgba(255, 0, 0, 0.6)");
    const [moveIndicator, setMoveIndicator] =
      React.useState("rgba(0, 0, 0, 0.1)");
    const [captureIndicator, setCaptureIndicator] =
      React.useState("rgba(0, 0, 0, 0.2)");

    // Position with move and check potential
    const [fen] = React.useState(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
    );

    // Build custom theme by merging base preset with overrides
    const customOverrides: DeepPartial<ChessGameTheme> = {
      board: {
        lightSquare: { backgroundColor: lightSquare },
        darkSquare: { backgroundColor: darkSquare },
      },
      state: {
        lastMove,
        check,
      },
      indicators: {
        move: moveIndicator,
        capture: captureIndicator,
      },
    };

    const customTheme = mergeTheme(themes[baseThemeKey], customOverrides);

    const generatedCode = `import { ChessGame, mergeTheme, themes, type DeepPartial, type ChessGameTheme } from '@react-chess-tools/react-chess-game';

const myTheme = mergeTheme(themes.${baseThemeKey}, ${JSON.stringify(customOverrides, null, 2)});

<ChessGame.Root theme={myTheme}>
  <ChessGame.Board />
</ChessGame.Root>`;

    return (
      <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
        {/* Top row: Preview + Controls */}
        <div className="flex gap-6 items-start">
          {/* Preview */}
          <div className="flex flex-col gap-2">
            <h3 className="text-size-sm font-semibold text-text">Preview</h3>
            <BoardWrapper>
              <ChessGame.Root theme={customTheme} fen={fen}>
                <ChessGame.Board />
              </ChessGame.Root>
            </BoardWrapper>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3 flex-1">
            <h3 className="text-size-sm font-semibold text-text">Colors</h3>

            <div className="p-3 bg-surface-alt rounded border border-border">
              <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Board Squares
              </h4>
              <div className="space-y-2">
                <ColorInput
                  label="Light Square"
                  value={lightSquare}
                  onChange={setLightSquare}
                />
                <ColorInput
                  label="Dark Square"
                  value={darkSquare}
                  onChange={setDarkSquare}
                />
              </div>
            </div>

            <div className="p-3 bg-surface-alt rounded border border-border">
              <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                State Highlights
              </h4>
              <div className="space-y-2">
                <ColorInput
                  label="Last Move"
                  value={lastMove}
                  onChange={setLastMove}
                />
                <ColorInput label="Check" value={check} onChange={setCheck} />
              </div>
            </div>

            <div className="p-3 bg-surface-alt rounded border border-border">
              <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Move Indicators
              </h4>
              <div className="space-y-2">
                <ColorInput
                  label="Legal Move"
                  value={moveIndicator}
                  onChange={setMoveIndicator}
                />
                <ColorInput
                  label="Capture"
                  value={captureIndicator}
                  onChange={setCaptureIndicator}
                />
              </div>
            </div>

            {/* Preset buttons */}
            <div className="p-3 bg-surface-alt rounded border border-border">
              <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Start from Preset
              </h4>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(themes).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setBaseThemeKey(key as keyof typeof themes);
                      const t = themes[key as keyof typeof themes];
                      setLightSquare(
                        getSquareColor(t.board?.lightSquare, "#f0d9b5"),
                      );
                      setDarkSquare(
                        getSquareColor(t.board?.darkSquare, "#b58863"),
                      );
                    }}
                    className={`px-2 py-1 text-size-xs rounded bg-surface border border-border hover:bg-surface-alt ${
                      baseThemeKey === key ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Generated Code */}
        <div className="flex flex-col gap-2">
          <h3 className="text-size-sm font-semibold text-text">
            Generated Code
          </h3>
          <div className="relative">
            <pre className="text-size-xs font-mono bg-surface-alt p-4 rounded border border-border overflow-auto text-text">
              {generatedCode}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="absolute top-3 right-3 px-2 py-1 text-size-xs bg-accent text-white rounded hover:opacity-90"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    );
  },
};

export const PresetComparer: StoryObj = {
  render: () => {
    const [selectedPreset, setSelectedPreset] =
      React.useState<keyof typeof themes>("default");

    const fen =
      "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";

    return (
      <div className="flex flex-col items-center gap-4 p-6 max-w-3xl mx-auto">
        <h3 className="text-size-lg font-semibold text-text">
          Preset Comparer
        </h3>
        <p className="text-size-sm text-text-secondary">
          Click a preset to apply it to the board
        </p>

        {/* Preset selector */}
        <div className="flex gap-2">
          {Object.keys(themes).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedPreset(key as keyof typeof themes)}
              className={`px-4 py-2 text-size-sm rounded transition-colors ${
                selectedPreset === key
                  ? "bg-accent text-white"
                  : "bg-surface-alt text-text-secondary hover:bg-surface"
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {/* Board preview */}
        <BoardWrapper>
          <ChessGame.Root theme={themes[selectedPreset]} fen={fen}>
            <ChessGame.Board />
            <ChessGame.Sounds />
          </ChessGame.Root>
        </BoardWrapper>

        {/* Theme JSON */}
        <div className="w-full max-w-[400px]">
          <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
            Theme Configuration
          </h4>
          <pre className="text-size-xs font-mono bg-surface-alt p-3 rounded border border-border overflow-auto max-h-[200px] text-text">
            {JSON.stringify(themes[selectedPreset], null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};

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

export const Examples: StoryObj = {
  render: () => {
    const darkTheme = {
      board: {
        lightSquare: { backgroundColor: "#769656" },
        darkSquare: { backgroundColor: "#4a6741" },
      },
      state: {
        lastMove: "rgba(255, 255, 255, 0.3)",
        check: "rgba(255, 50, 50, 0.6)",
        activeSquare: "rgba(255, 255, 255, 0.3)",
        dropSquare: { backgroundColor: "rgba(255, 255, 255, 0.2)" },
      },
      indicators: {
        move: "rgba(255, 255, 255, 0.3)",
        capture: "rgba(255, 255, 255, 0.4)",
      },
    };

    const oceanTheme = {
      board: {
        lightSquare: { backgroundColor: "#e8f4f8" },
        darkSquare: { backgroundColor: "#5da4c8" },
      },
      state: {
        lastMove: "rgba(0, 100, 200, 0.4)",
        check: "rgba(255, 50, 50, 0.6)",
        activeSquare: "rgba(0, 100, 200, 0.3)",
        dropSquare: { backgroundColor: "rgba(0, 100, 200, 0.2)" },
      },
      indicators: {
        move: "rgba(0, 100, 200, 0.3)",
        capture: "rgba(0, 100, 200, 0.5)",
      },
    };

    const purpleTheme = {
      board: {
        lightSquare: { backgroundColor: "#e8e0f0" },
        darkSquare: { backgroundColor: "#8b5cf6" },
      },
      state: {
        lastMove: "rgba(139, 92, 246, 0.5)",
        check: "rgba(255, 50, 50, 0.6)",
        activeSquare: "rgba(139, 92, 246, 0.4)",
        dropSquare: { backgroundColor: "rgba(139, 92, 246, 0.2)" },
      },
      indicators: {
        move: "rgba(139, 92, 246, 0.3)",
        capture: "rgba(139, 92, 246, 0.5)",
      },
    };

    const warmTheme = {
      board: {
        lightSquare: { backgroundColor: "#f5deb3" },
        darkSquare: { backgroundColor: "#b8860b" },
      },
      state: {
        lastMove: "rgba(255, 165, 0, 0.5)",
        check: "rgba(255, 50, 50, 0.6)",
        activeSquare: "rgba(255, 165, 0, 0.4)",
        dropSquare: { backgroundColor: "rgba(255, 165, 0, 0.2)" },
      },
      indicators: {
        move: "rgba(255, 165, 0, 0.3)",
        capture: "rgba(255, 165, 0, 0.5)",
      },
    };

    return (
      <div className="flex flex-col items-center gap-6 p-6 max-w-4xl mx-auto">
        <StoryHeader
          title="Community Themes"
          subtitle="Additional theme examples"
        />
        <div className="grid grid-cols-2 gap-4">
          <ThemeCard
            title="Dark Forest"
            description="Deep green, dark mode feel"
            theme={darkTheme}
          />
          <ThemeCard
            title="Ocean"
            description="Blue and light blue"
            theme={oceanTheme}
          />
          <ThemeCard
            title="Purple Rain"
            description="Lavender and purple"
            theme={purpleTheme}
          />
          <ThemeCard
            title="Warm Wood"
            description="Wheat and golden brown"
            theme={warmTheme}
          />
        </div>
      </div>
    );
  },
};
