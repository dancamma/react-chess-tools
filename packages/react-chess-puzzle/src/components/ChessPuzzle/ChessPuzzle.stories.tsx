import type { Meta } from "@storybook/react";

import React from "react";
import { RootProps } from "./parts/Root";
import { ChessPuzzle } from ".";
import { ChessGame } from "@react-chess-tools/react-chess-game";

const puzzles = [
  {
    fen: "4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
    moves: ["Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"],
    makeFirstMove: false,
  },
  {
    fen: "6k1/5p1p/p1q1p1p1/1pB1P3/1Pr3Pn/P4P1P/4Q3/3R2K1 b - - 0 31",
    moves: ["h4f3", "e2f3", "c4c5", "d1d8", "g8g7", "f3f6"],
    makeFirstMove: true,
  },
];

// ============================================================================
// Shared Story Styles
// ============================================================================
const storyStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "20px",
    padding: "24px",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    maxWidth: "500px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "8px",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#2c3e50",
    margin: 0,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "14px",
    color: "#6c757d",
    margin: 0,
    textAlign: "center" as const,
  },
  boardWrapper: {
    backgroundColor: "#fff",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  controlsSection: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  button: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    color: "#495057",
    transition: "all 0.2s ease",
  } as React.CSSProperties,
  buttonPrimary: {
    backgroundColor: "#4dabf7",
    color: "#fff",
    boxShadow: "0 2px 6px rgba(77, 171, 247, 0.3)",
  } as React.CSSProperties,
  buttonSuccess: {
    backgroundColor: "#51cf66",
    color: "#fff",
    boxShadow: "0 2px 6px rgba(81, 207, 102, 0.3)",
  } as React.CSSProperties,
  hintButton: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    border: "1px dashed #adb5bd",
    borderRadius: "8px",
    backgroundColor: "transparent",
    color: "#868e96",
  } as React.CSSProperties,
  infoBox: {
    padding: "12px 16px",
    backgroundColor: "#e7f5ff",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#1864ab",
    textAlign: "center" as const,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: 600,
    backgroundColor: "#e9ecef",
    borderRadius: "20px",
    color: "#495057",
  },
};

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "react-chess-puzzle/Components/Puzzle",
  component: ChessPuzzle.Root,
  tags: ["components", "puzzle"],
  argTypes: {
    onSolve: { action: "onSolve" },
    onFail: { action: "onFail" },
  },
  parameters: {
    actions: { argTypesRegex: "^_on.*" },
    layout: "centered",
  },
} satisfies Meta<typeof ChessPuzzle.Root>;

export default meta;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args

export const Example = (args: RootProps) => {
  const [puzzleIndex, setPuzzleIndex] = React.useState(0);
  const puzzle = puzzles[puzzleIndex];
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzle}>
      <div style={storyStyles.container}>
        <div style={storyStyles.header}>
          <h3 style={storyStyles.title}>Chess Puzzle</h3>
          <p style={storyStyles.subtitle}>Find the best move sequence</p>
          <span style={storyStyles.statusBadge}>
            Puzzle {puzzleIndex + 1} of {puzzles.length}
          </span>
        </div>
        <div style={storyStyles.boardWrapper}>
          <ChessPuzzle.Board />
        </div>
        <div style={storyStyles.controlsSection}>
          <ChessPuzzle.Reset asChild>
            <button style={storyStyles.button}>Restart</button>
          </ChessPuzzle.Reset>
          <ChessPuzzle.Reset
            asChild
            puzzle={puzzles[(puzzleIndex + 1) % puzzles.length]}
            onReset={() => setPuzzleIndex((puzzleIndex + 1) % puzzles.length)}
          >
            <button
              style={{ ...storyStyles.button, ...storyStyles.buttonPrimary }}
            >
              Next Puzzle
            </button>
          </ChessPuzzle.Reset>
          <ChessPuzzle.Hint style={storyStyles.hintButton}>
            💡 Hint
          </ChessPuzzle.Hint>
        </div>
      </div>
    </ChessPuzzle.Root>
  );
};

export const WithOrientation = (args: RootProps) => {
  const puzzle = {
    fen: "4kbnr/2p1pp1p/pp4p1/5b2/8/2NB1N2/PP3PPP/RKB4R b k - 0 1",
    makeFirstMove: false,
    moves: ["Bxd3"],
  };
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzle}>
      <div style={storyStyles.container}>
        <div style={storyStyles.header}>
          <h3 style={storyStyles.title}>Black to Move</h3>
          <p style={storyStyles.subtitle}>
            Board oriented from Black's perspective
          </p>
        </div>
        <div style={storyStyles.boardWrapper}>
          <ChessPuzzle.Board options={{ boardOrientation: "black" }} />
        </div>
        <div style={storyStyles.controlsSection}>
          <ChessPuzzle.Reset asChild>
            <button style={storyStyles.button}>Restart</button>
          </ChessPuzzle.Reset>
          <ChessPuzzle.Hint style={storyStyles.hintButton}>
            💡 Hint
          </ChessPuzzle.Hint>
        </div>
      </div>
    </ChessPuzzle.Root>
  );
};

export const Underpromotion = (args: RootProps) => {
  const puzzle = {
    fen: "8/8/5R1p/8/3pb1P1/kpKp4/8/8 w - - 0 54",
    moves: ["c3d4", "d3d2", "d4c3", "d2d1n"],
    makeFirstMove: true,
  };
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzle}>
      <div style={storyStyles.container}>
        <div style={storyStyles.header}>
          <h3 style={storyStyles.title}>Underpromotion Challenge</h3>
          <p style={storyStyles.subtitle}>
            Promote to a knight instead of a queen
          </p>
        </div>
        <div style={storyStyles.boardWrapper}>
          <ChessPuzzle.Board />
        </div>
        <div style={storyStyles.controlsSection}>
          <ChessPuzzle.Reset asChild>
            <button
              style={{ ...storyStyles.button, ...storyStyles.buttonSuccess }}
            >
              ✓ Solved! Restart
            </button>
          </ChessPuzzle.Reset>
        </div>
        <div style={storyStyles.infoBox}>
          Sometimes promoting to a knight is better than a queen!
        </div>
      </div>
    </ChessPuzzle.Root>
  );
};

export const WithSounds = (args: RootProps) => {
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzles[0]}>
      <ChessGame.Sounds />
      <div style={storyStyles.container}>
        <div style={storyStyles.header}>
          <h3 style={storyStyles.title}>Puzzle with Sound</h3>
          <p style={storyStyles.subtitle}>Audio feedback on every move</p>
        </div>
        <div style={storyStyles.boardWrapper}>
          <ChessPuzzle.Board />
        </div>
        <p style={{ fontSize: "12px", color: "#868e96", textAlign: "center" }}>
          Move pieces to hear different sounds
        </p>
      </div>
    </ChessPuzzle.Root>
  );
};

export const WithKeyboardControls = (args: RootProps) => {
  return (
    <ChessPuzzle.Root {...args} puzzle={puzzles[0]}>
      <ChessGame.KeyboardControls
        controls={{
          f: (context) => context.methods.flipBoard(),
          w: (context) => context.methods.goToStart(),
          s: (context) => context.methods.goToEnd(),
          a: (context) => context.methods.goToPreviousMove(),
          d: (context) => context.methods.goToNextMove(),
        }}
      />
      <div style={storyStyles.container}>
        <div style={storyStyles.header}>
          <h3 style={storyStyles.title}>Keyboard Navigation</h3>
          <p style={storyStyles.subtitle}>Use keyboard shortcuts to navigate</p>
        </div>
        <div style={storyStyles.boardWrapper}>
          <ChessPuzzle.Board />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, auto)",
            gap: "8px",
            justifyContent: "center",
            marginTop: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#495057",
            }}
          >
            <kbd
              style={{
                padding: "2px 8px",
                backgroundColor: "#e9ecef",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              W
            </kbd>{" "}
            Start
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#495057",
            }}
          >
            <kbd
              style={{
                padding: "2px 8px",
                backgroundColor: "#e9ecef",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              A
            </kbd>{" "}
            Previous
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#495057",
            }}
          >
            <kbd
              style={{
                padding: "2px 8px",
                backgroundColor: "#e9ecef",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              F
            </kbd>{" "}
            Flip
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#495057",
            }}
          >
            <kbd
              style={{
                padding: "2px 8px",
                backgroundColor: "#e9ecef",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              S
            </kbd>{" "}
            End
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#495057",
            }}
          >
            <kbd
              style={{
                padding: "2px 8px",
                backgroundColor: "#e9ecef",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              D
            </kbd>{" "}
            Next
          </div>
        </div>
      </div>
    </ChessPuzzle.Root>
  );
};

// Puzzle with multiple checkmate solutions for testing solveOnCheckmate prop
const multiMatePuzzle = {
  fen: "7k/R7/1R6/2Q5/4Q3/8/8/7K w - - 0 1",
  moves: ["a7a8"], // Canonical solution
  makeFirstMove: false,
};

export const MultiMatePuzzle = (args: RootProps) => {
  return (
    <ChessPuzzle.Root {...args} puzzle={multiMatePuzzle}>
      <div style={storyStyles.container}>
        <div style={storyStyles.header}>
          <h3 style={storyStyles.title}>Flexible Checkmate</h3>
          <p style={storyStyles.subtitle}>
            Any checkmate move solves the puzzle
          </p>
        </div>
        <div
          style={{
            ...storyStyles.infoBox,
            backgroundColor: "#d3f9d8",
            color: "#2b8a3e",
          }}
        >
          <strong>solveOnCheckmate=true (default)</strong>
          <br />
          Try Qc8#, Qf8#, Rb8#, or the canonical Ra8#
        </div>
        <div style={storyStyles.boardWrapper}>
          <ChessPuzzle.Board />
        </div>
        <div style={storyStyles.controlsSection}>
          <ChessPuzzle.Reset asChild>
            <button style={storyStyles.button}>Restart</button>
          </ChessPuzzle.Reset>
        </div>
      </div>
    </ChessPuzzle.Root>
  );
};

export const MultiMatePuzzleStrict = (args: RootProps) => {
  return (
    <ChessPuzzle.Root
      {...args}
      puzzle={multiMatePuzzle}
      solveOnCheckmate={false}
    >
      <div style={storyStyles.container}>
        <div style={storyStyles.header}>
          <h3 style={storyStyles.title}>Strict Checkmate</h3>
          <p style={storyStyles.subtitle}>
            Only the canonical solution is accepted
          </p>
        </div>
        <div
          style={{
            ...storyStyles.infoBox,
            backgroundColor: "#ffe3e3",
            color: "#c92a2a",
          }}
        >
          <strong>solveOnCheckmate=false</strong>
          <br />
          Only Ra8# is accepted. Alternative mates like Qc8# will fail!
        </div>
        <div style={storyStyles.boardWrapper}>
          <ChessPuzzle.Board />
        </div>
        <div style={storyStyles.controlsSection}>
          <ChessPuzzle.Reset asChild>
            <button style={storyStyles.button}>Restart</button>
          </ChessPuzzle.Reset>
        </div>
      </div>
    </ChessPuzzle.Root>
  );
};
