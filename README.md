<div align="center">
  <h1>react-chess-tools</h1>
  <p>A set of React components for building chess apps</p>

[![npm version](https://img.shields.io/npm/v/@react-chess-tools/react-chess-game.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-game)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

</div>

## Overview

**react-chess-tools** is a monorepo containing React components for building chess applications. Built on top of React 19, [react-chessboard](https://github.com/Clariity/react-chessboard) v5, and [chess.js](https://github.com/jhlywa/chess.js), it provides ready-to-use, customizable components with sensible defaults.

## Packages

| Package                                                                              | Description                                                                  | Version                                                                                                                                                     |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [@react-chess-tools/react-chess-game](packages/react-chess-game/README.md)           | A chess game component with sounds, move highlighting, and keyboard controls | [![npm](https://img.shields.io/npm/v/@react-chess-tools/react-chess-game.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-game)           |
| [@react-chess-tools/react-chess-puzzle](packages/react-chess-puzzle/README.md)       | A chess puzzle component for creating interactive puzzle experiences         | [![npm](https://img.shields.io/npm/v/@react-chess-tools/react-chess-puzzle.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-puzzle)       |
| [@react-chess-tools/react-chess-clock](packages/react-chess-clock/README.md)         | A standalone chess clock component with multiple timing methods              | [![npm](https://img.shields.io/npm/v/@react-chess-tools/react-chess-clock.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-clock)         |
| [@react-chess-tools/react-chess-stockfish](packages/react-chess-stockfish/README.md) | Stockfish engine integration with evaluation bar and PV lines                | [![npm](https://img.shields.io/npm/v/@react-chess-tools/react-chess-stockfish.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-stockfish) |

## Features

- **Easy to Use** - Simple API with sensible defaults, get started in minutes
- **Composition Pattern** - Compound component pattern (similar to Radix UI) for maximum flexibility
- **asChild Support** - Render components as custom elements using the Slot pattern
- **Ref Forwarding** - Programmatic access to component DOM nodes
- **Full HTML Attribute Support** - Apply className, style, id, data-_, and aria-_ attributes
- **Full-Featured** - Built-in sounds, move highlighting, keyboard controls, and more
- **TypeScript** - Full TypeScript support with comprehensive type definitions
- **Modern React** - Built for React 19 with hooks and context API

## Quick Start

### Chess Game

```bash
npm install @react-chess-tools/react-chess-game
```

```tsx
import { ChessGame } from "@react-chess-tools/react-chess-game";

function App() {
  return (
    <ChessGame.Root>
      <ChessGame.Board />
      <ChessGame.Sounds />
      <ChessGame.KeyboardControls />
    </ChessGame.Root>
  );
}
```

### Chess Puzzle

```bash
npm install @react-chess-tools/react-chess-puzzle
```

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

### Chess Clock

```bash
npm install @react-chess-tools/react-chess-clock
```

```tsx
import { ChessClock } from "@react-chess-tools/react-chess-clock";

function App() {
  return (
    <ChessClock.Root timeControl={{ time: "5+3" }}>
      <ChessClock.Display color="white" />
      <ChessClock.Display color="black" />
      <ChessClock.PlayPause />
      <ChessClock.Reset>Reset</ChessClock.Reset>
    </ChessClock.Root>
  );
}
```

### Chess Stockfish

```bash
npm install @react-chess-tools/react-chess-stockfish
```

```tsx
import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";

function App() {
  return (
    <ChessStockfish.Root
      fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      workerOptions={{ workerPath: "/stockfish.js" }}
    >
      <ChessStockfish.EvaluationBar showEvaluation />
      <ChessStockfish.EngineLines maxLines={3} />
    </ChessStockfish.Root>
  );
}
```

## Demo

Visit the [live demo](https://react-chess-tools.vercel.app/) to see the components in action.

## Development

This project uses npm workspaces. To get started:

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run Storybook for development
npm run storybook

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.

## Show Your Support

Give a star if this project helped you!
