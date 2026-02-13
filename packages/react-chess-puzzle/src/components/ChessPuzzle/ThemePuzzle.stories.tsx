import type { Meta } from "@storybook/react-vite";
import React, { useState } from "react";
import { ChessPuzzle } from "./index";
import { defaultPuzzleTheme } from "../../theme/defaults";
import type { ChessPuzzleTheme } from "../../theme/types";

const meta = {
  title: "react-chess-puzzle/Theme/Playground",
  component: ChessPuzzle.Root,
  tags: ["theme", "puzzle"],
  decorators: [
    (Story) => (
      <div className="max-w-story-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChessPuzzle.Root>;

export default meta;

const samplePuzzle = {
  fen: "4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
  moves: ["Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"],
  makeFirstMove: false,
};

// Color picker component
const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
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

export const PuzzlePlayground = () => {
  const [theme, setTheme] = useState<ChessPuzzleTheme>(defaultPuzzleTheme);
  const [copied, setCopied] = useState(false);
  const [puzzleKey, setPuzzleKey] = useState(0);

  const updatePuzzleColor = (
    key: keyof ChessPuzzleTheme["puzzle"],
    value: string,
  ) => {
    setTheme((prev) => ({
      ...prev,
      puzzle: {
        ...prev.puzzle,
        [key]: value,
      },
    }));
  };

  const copyTheme = () => {
    const themeCode = `const myPuzzleTheme: PartialChessPuzzleTheme = {
  puzzle: ${JSON.stringify(theme.puzzle, null, 4)}
};`;
    navigator.clipboard.writeText(themeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetPuzzle = () => {
    setPuzzleKey((k) => k + 1);
  };

  return (
    <div className="flex gap-6 flex-wrap font-sans">
      <div className="flex-1 min-w-[300px]">
        <h3 className="mb-4">Puzzle Theme Editor</h3>

        <div className="mb-4">
          <strong>Puzzle Colors</strong>
          <div className="mt-2">
            <ColorInput
              label="Success"
              value={theme.puzzle.success}
              onChange={(v) => updatePuzzleColor("success", v)}
            />
            <ColorInput
              label="Failure"
              value={theme.puzzle.failure}
              onChange={(v) => updatePuzzleColor("failure", v)}
            />
            <ColorInput
              label="Hint"
              value={theme.puzzle.hint}
              onChange={(v) => updatePuzzleColor("hint", v)}
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={copyTheme}
            className={`px-4 py-2 text-white border-none rounded-sm cursor-pointer ${copied ? "bg-success" : "bg-info-blue"}`}
          >
            {copied ? "Copied!" : "Copy Theme Code"}
          </button>
          <button
            onClick={resetPuzzle}
            className="px-4 py-2 text-white border-none rounded-sm cursor-pointer bg-btn-gray"
          >
            Reset Puzzle
          </button>
        </div>

        <div className="text-size-xs text-text-muted">
          <p>
            <strong>How to test colors:</strong>
          </p>
          <ul className="pl-4">
            <li>Click "Hint" to see the hint color</li>
            <li>Make a correct move to see success color</li>
            <li>Make a wrong move to see failure color</li>
            <li>Click "Reset" to try again</li>
          </ul>
        </div>
      </div>

      <div className="flex-1 min-w-[350px]">
        <h3 className="mb-4">Preview</h3>
        <div className="max-w-story-lg">
          <ChessPuzzle.Root key={puzzleKey} puzzle={samplePuzzle} theme={theme}>
            <ChessPuzzle.Board />
            <div className="mt-2 flex gap-2">
              <ChessPuzzle.Hint asChild>
                <button className="py-1.5 px-3 text-size-sm border border-border rounded-sm bg-surface">
                  Hint
                </button>
              </ChessPuzzle.Hint>
              <ChessPuzzle.Reset asChild>
                <button className="py-1.5 px-3 text-size-sm border border-border rounded-sm bg-surface">
                  Reset
                </button>
              </ChessPuzzle.Reset>
            </div>
          </ChessPuzzle.Root>
        </div>
        <p className="text-size-xs text-text-muted mt-2">
          Solution: Bxd7+, Nxd7, Qb8+, Nxb8, Rd8#
        </p>
      </div>
    </div>
  );
};

export const PuzzleThemeExamples = () => {
  const customThemes = {
    default: defaultPuzzleTheme,
    neon: {
      ...defaultPuzzleTheme,
      puzzle: {
        success: "rgba(0, 255, 127, 0.6)",
        failure: "rgba(255, 0, 127, 0.6)",
        hint: "rgba(0, 191, 255, 0.6)",
      },
    },
    pastel: {
      ...defaultPuzzleTheme,
      puzzle: {
        success: "rgba(152, 251, 152, 0.6)",
        failure: "rgba(255, 182, 193, 0.6)",
        hint: "rgba(173, 216, 230, 0.6)",
      },
    },
  };

  return (
    <div className="font-sans">
      <h2 className="mb-6">Puzzle Theme Examples</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        {Object.entries(customThemes).map(([name, theme]) => (
          <div key={name}>
            <h4 className="mb-2 capitalize">{name}</h4>
            <ChessPuzzle.Root puzzle={samplePuzzle} theme={theme}>
              <ChessPuzzle.Board />
              <div className="mt-2 flex gap-2">
                <ChessPuzzle.Hint asChild>
                  <button className="py-1 px-2 text-size-xs border border-border rounded-sm bg-surface">
                    Hint
                  </button>
                </ChessPuzzle.Hint>
                <ChessPuzzle.Reset asChild>
                  <button className="py-1 px-2 text-size-xs border border-border rounded-sm bg-surface">
                    Reset
                  </button>
                </ChessPuzzle.Reset>
              </div>
            </ChessPuzzle.Root>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PartialPuzzleTheme = () => {
  // Only override puzzle colors, inherit game colors from default
  const partialTheme = {
    puzzle: {
      hint: "rgba(255, 215, 0, 0.6)", // Gold
    },
  };

  return (
    <div className="max-w-story-lg font-sans">
      <h3>Partial Puzzle Theme</h3>
      <p className="text-size-sm text-text-muted mb-4 m-0">
        Only override the hint color to gold. Success and failure use defaults.
      </p>
      <ChessPuzzle.Root puzzle={samplePuzzle} theme={partialTheme}>
        <ChessPuzzle.Board />
        <div className="mt-2 flex gap-2">
          <ChessPuzzle.Hint asChild>
            <button className="py-1.5 px-3 text-size-sm border border-border rounded-sm bg-surface">
              Show Gold Hint
            </button>
          </ChessPuzzle.Hint>
          <ChessPuzzle.Reset asChild>
            <button className="py-1.5 px-3 text-size-sm border border-border rounded-sm bg-surface">
              Reset
            </button>
          </ChessPuzzle.Reset>
        </div>
      </ChessPuzzle.Root>
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
