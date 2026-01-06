<div align="center">
  <h1>@react-chess-tools/react-chess-puzzle</h1>
  <p>A lightweight, customizable React component library for rendering and interacting with chess puzzles</p>

  [![npm version](https://img.shields.io/npm/v/@react-chess-tools/react-chess-puzzle.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-puzzle)
  [![npm downloads](https://img.shields.io/npm/dm/@react-chess-tools/react-chess-puzzle.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-puzzle)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
</div>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Demo](#demo)
- [Puzzle Solving Flow](#puzzle-solving-flow)
- [API Reference](#api-reference)
  - [ChessPuzzle.Root](#chesspuzzleroot)
  - [ChessPuzzle.Board](#chesspuzzleboard)
  - [ChessPuzzle.Reset](#chesspuzzlereset)
  - [ChessPuzzle.Hint](#chesspuzzlehint)
- [Hooks](#hooks)
  - [useChessPuzzleContext](#usechesspuzzlecontext)
  - [useChessGameContext](#usechessgamecontext)
- [Integration with react-chess-game](#integration-with-react-chess-game)
- [Examples](#examples)
- [License](#license)

## Overview

`@react-chess-tools/react-chess-puzzle` is a React component library for creating interactive chess puzzle experiences. Built on top of [@react-chess-tools/react-chess-game](https://www.npmjs.com/package/@react-chess-tools/react-chess-game), it provides puzzle-specific features like move validation, hints, and progress tracking.

## Features

- **Move Validation** - Automatically validates moves against the puzzle solution
- **Hints** - Show the next correct move to help users
- **Progress Tracking** - Track puzzle state (not-started, in-progress, solved, failed)
- **Callbacks** - React to puzzle solve/fail events
- **Built-in Reset** - Easily restart puzzles or load new ones
- **Sound Effects** - Integrates with ChessGame.Sounds for audio feedback
- **Keyboard Controls** - Navigate through puzzle moves with keyboard
- **TypeScript** - Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @react-chess-tools/react-chess-puzzle
```

```bash
yarn add @react-chess-tools/react-chess-puzzle
```

```bash
pnpm add @react-chess-tools/react-chess-puzzle
```

## Quick Start

```tsx
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";

function App() {
  const puzzle = {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["d2d4", "e5d4", "f3d4"],
    makeFirstMove: false,
  };

  return (
    <ChessPuzzle.Root puzzle={puzzle}>
      <ChessPuzzle.Board />
      <ChessPuzzle.Reset>Restart</ChessPuzzle.Reset>
      <ChessPuzzle.Hint>Get Hint</ChessPuzzle.Hint>
    </ChessPuzzle.Root>
  );
}
```

## Demo

Visit the [live demo](https://react-chess-tools.vercel.app/) to see the component in action.

## Puzzle Solving Flow

1. **Initial Setup** - The board displays the position from the FEN string
2. **First Move** - If `makeFirstMove` is `true`, the component automatically plays the first move
3. **User Interaction** - The user attempts to solve the puzzle by making moves
4. **Validation** - Each move is validated against the solution:
   - Correct move: The puzzle continues, opponent's response is auto-played
   - Incorrect move: The puzzle is marked as failed
5. **Completion** - When all correct moves are made, the puzzle is marked as solved

## API Reference

### ChessPuzzle.Root

The root component that provides puzzle context to all child components.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `puzzle` | `Puzzle` | - | The puzzle configuration (required) |
| `onSolve` | `(ctx: ChessPuzzleContextType) => void` | - | Callback when puzzle is solved |
| `onFail` | `(ctx: ChessPuzzleContextType) => void` | - | Callback when an incorrect move is made |
| `theme` | `PartialChessPuzzleTheme` | - | Optional theme configuration |
| `children` | `ReactNode` | - | Child components |

#### Puzzle Object

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fen` | `string` | - | Initial position in FEN notation |
| `moves` | `string[]` | - | Solution moves in algebraic or UCI notation |
| `makeFirstMove` | `boolean` | `false` | Whether to auto-play the first move |

#### Example

```tsx
<ChessPuzzle.Root
  puzzle={{
    fen: "4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
    moves: ["Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"],
    makeFirstMove: false,
  }}
  onSolve={(ctx) => console.log("Solved!", ctx.movesPlayed)}
  onFail={(ctx) => console.log("Failed at move", ctx.movesPlayed)}
>
  <ChessPuzzle.Board />
</ChessPuzzle.Root>
```

### ChessPuzzle.Board

Renders the chess board. Delegates to `ChessGame.Board` under the hood.

#### Props

| Name | Type | Description |
|------|------|-------------|
| `options` | `ChessboardOptions` | Options forwarded to `react-chessboard` v5 |

#### Example

```tsx
<ChessPuzzle.Root puzzle={puzzle}>
  <ChessPuzzle.Board
    options={{
      showNotation: true,
      animationDurationInMs: 200,
    }}
  />
</ChessPuzzle.Root>
```

### ChessPuzzle.Reset

A button component that resets the current puzzle or loads a new one.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `puzzle` | `Puzzle` | - | New puzzle to load (resets current if not provided) |
| `onReset` | `(ctx: ChessPuzzleContextType) => void` | - | Callback after reset |
| `showOn` | `Status[]` | `["failed", "solved"]` | States in which the button is visible |
| `asChild` | `boolean` | `false` | Render as child element (slot pattern) |

**Status values:** `"not-started"`, `"in-progress"`, `"solved"`, `"failed"`

#### Example

```tsx
<ChessPuzzle.Root puzzle={puzzle}>
  <ChessPuzzle.Board />
  <ChessPuzzle.Reset>Try Again</ChessPuzzle.Reset>
  <ChessPuzzle.Reset puzzle={nextPuzzle}>Next Puzzle</ChessPuzzle.Reset>
</ChessPuzzle.Root>
```

### ChessPuzzle.Hint

A button that highlights the next correct move on the board.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `showOn` | `Status[]` | `["not-started", "in-progress"]` | States in which the button is visible |
| `asChild` | `boolean` | `false` | Render as child element (slot pattern) |

#### Example

```tsx
const puzzle = {
  fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
  moves: ["d2d4", "e5d4", "f3d4"],
  makeFirstMove: false,
};

<ChessPuzzle.Root puzzle={puzzle}>
  <ChessPuzzle.Board />
  <ChessPuzzle.Hint>
    Show Hint
  </ChessPuzzle.Hint>
</ChessPuzzle.Root>
```

## Hooks

### useChessPuzzleContext

Access the puzzle state and methods from any child component.

```tsx
import { useChessPuzzleContext } from "@react-chess-tools/react-chess-puzzle";

function PuzzleStatus() {
  const { puzzleState, movesPlayed, totalMoves, resetPuzzle, onHint } =
    useChessPuzzleContext();

  return (
    <div>
      <p>Status: {puzzleState}</p>
      <p>
        Progress: {movesPlayed}/{totalMoves} moves
      </p>
      <button onClick={resetPuzzle}>Reset</button>
      <button onClick={onHint}>Hint</button>
    </div>
  );
}
```

#### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `status` | `Status` | Current puzzle state |
| `puzzleState` | `Status` | Alias for `status` |
| `movesPlayed` | `number` | Number of correct moves made |
| `totalMoves` | `number` | Total moves in the solution |
| `puzzle` | `Puzzle` | The current puzzle object |
| `hint` | `Hint` | Current hint state |
| `nextMove` | `string \| null` | The next correct move |
| `isPlayerTurn` | `boolean` | Whether it's the player's turn to move |
| `changePuzzle` | `(puzzle: Puzzle) => void` | Load a new puzzle |
| `resetPuzzle` | `() => void` | Reset the current puzzle |
| `onHint` | `() => void` | Show hint for next move |

### useChessGameContext

Since `react-chess-puzzle` is built on `react-chess-game`, you can also access the underlying game context.

```tsx
import { useChessGameContext } from "@react-chess-tools/react-chess-game";

function BoardInfo() {
  const { currentFen, info, methods } = useChessGameContext();

  return (
    <div>
      <p>Turn: {info.turn === "w" ? "White" : "Black"}</p>
      <button onClick={() => methods.flipBoard()}>Flip Board</button>
    </div>
  );
}
```

## Integration with react-chess-game

Since `react-chess-puzzle` is built on `react-chess-game`, you can use any of its components:

### Adding Sound Effects

```tsx
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";

function PuzzleWithSounds() {
  const puzzle = {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["d2d4", "e5d4", "f3d4"],
  };

  return (
    <ChessPuzzle.Root puzzle={puzzle}>
      <ChessGame.Sounds />
      <ChessPuzzle.Board />
    </ChessPuzzle.Root>
  );
}
```

### Adding Keyboard Controls

```tsx
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";

function PuzzleWithKeyboard() {
  const puzzle = {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["d2d4", "e5d4", "f3d4"],
  };

  return (
    <ChessPuzzle.Root puzzle={puzzle}>
      <ChessGame.KeyboardControls />
      <ChessPuzzle.Board />
    </ChessPuzzle.Root>
  );
}
```

## Examples

### Basic Puzzle

```tsx
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";

function BasicPuzzle() {
  const puzzle = {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["d2d4", "e5d4", "f3d4"],
    makeFirstMove: false,
  };

  return (
    <ChessPuzzle.Root puzzle={puzzle}>
      <ChessPuzzle.Board />
      <ChessPuzzle.Reset>Restart</ChessPuzzle.Reset>
      <ChessPuzzle.Hint>Hint</ChessPuzzle.Hint>
    </ChessPuzzle.Root>
  );
}
```

### Puzzle with Callbacks

```tsx
import { ChessPuzzle, type ChessPuzzleContextType } from "@react-chess-tools/react-chess-puzzle";
import { useState } from "react";

function PuzzleWithScore() {
  const [score, setScore] = useState(0);

  const handleSolve = (ctx: ChessPuzzleContextType) => {
    setScore((prev) => prev + 10);
    console.log(`Solved in ${ctx.movesPlayed} moves!`);
  };

  const handleFail = (ctx: ChessPuzzleContextType) => {
    setScore((prev) => Math.max(0, prev - 5));
    console.log("Incorrect move!");
  };

  return (
    <div>
      <p>Score: {score}</p>
      <ChessPuzzle.Root puzzle={puzzle} onSolve={handleSolve} onFail={handleFail}>
        <ChessPuzzle.Board />
        <ChessPuzzle.Reset>Try Again</ChessPuzzle.Reset>
      </ChessPuzzle.Root>
    </div>
  );
}
```

### Puzzle Trainer with Multiple Puzzles

```tsx
import { ChessPuzzle, type ChessPuzzleContextType } from "@react-chess-tools/react-chess-puzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { useState } from "react";

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

function PuzzleTrainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  const nextPuzzle = () => {
    setCurrentIndex((prev) => (prev + 1) % puzzles.length);
  };

  const handleSolve = (ctx: ChessPuzzleContextType) => {
    setScore((prev) => prev + 10);
    nextPuzzle();
  };

  const handleFail = () => {
    setScore((prev) => Math.max(0, prev - 5));
    nextPuzzle();
  };

  return (
    <div className="puzzle-trainer">
      <div className="score">Score: {score}</div>

      <ChessPuzzle.Root
        puzzle={puzzles[currentIndex]}
        onSolve={handleSolve}
        onFail={handleFail}
      >
        <ChessGame.Sounds />
        <ChessGame.KeyboardControls />

        <ChessPuzzle.Board />

        <div className="controls">
          <ChessPuzzle.Reset>Restart</ChessPuzzle.Reset>
          <ChessPuzzle.Hint>Hint</ChessPuzzle.Hint>
          <ChessPuzzle.Reset puzzle={puzzles[(currentIndex + 1) % puzzles.length]}>
            Skip
          </ChessPuzzle.Reset>
        </div>
      </ChessPuzzle.Root>
    </div>
  );
}
```

### Custom Status Display

```tsx
import { ChessPuzzle, useChessPuzzleContext } from "@react-chess-tools/react-chess-puzzle";

function PuzzleStatusDisplay() {
  const { puzzleState, movesPlayed, totalMoves } = useChessPuzzleContext();

  const messages = {
    "not-started": "Make your move to start",
    "in-progress": `Progress: ${movesPlayed}/${totalMoves} moves`,
    solved: "Puzzle solved! Well done!",
    failed: "Incorrect move. Try again!",
  };

  return <div className={`status ${puzzleState}`}>{messages[puzzleState]}</div>;
}

function ResetLabel() {
  const { puzzleState } = useChessPuzzleContext();
  return puzzleState === "solved" ? "Next Puzzle" : "Try Again";
}

function PuzzleWithStatus() {
  const puzzle = {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["d2d4", "e5d4", "f3d4"],
  };

  return (
    <ChessPuzzle.Root puzzle={puzzle}>
      <PuzzleStatusDisplay />
      <ChessPuzzle.Board />
      <ChessPuzzle.Reset showOn={["solved", "failed"]}>
        <ResetLabel />
      </ChessPuzzle.Reset>
    </ChessPuzzle.Root>
  );
}
```

## License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.

## Show Your Support

Give a star if this project helped you!
