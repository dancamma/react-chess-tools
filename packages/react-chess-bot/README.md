# @react-chess-tools/react-chess-bot

A React component that adds CPU opponents to chess games built with `react-chess-game`. Uses the same difficulty calibration as Lichess.org for authentic bot strength levels.

## Features

- **Lichess-Aligned Difficulty**: 8 difficulty levels matching Lichess Stockfish calibration
- **Easy Integration**: Works seamlessly with `react-chess-game`
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
      {/* Bot plays black at difficulty 5 */}
      <ChessBot.Root playAs="black" difficulty={5} workerPath="/stockfish.js">
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
      {/* Bot plays white at difficulty 7 */}
      <ChessBot.Root playAs="white" difficulty={7} workerPath="/stockfish.js">
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
      {/* White bot - difficulty 8 (strongest) */}
      <ChessBot.Root playAs="white" difficulty={8} workerPath="/stockfish.js">
        {/* Black bot - difficulty 3 */}
        <ChessBot.Root playAs="black" difficulty={3} workerPath="/stockfish.js">
          <ChessGame.Board>
            {(boardProps) => <Chessboard {...boardProps} />}
          </ChessGame.Board>
        </ChessBot.Root>
      </ChessBot.Root>
    </ChessGame.Root>
  );
}
```

## Difficulty Levels

The bot uses the same calibration as Lichess.org, combining Stockfish Skill Level, search depth, and move time:

| Level | Skill Level | Depth | Move Time | Approximate Strength |
| ----- | ----------- | ----- | --------- | -------------------- |
| 1     | -9          | 5     | 50ms      | Beginner             |
| 2     | -5          | 5     | 100ms     | ~1100 Elo            |
| 3     | -1          | 5     | 150ms     | ~1400 Elo            |
| 4     | 3           | 5     | 200ms     | ~1700 Elo            |
| 5     | 7           | 5     | 300ms     | ~2000 Elo (default)  |
| 6     | 11          | 8     | 400ms     | ~2300 Elo            |
| 7     | 16          | 13    | 500ms     | ~2600 Elo            |
| 8     | 20          | 22    | 1000ms    | ~2900 Elo (max)      |

The strength variation is achieved through Stockfish's internal Skill Level UCI option, which applies a randomized bias to move scores for weaker play.

## API Reference

### ChessBot.Root

The main provider component that enables bot play.

#### Props

| Prop                | Type                      | Default    | Description                                   |
| ------------------- | ------------------------- | ---------- | --------------------------------------------- |
| `playAs`            | `"white"` \| `"black"`    | _required_ | The color the bot plays as                    |
| `difficulty`        | `1` \| `2` \| ... \| `8`  | `5`        | Bot difficulty level (Lichess calibration)    |
| `workerPath`        | `string`                  | _required_ | Path to the Stockfish worker JS file          |
| `onBotMoveStart`    | `() => void`              | -          | Called when the bot starts thinking           |
| `onBotMoveComplete` | `(move: BotMove) => void` | -          | Called when the bot successfully makes a move |
| `onBotError`        | `(error: Error) => void`  | -          | Called when an error occurs                   |
| `children`          | `ReactNode`               | -          | React components to render                    |

### useChessBotContext

Hook to access the bot state from within a `ChessBot.Root` provider.

```tsx
import { useChessBotContext } from "@react-chess-tools/react-chess-bot";

function BotStatus() {
  const { playAs, difficulty, isThinking, lastMove, error } =
    useChessBotContext();

  return (
    <div>
      <p>Bot plays: {playAs}</p>
      <p>Difficulty: {difficulty}</p>
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
| `difficulty` | `1-8`                  | Current difficulty level              |
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
  DifficultyLevel,
  DifficultyConfig,
} from "@react-chess-tools/react-chess-bot";

// BotMove contains the move in both SAN and UCI notation
interface BotMove {
  san: string; // e.g., "e4", "Nxf7+"
  uci: string; // e.g., "e2e4", "g1f3"
}

// Difficulty configuration (Lichess calibration)
interface DifficultyConfig {
  depth: number; // Search depth limit
  skillLevel: number; // Stockfish Skill Level (-9 to 20)
  moveTime: number; // Thinking time in milliseconds
}
```

## Data Attributes

The `ChessBot.Root` component adds data attributes for CSS styling:

- `data-thinking="true|false"` - Whether the bot is currently thinking
- `data-color="white|black"` - The color the bot plays as
- `data-difficulty="1-8"` - Current difficulty level

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
        difficulty={6}
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

## License

MIT
