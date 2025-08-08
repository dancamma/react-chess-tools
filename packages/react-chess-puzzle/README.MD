<div align="center">
    <h1>react-chess-puzzle</h1>
    A lightweight, customizable React component library for rendering and interacting with chess puzzles.
</div>

## Project Description

This project is a React-based chess puzzle component that allows users to solve chess puzzles online. It is part of the `react-chess-tools` package and is designed to be easy to use and customizable. It is built on top of `react-chess-game` component.

## Preview

Visit the [demo](https://react-chess-tools.vercel.app/) to see the `react-chess-puzzle` component in action.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Puzzle Solving Flow](#puzzle-solving-flow)
- [API Reference](#api-reference)
  - [ChessPuzzle.Root](#chesspuzzleroot)
  - [ChessPuzzle.Board](#chesspuzzleboard)
  - [ChessPuzzle.Reset](#chesspuzzlereset)
  - [ChessPuzzle.Hint](#chesspuzzlehint)
- [Hooks and Context](#hooks-and-context)
  - [useChessPuzzleContext](#usechesspuzzlecontext)
  - [useChessGameContext](#usechessgamecontext)
- [Integration with react-chess-game](#using-react-chess-game-components)
- [Complete Example](#complete-example)
- [License](#-license)

## Installation

To install the `react-chess-puzzle` package, run the following command:

```bash
$ npm install @react-chess-tools/react-chess-puzzle
```

## Quick Start

To use the `react-chess-puzzle` package, you can import the `ChessPuzzle` component and use it as follows:

```tsx
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";

const App = () => {
  const puzzle = {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    moves: ["d2d4", "e5d4", "f3d4"],
    makeFirstMove: false,
  };

  return (
    <ChessPuzzle.Root puzzle={puzzle}>
      <ChessPuzzle.Board />
      <div className="controls">
        <ChessPuzzle.Reset>Restart Puzzle</ChessPuzzle.Reset>
        <ChessPuzzle.Hint showOn={["in-progress"]}>Get Hint</ChessPuzzle.Hint>
      </div>
    </ChessPuzzle.Root>
  );
};
```

## Puzzle Solving Flow

The puzzle-solving flow follows these steps:

1. **Initial Setup**: The board is set up using the provided FEN string
2. **First Move**: If `makeFirstMove` is `true`, the component automatically makes the first move in the solution sequence
3. **User Interaction**: The user attempts to solve the puzzle by making the correct moves
4. **Feedback**: The component validates each move and provides feedback:
   - If the move is correct, the puzzle continues
   - If the move is incorrect, the puzzle is marked as failed
5. **Completion**: When all correct moves have been made, the puzzle is marked as solved

## API Reference

The `react-chess-puzzle` package provides a set of components that you can use to build your chess app. The following sections describe the components and their usage.

### ChessPuzzle.Root

The `ChessPuzzle.Root` component is the root component of the `react-chess-puzzle` package. It is used to provide the `ChessPuzzleContext` to the rest of the components. It accepts a `puzzle` prop that is used to instantiate the puzzle.

#### Props

The `ChessPuzzle.Root` component accepts the following props:

| Name        | Type                                              | Default     | Description                                                                                                          |
| ----------- | ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `puzzle`    | `Puzzle`                                          |             | The puzzle to be solved                                                                                              |
| `onSolve`   | `(puzzleContext: ChessPuzzleContextType) => void` | `undefined` | Callback function that is triggered when the puzzle is successfully solved, receives the puzzle context as parameter |
| `onFail`    | `(puzzleContext: ChessPuzzleContextType) => void` | `undefined` | Callback function that is triggered when an incorrect move is played, receives the puzzle context as parameter       |
| `children?` | `ReactNode`                                       |             | The children to be rendered                                                                                          |

The `puzzle` prop contains the following properties:

| Name            | Type       | Default | Description                                                                |
| --------------- | ---------- | ------- | -------------------------------------------------------------------------- |
| `fen`           | `string`   |         | The FEN string representing the initial position of the puzzle             |
| `moves`         | `string[]` |         | The sequence of moves (in algebraic or UCI notation) that solve the puzzle |
| `makeFirstMove` | `boolean`  | `false` | Whether the first move is part of the problem or must be played by the CPU |

### ChessPuzzle.Board

The `ChessPuzzle.Board` component renders the chess board and delegates to `ChessGame.Board` under the hood.

#### Props

It accepts the same props as `ChessGame.Board`:

| Name     | Type                | Description                                                            |
| -------- | ------------------- | ---------------------------------------------------------------------- |
| options? | `ChessboardOptions` | Forwarded to `react-chessboard` v5 via `ChessGame.Board({ options })`. |

Any other props are passed through to `ChessGame.Board` unchanged.

### ChessPuzzle.Reset

A button component that resets the current puzzle or loads a new one.

#### Props

| Name      | Type                  | Default                                              | Description                                                                                                                                                                                                   |
| --------- | --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `puzzle`  | `Puzzle \| undefined` | `undefined`                                          | The puzzle object for a new puzzle. If not provided, the current puzzle is reset.                                                                                                                             |
| `onReset` | `() => void`          | `undefined`                                          | A callback function that is called when the puzzle is reset.                                                                                                                                                  |
| `showOn`  | `Status[]`            | `["not-started", "in-progress", "solved", "failed"]` | The state(s) in which the button is shown. Valid states are: "not-started", "in-progress", "solved", "failed"                                                                                                 |
| `asChild` | `boolean`             | `false`                                              | Change the component to the HTML tag or custom component of the only child. This will merge the original component props with the props of the supplied element/component and change the underlying DOM node. |

### ChessPuzzle.Hint

A button component that provides a hint by highlighting the next move in the solution.

#### Props

| Name      | Type       | Default           | Description                                                                                                                                                                                                   |
| --------- | ---------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `showOn`  | `Status[]` | `["in-progress"]` | The state(s) in which the button is shown. Valid states are: "not-started", "in-progress", "solved", "failed"                                                                                                 |
| `asChild` | `boolean`  | `false`           | Change the component to the HTML tag or custom component of the only child. This will merge the original component props with the props of the supplied element/component and change the underlying DOM node. |

## Hooks and Context

### useChessPuzzleContext

A hook that provides access to the puzzle state and methods.

```tsx
import { useChessPuzzleContext } from "@react-chess-tools/react-chess-puzzle";

const MyComponent = () => {
  const {
    puzzleState, // "not-started" | "in-progress" | "solved" | "failed"
    resetPuzzle, // Function to reset the current puzzle
    onHint, // Function to show a hint
    movesPlayed, // Number of moves played so far
    totalMoves, // Total number of moves in the solution
  } = useChessPuzzleContext();

  return (
    <div>
      <p>Puzzle state: {puzzleState}</p>
      <p>
        Progress: {movesPlayed}/{totalMoves} moves
      </p>
      <button onClick={resetPuzzle}>Reset</button>
      <button onClick={onHint}>Show Hint</button>
    </div>
  );
};
```

### useChessGameContext

Since `react-chess-puzzle` is built on top of `react-chess-game`, you can also use the `useChessGameContext` hook to access the underlying game state and methods.

```tsx
import { useChessGameContext } from "@react-chess-tools/react-chess-game";

const MyComponent = () => {
  const { currentFen, info, methods } = useChessGameContext();

  return (
    <div>
      <p>Current FEN: {currentFen}</p>
      <p>Current turn: {info.turn === "w" ? "White" : "Black"}</p>
      <button onClick={() => methods.flipBoard()}>Flip</button>
    </div>
  );
};
```

## Using react-chess-game Components

Since `react-chess-puzzle` is built on top of `react-chess-game`, you can use any of its components within your puzzle interface:

### ChessGame.Sounds

Add sound effects for moves, captures, and other chess events.

```tsx
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";

const App = () => (
  <ChessPuzzle.Root puzzle={...}>
    <ChessGame.Sounds />
    <ChessPuzzle.Board />
  </ChessPuzzle.Root>
);
```

### ChessGame.KeyboardControls

Add keyboard navigation for accessible play.

```tsx
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";

const App = () => (
  <ChessPuzzle.Root puzzle={...}>
    <ChessGame.KeyboardControls />
    <ChessPuzzle.Board />
  </ChessPuzzle.Root>
);
```

## Complete Example

Here's a complete example of a chess puzzle component with sounds, keyboard controls, and custom styling:

```tsx
import {
  ChessPuzzle,
  type ChessPuzzleContextType,
} from "@react-chess-tools/react-chess-puzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { useState } from "react";
import "./ChessPuzzleStyles.css"; // Your custom CSS

export const PuzzleSolver = () => {
  // Example puzzles
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

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [score, setScore] = useState(0);

  const nextPuzzle = () => {
    const nextPuzzle = (currentPuzzle + 1) % puzzles.length;
    setCurrentPuzzle(nextPuzzle);
  };

  const handleSolve = (puzzleContext: ChessPuzzleContextType) => {
    setScore((prev) => prev + 10);
    console.log(`Puzzle solved in ${puzzleContext.movesPlayed} moves`);
    nextPuzzle();
  };

  const handleFail = (puzzleContext: ChessPuzzleContextType) => {
    setScore((prev) => Math.max(0, prev - 5));
    console.log(`Puzzle failed in ${puzzleContext.movesPlayed} moves`);

    nextPuzzle();
  };

  const handleReset = (puzzleContext: ChessPuzzleContextType) => {
    puzzleContext.resetPuzzle();
  };

  return (
    <div className="puzzle-container">
      <div className="score">Score: {score}</div>
      <ChessPuzzle.Root
        puzzle={puzzles[currentPuzzle]!}
        onSolve={handleSolve}
        onFail={handleFail}
      >
        <ChessGame.Sounds />
        <ChessGame.KeyboardControls />

        <div className="board-container">
          <ChessPuzzle.Board />
        </div>

        <div className="controls">
          <div className="buttons">
            <ChessPuzzle.Reset>Restart</ChessPuzzle.Reset>
            <ChessPuzzle.Hint showOn={["in-progress"]}>Hint</ChessPuzzle.Hint>
            <ChessPuzzle.Reset
              puzzle={puzzles[(currentPuzzle + 1) % puzzles.length]}
              onReset={handleReset}
            >
              Next Puzzle
            </ChessPuzzle.Reset>
          </div>
        </div>
      </ChessPuzzle.Root>
    </div>
  );
};

// Custom component using the context
const PuzzleStatus = () => {
  const { puzzleState, movesPlayed, totalMoves } = useChessPuzzleContext();

  let message = "";
  switch (puzzleState) {
    case "not-started":
      message = "Make your move to start the puzzle";
      break;
    case "in-progress":
      message = `Progress: ${movesPlayed}/${totalMoves} moves`;
      break;
    case "solved":
      message = "Puzzle solved! Well done!";
      break;
    case "failed":
      message = "Incorrect move. Try again!";
      break;
  }

  return <div className={`status ${puzzleState}`}>{message}</div>;
};
```

## 📝 License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.

## Show your support

Give a ⭐️ if this project helped you!
