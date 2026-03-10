<div align="center">
  <h1>@react-chess-tools/react-chess-bot</h1>
  <p>Logical CPU players for <code>react-chess-game</code> powered by UCI engines in Web Workers</p>

[![npm version](https://img.shields.io/npm/v/@react-chess-tools/react-chess-bot.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-bot)
[![npm downloads](https://img.shields.io/npm/dm/@react-chess-tools/react-chess-bot.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

  <p>
    Built to compose directly with
    <a href="https://www.npmjs.com/package/@react-chess-tools/react-chess-game">@react-chess-tools/react-chess-game</a>
    and
    <a href="https://www.npmjs.com/package/@react-chess-tools/react-chess-stockfish">@react-chess-tools/react-chess-stockfish</a>
  </p>
</div>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Engine Setup](#engine-setup)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [ChessBot.Player](#chessbotplayer)
  - [Bot Levels](#bot-levels)
  - [BotStrength](#botstrength)
  - [BotVariability](#botvariability)
  - [BotTiming](#bottiming)
- [Examples](#examples)
- [Storybook](#storybook)
- [License](#license)

## Overview

`@react-chess-tools/react-chess-bot` adds CPU players to `ChessGame.Root` without introducing a second game provider or any required UI.

Each `ChessBot.Player`:

- watches the current position through `useChessGameContext()`
- runs a worker-backed UCI search
- chooses a move
- applies it through `methods.makeMove()`

The package is logic-only by design. It does not render controls, panels, or bot cards for you.

## Features

- **Composable** - Mount one or two bots inside an existing `ChessGame.Root`
- **Level Presets** - Lichess-style levels `1-8` via `BOT_LEVELS`
- **Advanced Tuning** - Override the preset with custom engine settings
- **Move Variability** - Use `MultiPV` to avoid fully deterministic play
- **Move Delay** - Add fixed or randomized delay before the move is applied
- **Lifecycle Callbacks** - Observe readiness, thinking, selected moves, played moves, and errors
- **Engine Flexibility** - Works with both `stockfish` and `fairy-stockfish`
- **History Safe** - Automatically stops in non-live positions and discards stale analysis

## Installation

```bash
npm install @react-chess-tools/react-chess-game @react-chess-tools/react-chess-bot
```

If you want analysis widgets as well, install `@react-chess-tools/react-chess-stockfish` separately.

## Engine Setup

This package does not bundle an engine worker. You must provide a Stockfish-compatible worker path through `workerOptions.workerPath`.

Common setups:

- Use classic Stockfish for levels `4-8`
- Use Fairy-Stockfish for levels `1-3`
- Use Fairy-Stockfish for every level if you want one worker family across all presets

Minimal worker configuration:

```tsx
workerOptions={{
  workerPath: "/stockfish.js",
  engineType: "stockfish",
}}
```

Low levels `1-3` rely on negative `skillLevel` presets, so `engineType: "stockfish"` will throw an explicit runtime error for those levels. Use `engineType: "fairy-stockfish"` instead.

For worker setup details, see the [`@react-chess-tools/react-chess-stockfish` README](../react-chess-stockfish/README.md).

## Quick Start

```tsx
import { ChessBot } from "@react-chess-tools/react-chess-bot";
import { ChessGame } from "@react-chess-tools/react-chess-game";

function App() {
  return (
    <ChessGame.Root fen="r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3">
      <ChessGame.Board />
      <ChessGame.KeyboardControls />
      <ChessBot.Player
        color="b"
        strength={{ level: 6 }}
        variability="medium"
        moveDelay={{ min: 250, max: 600 }}
        workerOptions={{ workerPath: "/stockfish.js" }}
      />
    </ChessGame.Root>
  );
}
```

## API Reference

### ChessBot.Player

`ChessBot.Player` is a logic-only component that returns `null`.

It must be rendered inside `ChessGame.Root`.

#### Props

| Name             | Type                   | Default        | Description                                        |
| ---------------- | ---------------------- | -------------- | -------------------------------------------------- |
| `color`          | `"w" \| "b"`           | -              | Side controlled by the bot                         |
| `workerOptions`  | `WorkerOptions`        | -              | Worker path and engine selection                   |
| `strength`       | `BotStrength`          | `{ level: 4 }` | Preset level or custom engine parameters           |
| `variability`    | `BotVariability`       | `"none"`       | Candidate-move selection strategy                  |
| `moveDelay`      | `BotTiming`            | `0`            | Delay before the chosen move is applied            |
| `paused`         | `boolean`              | `false`        | Stops the bot without unmounting it                |
| `autoPlay`       | `boolean`              | `true`         | Lets the bot think and apply moves automatically   |
| `onStateChange`  | `(state) => void`      | -              | Called whenever bot state changes                  |
| `onThinkStart`   | `(fen, color) => void` | -              | Called when analysis begins                        |
| `onMoveSelected` | `(move) => void`       | -              | Called when a move is chosen, before delay elapses |
| `onMove`         | `(move) => void`       | -              | Called after the move is successfully applied      |
| `onError`        | `(error) => void`      | -              | Called when the bot enters the `error` state       |

#### BotStateSnapshot

`onStateChange` receives:

```ts
type BotStateSnapshot = {
  color: "w" | "b";
  status:
    | "initializing"
    | "idle"
    | "thinking"
    | "delaying"
    | "paused"
    | "error";
  isThinking: boolean;
  isReady: boolean;
  currentFen: string;
  lastMove: BotMove | null;
  error: Error | null;
};
```

### Bot Levels

The package exports `BOT_LEVELS` with the resolved preset data.

| Level | Approx. Elo | Skill | Move Time | Max Depth | Recommended Engine |
| ----- | ----------- | ----- | --------- | --------- | ------------------ |
| `1`   | `800`       | `-9`  | `50ms`    | `5`       | `fairy-stockfish`  |
| `2`   | `1100`      | `-5`  | `100ms`   | `5`       | `fairy-stockfish`  |
| `3`   | `1400`      | `-1`  | `150ms`   | `5`       | `fairy-stockfish`  |
| `4`   | `1700`      | `3`   | `200ms`   | `5`       | `stockfish`        |
| `5`   | `2000`      | `7`   | `300ms`   | `5`       | `stockfish`        |
| `6`   | `2300`      | `11`  | `400ms`   | `8`       | `stockfish`        |
| `7`   | `2700`      | `16`  | `500ms`   | `13`      | `stockfish`        |
| `8`   | `3000`      | `20`  | `1000ms`  | `22`      | `stockfish`        |

### BotStrength

Use a preset level:

```tsx
<ChessBot.Player color="b" strength={{ level: 5 }} workerOptions={...} />
```

Or override the engine parameters directly:

```tsx
<ChessBot.Player
  color="b"
  strength={{
    custom: {
      skillLevel: 8,
      limitStrength: true,
      elo: 1900,
      moveTimeMs: 350,
      depth: 10,
    },
  }}
  workerOptions={{ workerPath: "/stockfish.js" }}
/>
```

Notes:

- `moveTimeMs` takes precedence when both `moveTimeMs` and `depth` are provided
- if custom strength omits both `moveTimeMs` and `depth`, the package falls back to the default bot move time

### BotVariability

Presets:

- `"none"`: strongest move only
- `"low"`: `MultiPV 2`, small threshold
- `"medium"`: `MultiPV 3`, weighted selection
- `"high"`: `MultiPV 5`, wider threshold and more randomness

Custom configuration:

```tsx
variability={{
  multiPV: 4,
  thresholdCp: 35,
  selection: "weighted",
  temperature: 25,
}}
```

### BotTiming

Use a fixed delay:

```tsx
moveDelay={400}
```

Or a randomized delay range:

```tsx
moveDelay={{ min: 200, max: 700 }}
```

## Examples

Human vs bot:

```tsx
<ChessGame.Root fen="r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3">
  <ChessGame.Board />
  <ChessBot.Player
    color="b"
    strength={{ level: 6 }}
    variability="medium"
    workerOptions={{ workerPath: "/stockfish.js" }}
  />
</ChessGame.Root>
```

Bot vs bot:

```tsx
<ChessGame.Root>
  <ChessGame.Board />
  <ChessBot.Player
    color="w"
    strength={{ level: 4 }}
    moveDelay={150}
    workerOptions={{ workerPath: "/stockfish.js" }}
  />
  <ChessBot.Player
    color="b"
    strength={{ level: 4 }}
    moveDelay={150}
    workerOptions={{ workerPath: "/stockfish.js" }}
  />
</ChessGame.Root>
```

Low-level bot with Fairy-Stockfish:

```tsx
<ChessGame.Root fen="rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2">
  <ChessGame.Board />
  <ChessBot.Player
    color="b"
    strength={{ level: 2 }}
    variability="high"
    workerOptions={{
      workerPath: "/fairy-stockfish/worker.js",
      engineType: "fairy-stockfish",
    }}
  />
</ChessGame.Root>
```

## Storybook

Interactive examples are available in the project Storybook:

- human vs bot
- Fairy-Stockfish low-level presets
- bot vs bot autoplay

Live demo: [react-chess-tools.vercel.app](https://react-chess-tools.vercel.app/)

## License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.
