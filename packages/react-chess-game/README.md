<div align="center">
  <h1>@react-chess-tools/react-chess-game</h1>
  <p>An easy-customizable, ready-to-use chess game component for React</p>

[![npm version](https://img.shields.io/npm/v/@react-chess-tools/react-chess-game.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-game)
[![npm downloads](https://img.shields.io/npm/dm/@react-chess-tools/react-chess-game.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-game)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

  <p>
    <a href="https://github.com/Clariity/react-chessboard">react-chessboard</a> +
    <a href="https://github.com/jhlywa/chess.js">chess.js</a> + nice defaults
  </p>
</div>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Demo](#demo)
- [API Reference](#api-reference)
  - [ChessGame.Root](#chessgameroot)
  - [ChessGame.Board](#chessgameboard)
  - [ChessGame.Sounds](#chessgamesounds)
  - [ChessGame.KeyboardControls](#chessgamekeyboardcontrols)
- [Hooks](#hooks)
  - [useChessGameContext](#usechessgamecontext)
- [Examples](#examples)
- [License](#license)

## Overview

`@react-chess-tools/react-chess-game` is a React component that bridges [chess.js](https://github.com/jhlywa/chess.js) with [react-chessboard](https://github.com/Clariity/react-chessboard) to offer a full-featured, ready-to-integrate chess board experience.

Built using a compound component pattern (similar to [Radix UI](https://www.radix-ui.com/)), it provides a `ChessGameContext` that you can use to customize and enhance the game while maintaining sensible defaults.

## Features

- **Move-by-click** - Click to select and move pieces
- **Sound effects** - Built-in sounds for moves, captures, check, and game over
- **Square highlighting** - Visual feedback for valid moves and last move
- **Keyboard controls** - Navigate through game history with arrow keys
- **Full game state** - Access to check, checkmate, stalemate, draw detection
- **TypeScript** - Full TypeScript support with comprehensive type definitions
- **Customizable** - Override any default with your own implementation

## Installation

```bash
npm install @react-chess-tools/react-chess-game
```

```bash
yarn add @react-chess-tools/react-chess-game
```

```bash
pnpm add @react-chess-tools/react-chess-game
```

## Quick Start

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

## Demo

Visit the [live demo](https://react-chess-tools.vercel.app/) to see the component in action.

## API Reference

### ChessGame.Root

The root component that provides `ChessGameContext` to all child components. It instantiates a `Chess` instance using the `fen` prop.

**Note:** This is a logic-only component (Context Provider). It does not render any DOM elements.

#### Props

| Name          | Type                    | Default           | Description                                  |
| ------------- | ----------------------- | ----------------- | -------------------------------------------- |
| `children`    | `ReactNode`             | -                 | Child components                             |
| `fen`         | `string`                | Starting position | Initial FEN string for the chess game        |
| `orientation` | `"w" \| "b"`            | `"w"`             | Board orientation (white or black at bottom) |
| `theme`       | `PartialChessGameTheme` | -                 | Optional theme configuration                 |

#### Example

```tsx
<ChessGame.Root
  fen="rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
  orientation="b"
>
  <ChessGame.Board />
</ChessGame.Root>
```

### ChessGame.Board

The main chess board component. Renders the board and pieces using `react-chessboard` v5.

Supports **ref forwarding** and all standard **HTML div attributes** (className, style, id, data-_, aria-_, etc.).

#### Props

| Name        | Type                             | Description                                                               |
| ----------- | -------------------------------- | ------------------------------------------------------------------------- |
| `options`   | `ChessboardOptions`              | Options forwarded to `react-chessboard`. Your values merge with defaults. |
| `ref`       | `Ref<HTMLDivElement>`            | Forwarded ref to the wrapper div element                                  |
| `className` | `string`                         | Custom CSS class names                                                    |
| `style`     | `CSSProperties`                  | Custom inline styles                                                      |
| `...`       | `HTMLAttributes<HTMLDivElement>` | All standard HTML div attributes                                          |

#### Example

```tsx
<ChessGame.Root>
  <ChessGame.Board
    options={{
      squareStyles: { e4: { boxShadow: "inset 0 0 0 2px #4f46e5" } },
      onPieceDrop: ({ sourceSquare, targetSquare }) => {
        console.log(`Move: ${sourceSquare} -> ${targetSquare}`);
        return true;
      },
      showNotation: true,
      animationDurationInMs: 300,
    }}
    className="my-custom-board"
    style={{ borderRadius: "8px" }}
    id="game-board"
    data-testid="chess-board"
  />
</ChessGame.Root>
```

### ChessGame.Sounds

Provides sound effects for the chess game. Uses built-in sounds by default, but custom sounds can be provided as base64-encoded strings.

**Note:** This is a logic-only component that returns `null`. It sets up audio functionality via hooks.

#### Props

| Name     | Type                             | Default | Description                                                               |
| -------- | -------------------------------- | ------- | ------------------------------------------------------------------------- |
| `sounds` | `Partial<Record<Sound, string>>` | -       | Custom sounds configuration. Keys: `move`, `capture`, `check`, `gameOver` |

#### Example

```tsx
<ChessGame.Root>
  <ChessGame.Sounds
    sounds={{
      move: customMoveSound,
      capture: customCaptureSound,
    }}
  />
  <ChessGame.Board />
</ChessGame.Root>
```

### ChessGame.KeyboardControls

Enables keyboard navigation through the game history.

**Note:** This is a logic-only component that returns `null`. It sets up keyboard event listeners via hooks.

#### Props

| Name       | Type               | Default                   | Description                                   |
| ---------- | ------------------ | ------------------------- | --------------------------------------------- |
| `controls` | `KeyboardControls` | `defaultKeyboardControls` | Object mapping key names to handler functions |

**Default Controls:**

- `ArrowLeft` - Go to previous move
- `ArrowRight` - Go to next move
- `ArrowUp` - Go to starting position
- `ArrowDown` - Go to latest move

#### Example

```tsx
<ChessGame.Root>
  <ChessGame.KeyboardControls
    controls={{
      ArrowLeft: (ctx) => ctx.methods.goToPreviousMove(),
      ArrowRight: (ctx) => ctx.methods.goToNextMove(),
      Home: (ctx) => ctx.methods.goToStart(),
      End: (ctx) => ctx.methods.goToEnd(),
    }}
  />
  <ChessGame.Board />
</ChessGame.Root>
```

## Hooks

### useChessGameContext

Access the chess game context from any child component.

```tsx
import { useChessGameContext } from "@react-chess-tools/react-chess-game";

function GameStatus() {
  const { currentFen, info, methods } = useChessGameContext();

  return (
    <div>
      <p>Turn: {info.turn === "w" ? "White" : "Black"}</p>
      {info.isCheck && <p>Check!</p>}
      {info.isCheckmate && <p>Checkmate!</p>}
      <button onClick={() => methods.flipBoard()}>Flip Board</button>
    </div>
  );
}
```

#### Return Values

| Name               | Type         | Description                         |
| ------------------ | ------------ | ----------------------------------- |
| `game`             | `Chess`      | The underlying chess.js instance    |
| `orientation`      | `"w" \| "b"` | Current board orientation           |
| `currentFen`       | `string`     | Current FEN string                  |
| `currentPosition`  | `string`     | Current position in game history    |
| `currentMoveIndex` | `number`     | Index of current move in history    |
| `isLatestMove`     | `boolean`    | Whether viewing the latest position |
| `methods`          | `Methods`    | Methods to interact with the game   |
| `info`             | `Info`       | Game state information              |

#### Methods

| Method             | Type                                             | Description                             |
| ------------------ | ------------------------------------------------ | --------------------------------------- |
| `makeMove`         | `(move: string \| MoveObject) => boolean`        | Make a move, returns true if successful |
| `setPosition`      | `(fen: string, orientation: "w" \| "b") => void` | Set a new position                      |
| `flipBoard`        | `() => void`                                     | Flip the board orientation              |
| `goToMove`         | `(moveIndex: number) => void`                    | Jump to specific move (-1 = start)      |
| `goToStart`        | `() => void`                                     | Go to starting position                 |
| `goToEnd`          | `() => void`                                     | Go to latest move                       |
| `goToPreviousMove` | `() => void`                                     | Go to previous move                     |
| `goToNextMove`     | `() => void`                                     | Go to next move                         |

#### Info Object

| Property                 | Type         | Description                           |
| ------------------------ | ------------ | ------------------------------------- |
| `turn`                   | `"w" \| "b"` | Current turn                          |
| `isPlayerTurn`           | `boolean`    | Whether it's the player's turn        |
| `isOpponentTurn`         | `boolean`    | Whether it's the opponent's turn      |
| `moveNumber`             | `number`     | Current move number                   |
| `lastMove`               | `Move`       | Last move made                        |
| `isCheck`                | `boolean`    | Whether current player is in check    |
| `isCheckmate`            | `boolean`    | Whether it's checkmate                |
| `isDraw`                 | `boolean`    | Whether the game is a draw            |
| `isDrawn`                | `boolean`    | Alias for `isDraw`                    |
| `isStalemate`            | `boolean`    | Whether it's stalemate                |
| `isThreefoldRepetition`  | `boolean`    | Whether threefold repetition occurred |
| `isInsufficientMaterial` | `boolean`    | Whether there's insufficient material |
| `isGameOver`             | `boolean`    | Whether the game has ended            |
| `hasPlayerWon`           | `boolean`    | Whether the player has won            |
| `hasPlayerLost`          | `boolean`    | Whether the player has lost           |

## Examples

### Basic Game with All Features

```tsx
import { ChessGame } from "@react-chess-tools/react-chess-game";

function FullFeaturedGame() {
  return (
    <ChessGame.Root>
      <ChessGame.Sounds />
      <ChessGame.KeyboardControls />
      <ChessGame.Board />
    </ChessGame.Root>
  );
}
```

### Custom Starting Position

```tsx
import { ChessGame } from "@react-chess-tools/react-chess-game";

function CustomPosition() {
  // Sicilian Defense starting position
  const sicilianFen =
    "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2";

  return (
    <ChessGame.Root fen={sicilianFen}>
      <ChessGame.Board />
    </ChessGame.Root>
  );
}
```

### Game with Move History Display

```tsx
import {
  ChessGame,
  useChessGameContext,
} from "@react-chess-tools/react-chess-game";

function MoveHistory() {
  const { game, currentMoveIndex, methods } = useChessGameContext();
  const history = game.history();

  return (
    <div className="move-history">
      {history.map((move, index) => (
        <button
          key={index}
          onClick={() => methods.goToMove(index)}
          className={index === currentMoveIndex ? "active" : ""}
        >
          {move}
        </button>
      ))}
    </div>
  );
}

function GameWithHistory() {
  return (
    <ChessGame.Root>
      <ChessGame.Board />
      <MoveHistory />
      <ChessGame.KeyboardControls />
    </ChessGame.Root>
  );
}
```

### Game with Status Display

```tsx
import {
  ChessGame,
  useChessGameContext,
} from "@react-chess-tools/react-chess-game";

function GameStatus() {
  const { info } = useChessGameContext();

  if (info.isCheckmate) {
    return (
      <div className="status">
        Checkmate! {info.hasPlayerWon ? "You win!" : "You lose!"}
      </div>
    );
  }
  if (info.isDraw) {
    return <div className="status">Draw!</div>;
  }
  if (info.isCheck) {
    return <div className="status">Check!</div>;
  }
  return (
    <div className="status">Turn: {info.turn === "w" ? "White" : "Black"}</div>
  );
}

function GameWithStatus() {
  return (
    <ChessGame.Root>
      <GameStatus />
      <ChessGame.Board />
      <ChessGame.Sounds />
    </ChessGame.Root>
  );
}
```

## License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.

## Show Your Support

Give a star if this project helped you!
