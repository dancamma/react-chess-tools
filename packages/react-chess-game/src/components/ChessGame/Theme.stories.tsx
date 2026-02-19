import type { Meta } from "@storybook/react-vite";
import React, { useState } from "react";
import { ChessGame } from "./index";
import { defaultGameTheme, themes } from "../../theme";
import type { ChessGameTheme } from "../../theme/types";

const meta = {
  title: "Packages/react-chess-game/Theming/Playground",
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
    <div className="flex items-center gap-2">
      <label className="text-size-xs text-text-secondary min-w-[100px]">
        {label}
      </label>
      <input
        type="color"
        value={rgbaToHex(value)}
        onChange={(e) => onChange(hexToRgba(e.target.value))}
        className="w-8 h-8 rounded border border-border cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1 text-size-xs font-mono border border-border rounded bg-surface text-text"
        placeholder="rgba(0, 0, 0, 0.5)"
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
    <div className="flex items-center gap-2">
      <label className="text-size-xs text-text-secondary min-w-[100px]">
        {label}
      </label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-border cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1 text-size-xs font-mono border border-border rounded bg-surface text-text"
        placeholder="#ffffff"
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

  const themeCode = `const myTheme: PartialChessGameTheme = ${JSON.stringify(theme, null, 2)};`;

  const copyTheme = () => {
    navigator.clipboard.writeText(themeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPreset = (preset: ChessGameTheme) => {
    setTheme(preset);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top row: Preview + Controls */}
      <div className="flex gap-6 items-start">
        {/* Preview */}
        <div className="flex flex-col gap-2">
          <h3 className="text-size-sm font-semibold text-text">Preview</h3>
          <ChessGame.Root
            fen="r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4"
            theme={theme}
          >
            <ChessGame.Board boardWidth={320} />
          </ChessGame.Root>
          <p className="text-size-xs text-text-muted">
            Click a piece to see move indicators
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 flex-1">
          <h3 className="text-size-sm font-semibold text-text">Colors</h3>

          <div className="p-3 bg-surface-alt rounded border border-border">
            <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              Load Preset
            </h4>
            <div className="flex gap-2">
              <button
                className="px-2 py-1 text-size-xs rounded bg-surface border border-border hover:bg-surface-alt"
                onClick={() => loadPreset(themes.default)}
              >
                Default
              </button>
              <button
                className="px-2 py-1 text-size-xs rounded bg-surface border border-border hover:bg-surface-alt"
                onClick={() => loadPreset(themes.lichess)}
              >
                Lichess
              </button>
              <button
                className="px-2 py-1 text-size-xs rounded bg-surface border border-border hover:bg-surface-alt"
                onClick={() => loadPreset(themes.chessCom)}
              >
                Chess.com
              </button>
            </div>
          </div>

          <div className="p-3 bg-surface-alt rounded border border-border">
            <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              Board Squares
            </h4>
            <div className="space-y-2">
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

          <div className="p-3 bg-surface-alt rounded border border-border">
            <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              State Highlights
            </h4>
            <div className="space-y-2">
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

          <div className="p-3 bg-surface-alt rounded border border-border">
            <h4 className="text-size-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              Move Indicators
            </h4>
            <div className="space-y-2">
              <ColorInput
                label="Legal Move"
                value={theme.indicators.move}
                onChange={(v) => updateTheme(["indicators", "move"], v)}
              />
              <ColorInput
                label="Capture"
                value={theme.indicators.capture}
                onChange={(v) => updateTheme(["indicators", "capture"], v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Generated Code */}
      <div className="flex flex-col gap-2">
        <h3 className="text-size-sm font-semibold text-text">Generated Code</h3>
        <div className="relative">
          <pre className="text-size-xs font-mono bg-surface-alt p-4 rounded border border-border overflow-auto text-text">
            {themeCode}
          </pre>
          <button
            onClick={copyTheme}
            className={`absolute top-3 right-3 px-2 py-1 text-size-xs rounded ${copied ? "bg-success text-white" : "bg-accent text-white hover:opacity-90"}`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};
