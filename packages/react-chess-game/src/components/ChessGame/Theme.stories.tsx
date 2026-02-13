import type { Meta } from "@storybook/react-vite";
import React, { useState } from "react";
import { ChessGame } from "./index";
import { defaultGameTheme, themes } from "../../theme";
import type { ChessGameTheme } from "../../theme/types";

const meta = {
  title: "react-chess-game/Theme/Playground",
  component: ChessGame.Root,
  tags: ["theme"],
  decorators: [
    (Story) => (
      <div className="max-w-story-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChessGame.Root>;

export default meta;

// Color picker component
const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  // Extract hex from rgba for color picker
  const rgbaToHex = (rgba: string): string => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, "0");
      const g = parseInt(match[2]).toString(16).padStart(2, "0");
      const b = parseInt(match[3]).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
    return value.startsWith("#") ? value : "#000000";
  };

  const hexToRgba = (hex: string, alpha: number = 0.5): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <input
        type="color"
        value={rgbaToHex(value)}
        onChange={(e) => onChange(hexToRgba(e.target.value))}
        className="w-10 h-[30px] cursor-pointer"
      />
      <span className="text-size-xs min-w-[100px]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-size-xs w-[180px] p-1 border border-border rounded-sm"
      />
    </div>
  );
};

// Background color picker (for board squares)
const BgColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-[30px] cursor-pointer"
      />
      <span className="text-size-xs min-w-[100px]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-size-xs w-[180px] p-1 border border-border rounded-sm"
      />
    </div>
  );
};

export const Playground = () => {
  const [theme, setTheme] = useState<ChessGameTheme>(defaultGameTheme);
  const [copied, setCopied] = useState(false);

  const updateTheme = (path: string[], value: string) => {
    setTheme((prev) => {
      const newTheme = JSON.parse(JSON.stringify(prev));
      let current: Record<string, unknown> = newTheme;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]] as Record<string, unknown>;
      }
      if (path[path.length - 2] === "board") {
        current[path[path.length - 1]] = { backgroundColor: value };
      } else {
        current[path[path.length - 1]] = value;
      }
      return newTheme;
    });
  };

  const copyTheme = () => {
    const themeCode = `const myTheme: PartialChessGameTheme = ${JSON.stringify(theme, null, 2)};`;
    navigator.clipboard.writeText(themeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPreset = (preset: ChessGameTheme) => {
    setTheme(preset);
  };

  return (
    <div className="flex gap-6 flex-wrap">
      <div className="flex-1 min-w-[300px]">
        <h3 className="mb-4">Theme Editor</h3>

        <div className="mb-4">
          <strong>Load Preset:</strong>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1.5 text-size-sm border border-border rounded-sm bg-surface"
              onClick={() => loadPreset(themes.default)}
            >
              Default
            </button>
            <button
              className="px-3 py-1.5 text-size-sm border border-border rounded-sm bg-surface"
              onClick={() => loadPreset(themes.lichess)}
            >
              Lichess
            </button>
            <button
              className="px-3 py-1.5 text-size-sm border border-border rounded-sm bg-surface"
              onClick={() => loadPreset(themes.chessCom)}
            >
              Chess.com
            </button>
          </div>
        </div>

        <div className="mb-4">
          <strong>Board Colors</strong>
          <div className="mt-2">
            <BgColorInput
              label="Light Square"
              value={
                (theme.board.lightSquare as { backgroundColor: string })
                  .backgroundColor
              }
              onChange={(v) => updateTheme(["board", "lightSquare"], v)}
            />
            <BgColorInput
              label="Dark Square"
              value={
                (theme.board.darkSquare as { backgroundColor: string })
                  .backgroundColor
              }
              onChange={(v) => updateTheme(["board", "darkSquare"], v)}
            />
          </div>
        </div>

        <div className="mb-4">
          <strong>State Colors</strong>
          <div className="mt-2">
            <ColorInput
              label="Last Move"
              value={theme.state.lastMove}
              onChange={(v) => updateTheme(["state", "lastMove"], v)}
            />
            <ColorInput
              label="Active Square"
              value={theme.state.activeSquare}
              onChange={(v) => updateTheme(["state", "activeSquare"], v)}
            />
            <ColorInput
              label="Check"
              value={theme.state.check}
              onChange={(v) => updateTheme(["state", "check"], v)}
            />
          </div>
        </div>

        <div className="mb-4">
          <strong>Indicator Colors</strong>
          <div className="mt-2">
            <ColorInput
              label="Move Dot"
              value={theme.indicators.move}
              onChange={(v) => updateTheme(["indicators", "move"], v)}
            />
            <ColorInput
              label="Capture Ring"
              value={theme.indicators.capture}
              onChange={(v) => updateTheme(["indicators", "capture"], v)}
            />
          </div>
        </div>

        <button
          onClick={copyTheme}
          className={`px-4 py-2 text-white border-none rounded-sm cursor-pointer ${copied ? "bg-success" : "bg-info-blue"}`}
        >
          {copied ? "Copied!" : "Copy Theme Code"}
        </button>
      </div>

      <div className="flex-1 min-w-[350px]">
        <h3 className="mb-4">Preview</h3>
        <div className="max-w-board-preview">
          <ChessGame.Root
            fen="r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4"
            theme={theme}
          >
            <ChessGame.Board />
          </ChessGame.Root>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Click on a piece to see move indicators. The position shows a check.
        </p>
      </div>
    </div>
  );
};
