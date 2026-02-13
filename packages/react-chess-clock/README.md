<div align="center">
  <h1>@react-chess-tools/react-chess-clock</h1>
  <p>A standalone chess clock component for React with support for multiple timing methods and tournament controls</p>

[![npm version](https://img.shields.io/npm/v/@react-chess-tools/react-chess-clock.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-clock)
[![npm downloads](https://img.shields.io/npm/dm/@react-chess-tools/react-chess-clock.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-clock)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

</div>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Demo](#demo)
- [API Reference](#api-reference)
  - [ChessClock.Root](#chessclockroot)
  - [ChessClock.Display](#chessclockdisplay)
  - [ChessClock.Switch](#chessclockswitch)
  - [ChessClock.PlayPause](#chessclockplaypause)
  - [ChessClock.Reset](#chessclockreset)
- [Hooks](#hooks)
  - [useChessClock](#usechessclock)
  - [useChessClockContext](#usechessclockcontext)
  - [useOptionalChessClock](#useoptionalchessclock)
- [Time Control Formats](#time-control-formats)
- [Timing Methods](#timing-methods)
- [Clock Start Modes](#clock-start-modes)
- [Examples](#examples)
- [License](#license)

## Overview

`@react-chess-tools/react-chess-clock` is a React component for creating chess clocks with support for multiple timing methods (Fischer increment, simple delay, Bronstein delay), multi-period tournament controls, and various clock start modes.

Built using a compound component pattern (similar to [Radix UI](https://www.radix-ui.com/)), it provides an unstyled, fully customizable clock with sensible defaults.

## Features

- **Multiple Timing Methods** - Fischer increment, simple delay, and Bronstein delay
- **Tournament Controls** - Multi-period time controls with move counts (FIDE/USCF style)
- **Clock Start Modes** - Delayed (Lichess-style), immediate (Chess.com-style), or manual
- **Time Odds** - Support for different starting times per player
- **Flexible Time Control** - String notation (`"5+3"`), object config, or multi-period array
- **Server Sync** - Built-in methods for syncing clock state with a server
- **TypeScript** - Full TypeScript support with comprehensive type definitions
- **Unstyled** - Zero runtime CSS with data attributes for easy styling

## Styling

All components accept standard HTML attributes (`className`, `style`, `id`, `data-*`, `aria-*`), making them compatible with any CSS approach:

### Tailwind CSS

```tsx
<ChessClock.Root timeControl={{ time: "5+3" }}>
  <div className="flex flex-col gap-4">
    <div className="flex justify-between">
      <ChessClock.Display
        color="white"
        className="px-6 py-3 bg-white text-gray-900 font-mono text-2xl rounded border-2 border-gray-300"
      />
      <ChessClock.Display
        color="black"
        className="px-6 py-3 bg-gray-900 text-white font-mono text-2xl rounded border-2 border-gray-700"
      />
    </div>
    <ChessClock.PlayPause className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" />
  </div>
</ChessClock.Root>
```

### CSS Modules

```tsx
import styles from "./Clock.module.css";

<ChessClock.Display color="white" className={styles.clockDisplay} />;
```

### Data Attributes

Clock components expose data attributes for CSS selectors:

```css
[data-clock-active="true"] {
  border-color: #fbbf24;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.5);
}

[data-clock-timeout="true"] {
  background-color: #ef4444;
  animation: pulse 1s infinite;
}
```

## Installation

```bash
npm install @react-chess-tools/react-chess-clock
```

```bash
yarn add @react-chess-tools/react-chess-clock
```

```bash
pnpm add @react-chess-tools/react-chess-clock
```

## Quick Start

```tsx
import { ChessClock } from "@react-chess-tools/react-chess-clock";

function App() {
  return (
    <ChessClock.Root timeControl={{ time: "5+3" }}>
      <ChessClock.Display color="white" />
      <ChessClock.Display color="black" />
      <ChessClock.Switch>Switch</ChessClock.Switch>
      <ChessClock.PlayPause />
      <ChessClock.Reset>Reset</ChessClock.Reset>
    </ChessClock.Root>
  );
}
```

## Demo

Visit the [live demo](https://react-chess-tools.vercel.app/) to see the component in action.

## API Reference

### ChessClock.Root

The root component that provides `ChessClockContext` to all child components.

**Note:** This is a logic-only component (Context Provider). It does not render any DOM elements.

#### Props

| Name          | Type                | Default | Description                           |
| ------------- | ------------------- | ------- | ------------------------------------- |
| `timeControl` | `TimeControlConfig` | -       | Time control configuration (required) |
| `children`    | `ReactNode`         | -       | Child components                      |

#### TimeControlConfig

| Property       | Type                                                | Default     | Description                                               |
| -------------- | --------------------------------------------------- | ----------- | --------------------------------------------------------- |
| `time`         | `TimeControlInput`                                  | -           | Time specification (string, object, or array)             |
| `timingMethod` | `"fischer" \| "delay" \| "bronstein"`               | `"fischer"` | How time is added/removed after each move                 |
| `clockStart`   | `"delayed" \| "immediate" \| "manual"`              | `"delayed"` | When the clock starts running                             |
| `whiteTime`    | `number`                                            | -           | Override White's starting time in seconds (for time odds) |
| `blackTime`    | `number`                                            | -           | Override Black's starting time in seconds (for time odds) |
| `onTimeout`    | `(loser: ClockColor) => void`                       | -           | Callback when a player's time runs out                    |
| `onSwitch`     | `(activePlayer: ClockColor) => void`                | -           | Callback when active player switches                      |
| `onTimeUpdate` | `(times: { white: number; black: number }) => void` | -           | Callback on each time update                              |

#### Example

```tsx
<ChessClock.Root
  timeControl={{
    time: "5+3",
    timingMethod: "fischer",
    clockStart: "delayed",
    onTimeout: (loser) => console.log(`${loser} loses on time`),
  }}
>
  <ChessClock.Display color="white" />
  <ChessClock.Display color="black" />
</ChessClock.Root>
```

### ChessClock.Display

Displays the current time for a player. Renders an unstyled div with data attributes for styling.

Supports **ref forwarding** and all standard **HTML div attributes** (className, style, id, data-_, aria-_, etc.).

#### Props

| Name         | Type                                        | Description                                        |
| ------------ | ------------------------------------------- | -------------------------------------------------- |
| `color`      | `"white" \| "black"`                        | Player color to display (required)                 |
| `format`     | `"auto" \| "mm:ss" \| "ss.d" \| "hh:mm:ss"` | Time format (default: `"auto"`)                    |
| `formatTime` | `(milliseconds: number) => string`          | Custom time formatting function (overrides format) |
| `ref`        | `Ref<HTMLDivElement>`                       | Forwarded ref to the wrapper div element           |
| `className`  | `string`                                    | Custom CSS class names                             |
| `style`      | `CSSProperties`                             | Custom inline styles                               |
| `...`        | `HTMLAttributes<HTMLDivElement>`            | All standard HTML div attributes                   |

#### Data Attributes

| Attribute            | Value                  | Description                                      |
| -------------------- | ---------------------- | ------------------------------------------------ |
| `data-clock-color`   | `"white"` or `"black"` | Which player's time is shown                     |
| `data-clock-active`  | `"true"` or `"false"`  | Whether this player's clock is currently running |
| `data-clock-paused`  | `"true"` or `"false"`  | Whether the clock is paused                      |
| `data-clock-timeout` | `"true"` or `"false"`  | Whether this player has run out of time          |
| `data-clock-status`  | Clock status string    | Current clock status                             |

#### Example

```tsx
<ChessClock.Display
  color="white"
  format="auto"
  className="clock-display"
  style={{ fontFamily: "monospace", fontSize: "24px" }}
/>
```

### ChessClock.Switch

A button that manually switches the active player's clock.

Supports **ref forwarding**, **asChild pattern**, and all standard **HTML button attributes** (className, style, disabled, etc.).

#### Props

| Name        | Type                                      | Description                            |
| ----------- | ----------------------------------------- | -------------------------------------- |
| `asChild`   | `boolean`                                 | Render as child element (slot pattern) |
| `ref`       | `Ref<HTMLButtonElement>`                  | Forwarded ref to the button element    |
| `className` | `string`                                  | Custom CSS class names                 |
| `...`       | `ButtonHTMLAttributes<HTMLButtonElement>` | All standard HTML button attributes    |

**Note:** The button is disabled when the clock status is `"idle"` or `"finished"`.

#### Example

```tsx
<ChessClock.Switch>Switch Turn</ChessClock.Switch>
```

#### Using asChild Pattern

```tsx
<ChessClock.Switch asChild>
  <div className="custom-switch">Switch</div>
</ChessClock.Switch>
```

### ChessClock.PlayPause

A button to start, pause, and resume the clock. Content changes based on clock state.

Supports **ref forwarding**, **asChild pattern**, and all standard **HTML button attributes** (className, style, disabled, etc.).

#### Props

| Name              | Type                                      | Default                             | Description                                 |
| ----------------- | ----------------------------------------- | ----------------------------------- | ------------------------------------------- |
| `startContent`    | `ReactNode`                               | `"Start"`                           | Content shown when clock is idle            |
| `pauseContent`    | `ReactNode`                               | `"Pause"`                           | Content shown when clock is running         |
| `resumeContent`   | `ReactNode`                               | `"Resume"`                          | Content shown when clock is paused          |
| `delayedContent`  | `ReactNode`                               | `"Start"`                           | Content shown when clock is in delayed mode |
| `finishedContent` | `ReactNode`                               | `"Game Over"`                       | Content shown when clock is finished        |
| `asChild`         | `boolean`                                 | `false`                             | Render as child element (slot pattern)      |
| `ref`             | `Ref<HTMLButtonElement>`                  | Forwarded ref to the button element |
| `className`       | `string`                                  | Custom CSS class names              |
| `...`             | `ButtonHTMLAttributes<HTMLButtonElement>` | All standard HTML button attributes |

**Note:** The button is disabled when the clock status is `"finished"` or `"delayed"`.

#### Example

```tsx
<ChessClock.PlayPause
  startContent="Start Game"
  pauseContent="Pause"
  resumeContent="Resume"
  finishedContent="Game Over"
/>
```

#### Using asChild Pattern

```tsx
<ChessClock.PlayPause asChild>
  <button className="custom-play-pause">Toggle</button>
</ChessClock.PlayPause>
```

### ChessClock.Reset

A button that resets the clock. Optionally accepts a new time control.

Supports **ref forwarding**, **asChild pattern**, and all standard **HTML button attributes** (className, style, disabled, etc.).

#### Props

| Name          | Type                                      | Description                                   |
| ------------- | ----------------------------------------- | --------------------------------------------- |
| `timeControl` | `TimeControlInput`                        | New time control to apply on reset (optional) |
| `asChild`     | `boolean`                                 | Render as child element (slot pattern)        |
| `ref`         | `Ref<HTMLButtonElement>`                  | Forwarded ref to the button element           |
| `className`   | `string`                                  | Custom CSS class names                        |
| `...`         | `ButtonHTMLAttributes<HTMLButtonElement>` | All standard HTML button attributes           |

**Note:** The button is disabled when the clock status is `"idle"`.

#### Example

```tsx
// Reset with same time control
<ChessClock.Reset>Reset</ChessClock.Reset>

// Reset with new time control
<ChessClock.Reset timeControl="10+5">Change to 10+5</ChessClock.Reset>
```

#### Using asChild Pattern

```tsx
<ChessClock.Reset asChild>
  <div className="custom-reset">Reset</div>
</ChessClock.Reset>
```

## Hooks

### useChessClock

Create clock state without the Root component (for custom integrations).

```tsx
import { useChessClock } from "@react-chess-tools/react-chess-clock";

function MyClock() {
  const clock = useChessClock({
    time: "5+3",
    onTimeout: (loser) => console.log(`${loser} loses`),
  });

  return (
    <div>
      <div>White: {clock.times.white}ms</div>
      <div>Black: {clock.times.black}ms</div>
      <button onClick={clock.methods.switch}>Switch</button>
    </div>
  );
}
```

#### Return Values

| Property             | Type                                                   | Description                         |
| -------------------- | ------------------------------------------------------ | ----------------------------------- |
| `times`              | `{ white: number; black: number }`                     | Current times in milliseconds       |
| `initialTimes`       | `{ white: number; black: number }`                     | Initial times in milliseconds       |
| `status`             | `ClockStatus`                                          | Current clock status                |
| `activePlayer`       | `"white" \| "black" \| null`                           | Currently active player             |
| `timeout`            | `"white" \| "black" \| null`                           | Which player timed out              |
| `timingMethod`       | `TimingMethod`                                         | Configured timing method            |
| `info`               | `ClockInfo`                                            | Computed clock information          |
| `currentPeriodIndex` | `{ white: number; black: number }`                     | Current period index (multi-period) |
| `totalPeriods`       | `number`                                               | Total number of periods             |
| `currentPeriod`      | `{ white: TimeControlPhase; black: TimeControlPhase }` | Current periods                     |
| `periodMoves`        | `{ white: number; black: number }`                     | Moves in current period             |
| `methods`            | `ClockMethods`                                         | Methods to control the clock        |

#### Methods

| Method    | Type                                                 | Description                                        |
| --------- | ---------------------------------------------------- | -------------------------------------------------- |
| `start`   | `() => void`                                         | Start the clock                                    |
| `pause`   | `() => void`                                         | Pause the clock                                    |
| `resume`  | `() => void`                                         | Resume the clock                                   |
| `switch`  | `() => void`                                         | Switch active player                               |
| `reset`   | `(timeControl?: TimeControlInput) => void`           | Reset the clock (optionally with new time control) |
| `addTime` | `(player: ClockColor, milliseconds: number) => void` | Add time to a player                               |
| `setTime` | `(player: ClockColor, milliseconds: number) => void` | Set a player's time                                |

### useChessClockContext

Access the clock state from any child component within a `ChessClock.Root`.

```tsx
import { useChessClockContext } from "@react-chess-tools/react-chess-clock";

function ClockInfo() {
  const { times, activePlayer, status, methods } = useChessClockContext();

  return (
    <div>
      <p>Active: {activePlayer}</p>
      <p>Status: {status}</p>
      <button onClick={() => methods.pause()}>Pause</button>
    </div>
  );
}
```

### useOptionalChessClock

Safely access clock context when the component may be used outside `ChessClock.Root`.

```tsx
import { useOptionalChessClock } from "@react-chess-tools/react-chess-clock";

function MaybeInsideClock() {
  const clock = useOptionalChessClock();

  if (!clock) {
    return <div>No clock context</div>;
  }

  return <div>White time: {clock.times.white}</div>;
}
```

## Time Control Formats

### String Notation

Compact string format for simple time controls:

```tsx
// "minutes+seconds" format
timeControl={{ time: "5+3" }}   // 5 minutes, 3 second increment
timeControl={{ time: "10" }}    // 10 minutes, no increment
timeControl={{ time: "3+2" }}   // 3 minutes, 2 second increment
```

### Object Configuration

Full control over timing parameters:

```tsx
timeControl={{
  time: {
    baseTime: 300,    // Base time in seconds
    increment: 3,     // Increment in seconds (Fischer/Bronstein)
    delay: 5,         // Delay in seconds (delay/Bronstein methods)
  },
}}
```

### Multi-Period Tournament Controls

FIDE/USCF style tournament time controls with move counts:

```tsx
timeControl={{
  time: [
    { baseTime: 5400, increment: 30, moves: 40 },  // 90min + 30sec/move for 40 moves
    { baseTime: 1800, increment: 30, moves: 20 },  // 30min + 30sec/move for 20 moves
    { baseTime: 900, increment: 30 },              // 15min + 30sec/move sudden death
  ],
  clockStart: "manual",
}}
```

### Presets

Common time control presets are available:

```tsx
import { presets } from "@react-chess-tools/react-chess-clock";

timeControl={{ time: presets.blitz5_3 }}
timeControl={{ time: presets.fideClassical }}
```

Available presets:

- Bullet: `bullet1_0`, `bullet1_1`, `bullet2_1`
- Blitz: `blitz3_0`, `blitz3_2`, `blitz5_0`, `blitz5_3`
- Rapid: `rapid10_0`, `rapid10_5`, `rapid15_10`
- Classical: `classical30_0`, `classical90_30`
- Tournament: `fideClassical`, `uscfClassical`

## Timing Methods

### Fischer (Default)

Standard increment - time is added after each move completes.

```tsx
timeControl={{
  time: { baseTime: 300, increment: 3 },
  timingMethod: "fischer",
}}
```

### Simple Delay

Countdown waits for the delay period before decrementing. If you move within the delay, no time is used.

```tsx
timeControl={{
  time: { baseTime: 300, delay: 5 },
  timingMethod: "delay",
}}
```

### Bronstein Delay

Adds back the actual time used, up to the delay amount. Like delay but you always get at least the delay amount back.

```tsx
timeControl={{
  time: { baseTime: 300, delay: 3 },
  timingMethod: "bronstein",
}}
```

## Clock Start Modes

### Delayed (Default - Lichess style)

Clock doesn't start until after Black's first move.

```tsx
timeControl={{ time: "5+3", clockStart: "delayed" }}
```

Sequence: White moves → Black moves → **Clock starts for White**

### Immediate (Chess.com style)

White's clock starts immediately on the first switch.

```tsx
timeControl={{ time: "5+3", clockStart: "immediate" }}
```

### Manual

Clock starts only when user explicitly calls `start()`.

```tsx
timeControl={{ time: "5+3", clockStart: "manual" }}
```

## Examples

### Basic Clock

```tsx
import { ChessClock } from "@react-chess-tools/react-chess-clock";

function BasicClock() {
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

### Time Odds

Give one player less time:

```tsx
function TimeOddsClock() {
  return (
    <ChessClock.Root
      timeControl={{
        time: "5+3",
        whiteTime: 180, // White gets 3 minutes
        blackTime: 300, // Black gets 5 minutes
      }}
    >
      <ChessClock.Display color="white" />
      <ChessClock.Display color="black" />
      <ChessClock.PlayPause />
    </ChessClock.Root>
  );
}
```

### Tournament Control

FIDE Classical time control:

```tsx
function TournamentClock() {
  return (
    <ChessClock.Root
      timeControl={{
        time: [
          { baseTime: 5400, increment: 30, moves: 40 },
          { baseTime: 1800, increment: 30, moves: 20 },
          { baseTime: 900, increment: 30 },
        ],
        clockStart: "manual",
      }}
    >
      <ChessClock.Display color="white" />
      <ChessClock.Display color="black" />
      <ChessClock.PlayPause />
      <ChessClock.Reset>Reset</ChessClock.Reset>
    </ChessClock.Root>
  );
}
```

### Styled Clock

Using data attributes for styling:

```tsx
function StyledClock() {
  return (
    <ChessClock.Root timeControl={{ time: "5+3" }}>
      <ChessClock.Display
        color="white"
        className="clock-display"
        style={{ padding: "10px 20px", fontSize: "24px" }}
      />
      <ChessClock.Display
        color="black"
        className="clock-display"
        style={{ padding: "10px 20px", fontSize: "24px" }}
      />
      <ChessClock.PlayPause />
    </ChessClock.Root>
  );
}
```

```css
/* CSS */
.clock-display {
  font-family: monospace;
  border: 2px solid #333;
  border-radius: 4px;
}

[data-clock-color="white"] {
  background: white;
  color: black;
}

[data-clock-color="black"] {
  background: black;
  color: white;
}

[data-clock-active="true"] {
  border-color: gold;
  box-shadow: 0 0 10px gold;
}

[data-clock-timeout="true"] {
  background: red;
  color: white;
}
```

### Server Synchronization

For online play, sync clock state with server times:

```tsx
function ServerSyncedClock() {
  const { times, methods } = useChessClockContext();
  const [serverTime, setServerTime] = useState({
    white: 300000,
    black: 300000,
  });

  // Sync time from server
  useEffect(() => {
    const interval = setInterval(() => {
      // Fetch from server...
      methods.setTime("white", serverTime.white);
      methods.setTime("black", serverTime.black);
    }, 1000);
    return () => clearInterval(interval);
  }, [serverTime, methods]);

  return (
    <>
      <ChessClock.Display color="white" />
      <ChessClock.Display color="black" />
    </>
  );
}
```

### Custom Status Display

```tsx
import { useChessClockContext } from "@react-chess-tools/react-chess-clock";

function ClockStatus() {
  const { status, activePlayer, times } = useChessClockContext();

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (status === "finished") {
    return <div className="status">Game Over - Time forfeit</div>;
  }

  return (
    <div className="status">
      <p>Active: {activePlayer === "white" ? "White" : "Black"}</p>
      <p>White: {formatTime(times.white)}</p>
      <p>Black: {formatTime(times.black)}</p>
    </div>
  );
}

function ClockWithStatus() {
  return (
    <ChessClock.Root timeControl={{ time: "5+3" }}>
      <ClockStatus />
      <ChessClock.Display color="white" />
      <ChessClock.Display color="black" />
      <ChessClock.PlayPause />
      <ChessClock.Reset>Reset</ChessClock.Reset>
    </ChessClock.Root>
  );
}
```

## License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.

## Show Your Support

Give a star if this project helped you!
