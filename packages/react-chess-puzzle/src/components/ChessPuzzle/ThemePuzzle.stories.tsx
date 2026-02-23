import type { Meta } from "@storybook/react-vite";
import React, { useState } from "react";
import { ChessPuzzle } from "./index";
import { defaultPuzzleTheme } from "../../theme/defaults";
import type { ChessPuzzleTheme } from "../../theme/types";
import { ColorInput, copyToClipboard } from "@story-helpers";

const meta: Meta<typeof ChessPuzzle.Root> = {
  title: "Packages/react-chess-puzzle/Theming/Playground",
  component: ChessPuzzle.Root,
  tags: ["theme", "puzzle"],
  decorators: [
    (Story) => (
      <div className="max-w-story-xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;

const samplePuzzle = {
  fen: "4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
  moves: ["Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"],
  makeFirstMove: false,
};

export const PuzzlePlayground = () => {
  const [theme, setTheme] = useState<ChessPuzzleTheme>(defaultPuzzleTheme);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

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

  const themeCode = `const myPuzzleTheme: PartialChessPuzzleTheme = {
  puzzle: ${JSON.stringify(theme.puzzle, null, 4)}
};`;

  const handleCopy = async () => {
    const success = await copyToClipboard(themeCode);
    if (success) {
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Top row: Preview + Controls */}
      <div className="flex gap-6 items-start">
        {/* Preview */}
        <div className="flex flex-col gap-2">
          <h3 className="text-size-sm font-semibold text-text">Preview</h3>
          <div className="max-w-story-lg">
            <ChessPuzzle.Root puzzle={samplePuzzle} theme={theme}>
              <ChessPuzzle.Board />
              <div className="mt-2 flex gap-2">
                <ChessPuzzle.Hint asChild>
                  <button className="py-1 px-3 text-size-xs border border-border rounded bg-surface hover:bg-surface-alt">
                    Hint
                  </button>
                </ChessPuzzle.Hint>
                <ChessPuzzle.Reset asChild>
                  <button className="py-1 px-3 text-size-xs border border-border rounded bg-surface hover:bg-surface-alt">
                    Reset
                  </button>
                </ChessPuzzle.Reset>
              </div>
            </ChessPuzzle.Root>
          </div>
          <p className="text-size-xs text-text-muted">
            Solution: Bxd7+, Nxd7, Qb8+, Nxb8, Rd8#
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 flex-1">
          <h3 className="text-size-sm font-semibold text-text">
            Puzzle Colors
          </h3>

          <div className="p-3 bg-surface-alt rounded border border-border">
            <div className="space-y-2">
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

          <div className="p-3 bg-surface-alt rounded border border-border text-size-xs text-text-muted">
            <p className="font-semibold text-text mb-2">How to test:</p>
            <ul className="pl-4 space-y-1">
              <li>Click "Hint" to see the hint color</li>
              <li>Make a correct move to see success color</li>
              <li>Make a wrong move to see failure color</li>
            </ul>
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
            onClick={handleCopy}
            className={`absolute top-3 right-3 px-2 py-1 text-size-xs rounded ${
              copyError
                ? "bg-danger text-white"
                : copied
                  ? "bg-success text-white"
                  : "bg-accent text-white hover:opacity-90"
            }`}
            aria-label="Copy theme code"
          >
            {copyError ? "Failed" : copied ? "Copied!" : "Copy"}
          </button>
        </div>
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
