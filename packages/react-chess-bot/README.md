# @react-chess-tools/react-chess-bot

A React component that adds CPU opponents to chess games built with `react-chess-game`. This package bridges `react-chess-stockfish` and `react-chess-game` to provide automated chess bot play.

## Features

- **Easy Integration**: Works seamlessly with `react-chess-game`
- **Configurable Difficulty**: Stockfish skill level from 0-20
- **Natural Play Feel**: Random move delay for human-like timing
- **Event Callbacks**: Hooks for bot thinking, move completion, and errors
- **CPU vs CPU**: Support for two bots playing each other
- **Accessible**: ARIA live region announcements for screen readers
- **Styling Support**: Data attributes for CSS styling hooks

## Installation

```bash
npm install @react-chess-tools/react-chess-bot
```

### Peer Dependencies

```bash
npm install react react-dom
```

### Getting Stockfish Worker

This package requires a Stockfish.js worker file. You can use the `stockfish` npm package:

```bash
npm install stockfish
```

Then copy the worker to your public directory:

```bash
cp node_modules/stockfish/src/stockfish.js public/stockfish.js
```

Or use a CDN-hosted version. See the [stockfish.js documentation](https://github.com/nmrugg/stockfish.js) for more options.

## Quick Start

### Human vs CPU

```tsx
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { ChessBot } from "@react-chess-tools/react-chess-bot";
import { Chessboard } from "react-chessboard";

function HumanVsCpu() {
  return (
    <ChessGame.Root>
      {/* Bot plays black */}
      <ChessBot.Root playAs="black" skillLevel={10} workerPath="/stockfish.js">
        <ChessGame.Board>
          {(boardProps) => <Chessboard {...boardProps} />}
        </ChessGame.Board>
      </ChessBot.Root>
    </ChessGame.Root>
  );
}
```

### Human Plays Black (Bot Plays White)

```tsx
function HumanPlaysBlack() {
  return (
    <ChessGame.Root orientation="b">
      {/* Bot plays white */}
      <ChessBot.Root playAs="white" skillLevel={15} workerPath="/stockfish.js">
        <ChessGame.Board>
          {(boardProps) => <Chessboard {...boardProps} />}
        </ChessGame.Board>
      </ChessBot.Root>
    </ChessGame.Root>
  );
}
```

### CPU vs CPU

```tsx
function CpuVsCpu() {
  return (
    <ChessGame.Root>
      {/* White bot */}
      <ChessBot.Root playAs="white" skillLevel={10} workerPath="/stockfish.js">
        {/* Black bot */}
        <ChessBot.Root
          playAs="black"
          skillLevel={15}
          workerPath="/stockfish.js"
        >
          <ChessGame.Board>
            {(boardProps) => <Chessboard {...boardProps} />}
          </ChessGame.Board>
        </ChessBot.Root>
      </ChessBot.Root>
    </ChessGame.Root>
  );
}
```

## API Reference

### ChessBot.Root

The main provider component that enables bot play.

#### Props

| Prop                | Type                      | Default    | Description                                                     |
| ------------------- | ------------------------- | ---------- | --------------------------------------------------------------- |
| `playAs`            | `"white"` \| `"black"`    | _required_ | The color the bot plays as                                      |
| `skillLevel`        | `number`                  | `10`       | Stockfish skill level (0-20). Values outside range are clamped. |
| `minDelayMs`        | `number`                  | `0`        | Minimum delay before making a move (milliseconds)               |
| `maxDelayMs`        | `number`                  | `1000`     | Maximum delay before making a move (milliseconds)               |
| `workerPath`        | `string`                  | _required_ | Path to the Stockfish worker JS file                            |
| `asChild`           | `boolean`                 | `false`    | Render as the child element for composition                     |
| `onBotMoveStart`    | `() => void`              | -          | Called when the bot starts thinking (before delay)              |
| `onBotMoveComplete` | `(move: BotMove) => void` | -          | Called when the bot successfully makes a move                   |
| `onBotError`        | `(error: Error) => void`  | -          | Called when an error occurs                                     |
| `children`          | `ReactNode`               | -          | React components to render                                      |

### useChessBotContext

Hook to access the bot state from within a `ChessBot.Root` provider.

```tsx
import { useChessBotContext } from "@react-chess-tools/react-chess-bot";

function BotStatus() {
  const { playAs, isThinking, lastMove, error } = useChessBotContext();

  return (
    <div>
      <p>Bot plays: {playAs}</p>
      <p>Thinking: {isThinking ? "Yes" : "No"}</p>
      {lastMove && <p>Last move: {lastMove.san}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

#### Returns

| Property     | Type                   | Description                           |
| ------------ | ---------------------- | ------------------------------------- |
| `playAs`     | `"white"` \| `"black"` | The color the bot plays as            |
| `isThinking` | `boolean`              | Whether the bot is currently thinking |
| `lastMove`   | `BotMove \| null`      | The last move the bot made            |
| `error`      | `Error \| null`        | Any error that occurred               |

### Types

```typescript
import type {
  PlayAsColor,
  BotMove,
  ChessBotContextValue,
  RootProps,
} from "@react-chess-tools/react-chess-bot";

// BotMove contains the move in both SAN and UCI notation
interface BotMove {
  san: string; // e.g., "e4", "Nxf7+"
  uci: string; // e.g., "e2e4", "g1f3"
}
```

## Data Attributes

The `ChessBot.Root` component adds data attributes for CSS styling:

- `data-thinking="true|false"` - Whether the bot is currently thinking
- `data-color="white|black"` - The color the bot plays as

### Example CSS

```css
/* Highlight when bot is thinking */
.chess-board[data-thinking="true"] {
  box-shadow: 0 0 10px rgba(255, 200, 0, 0.5);
}

/* Style based on bot color */
.chess-board[data-color="white"] {
  border-color: #fff;
}

.chess-board[data-color="black"] {
  border-color: #333;
}
```

## Accessibility

The bot includes ARIA live region support for screen readers. When the bot makes a move, an announcement is made: "Bot plays {move}" (e.g., "Bot plays e4").

The live region is visually hidden but accessible to assistive technology.

## Important Notes

### Duplicate Bot Instances

**Warning:** Multiple bots with the same `playAs` value are unsupported and may cause race conditions or duplicate moves. Always ensure each bot instance has a unique `playAs` value.

### CPU vs CPU

When running CPU vs CPU games, each bot has its own Stockfish engine instance. This is slightly resource-intensive but ensures correctness. Each bot will only play on their turn.

### Engine Initialization

The Stockfish engine initializes asynchronously. The bot will not make moves until the engine is ready and has produced analysis results for the current position.

## Examples

### With Event Callbacks

```tsx
function GameWithCallbacks() {
  const handleBotMoveStart = () => {
    console.log("Bot is thinking...");
  };

  const handleBotMoveComplete = (move) => {
    console.log(`Bot played: ${move.san}`);
  };

  const handleBotError = (error) => {
    console.error("Bot error:", error.message);
  };

  return (
    <ChessGame.Root>
      <ChessBot.Root
        playAs="black"
        workerPath="/stockfish.js"
        onBotMoveStart={handleBotMoveStart}
        onBotMoveComplete={handleBotMoveComplete}
        onBotError={handleBotError}
      >
        <ChessGame.Board>
          {(boardProps) => <Chessboard {...boardProps} />}
        </ChessGame.Board>
      </ChessBot.Root>
    </ChessGame.Root>
  );
}
```

### With Custom Delay

```tsx
function GameWithDelay() {
  return (
    <ChessGame.Root>
      <ChessBot.Root
        playAs="black"
        workerPath="/stockfish.js"
        minDelayMs={500} // Minimum 500ms delay
        maxDelayMs={2000} // Maximum 2 second delay
      >
        <ChessGame.Board>
          {(boardProps) => <Chessboard {...boardProps} />}
        </ChessGame.Board>
      </ChessBot.Root>
    </ChessGame.Root>
  );
}
```

## License

MIT
