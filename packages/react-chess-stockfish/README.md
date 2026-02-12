<div align="center">
  <h1>@react-chess-tools/react-chess-stockfish</h1>
  <p>A React component library for integrating Stockfish chess engine analysis into your applications</p>

[![npm version](https://img.shields.io/npm/v/@react-chess-tools/react-chess-stockfish.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-stockfish)
[![npm downloads](https://img.shields.io/npm/dm/@react-chess-tools/react-chess-stockfish.svg)](https://www.npmjs.com/package/@react-chess-tools/react-chess-stockfish)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

</div>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Getting Stockfish Worker](#getting-stockfish-worker)
- [Quick Start](#quick-start)
- [Demo](#demo)
- [API Reference](#api-reference)
  - [ChessStockfish.Root](#chessstockfishroot)
  - [ChessStockfish.EvaluationBar](#chessstockfishevaluationbar)
  - [ChessStockfish.EngineLines](#chessstockfishenginelines)
- [Utility Functions](#utility-functions)
- [Hooks](#hooks)
  - [useStockfish](#usestockfish)
- [Examples](#examples)
- [License](#license)

## Overview

`@react-chess-tools/react-chess-stockfish` is a React component library for integrating the Stockfish chess engine into your applications. It provides real-time position evaluation, principal variation lines, and customizable engine configuration through a clean, unstyled component API.

## Features

- **Real-time Analysis** - Get live position evaluations from Stockfish
- **Evaluation Bar** - Unstyled component showing position advantage with customizable orientation
- **Engine Lines** - Display principal variations with move numbers
- **MultiPV Support** - Analyze multiple candidate moves simultaneously
- **Engine Control** - Configure skill level, depth, and number of lines
- **Unstyled Components** - Bring your own styles with data-attribute driven styling
- **TypeScript** - Full TypeScript support with comprehensive type definitions
- **Web Worker** - Non-blocking analysis using Web Workers
- **Security** - Built-in worker path validation to prevent XSS attacks

## Installation

```bash
npm install @react-chess-tools/react-chess-stockfish
```

```bash
yarn add @react-chess-tools/react-chess-stockfish
```

```bash
pnpm add @react-chess-tools/react-chess-stockfish
```

**Note:** You also need a Stockfish worker file. See [Getting Stockfish Worker](#getting-stockfish-worker) below.

## Getting Stockfish Worker

This package does not bundle Stockfish. You need to provide your own worker file.

### Host Your Own Copy

1. Download Stockfish.js from [the stockfish.js repository](https://github.com/nmrugg/stockfish.js)
   - **Single-threaded (recommended):** [stockfish-18-single.js](https://github.com/nmrugg/stockfish.js/releases/download/v18.0.0/stockfish-18-single.js) + [stockfish-18-single.wasm](https://github.com/nmrugg/stockfish.js/releases/download/v18.0.0/stockfish-18-single.wasm) — Works without special server configuration
   - **Multi-threaded (stronger, requires CORS):** [stockfish-18.js](https://github.com/nmrugg/stockfish.js/releases/download/v18.0.0/stockfish-18.js) + [stockfish-18.wasm](https://github.com/nmrugg/stockfish.js/releases/download/v18.0.0/stockfish-18.wasm) — Requires [COOP/COEP headers](https://web.dev/articles/cross-origin-isolation-guide) for SharedArrayBuffer
   - **Lite single-threaded (mobile):** [stockfish-18-lite-single.js](https://github.com/nmrugg/stockfish.js/releases/download/v18.0.0/stockfish-18-lite-single.js) + [stockfish-18-lite-single.wasm](https://github.com/nmrugg/stockfish.js/releases/download/v18.0.0/stockfish-18-lite-single.wasm) — Smaller download, no CORS required
   - **Lite multi-threaded (mobile, requires CORS):** [stockfish-18-lite.js](https://github.com/nmrugg/stockfish.js/releases/download/v18.0.0/stockfish-18-lite.js) + [stockfish-18-lite.wasm](https://github.com/nmrugg/stockfish.js/releases/download/v18.0.0/stockfish-18-lite.wasm)
2. Place the `.js` and `.wasm` files in your project's `public/` directory (rename them to `stockfish.js` and `stockfish.wasm` for simplicity)
3. Reference the JS file with a relative path:

```tsx
const workerPath = "/stockfish.js";
```

**Note:** Multi-threaded engines use `SharedArrayBuffer` which requires your server to send `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers. If you see `SharedArrayBuffer is not defined` errors, use the single-threaded version instead.

## Quick Start

```tsx
import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";

function App() {
  return (
    <ChessStockfish.Root
      fen="r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"
      workerOptions={{ workerPath: "/stockfish.js" }}
    >
      <ChessStockfish.EvaluationBar showEvaluation />
      <ChessStockfish.EngineLines maxLines={3} />
    </ChessStockfish.Root>
  );
}
```

## Demo

Visit the [Storybook](https://react-chess-tools.vercel.app/) to see the component in action with interactive examples.

## API Reference

### ChessStockfish.Root

The root component that manages the Stockfish worker and provides analysis context to all child components.

**Note:** This is a logic-only component (Context Provider). It does not render any DOM elements.

#### Props

| Name                 | Type                                       | Default | Description                                    |
| -------------------- | ------------------------------------------ | ------- | ---------------------------------------------- |
| `fen`                | `string`                                   | -       | Position in FEN notation to analyze (required) |
| `config`             | `StockfishConfig`                          | `{}`    | Engine configuration options                   |
| `workerOptions`      | `WorkerOptions`                            | -       | Worker configuration (required)                |
| `onEvaluationChange` | `(evaluation: Evaluation \| null) => void` | -       | Callback when evaluation changes               |
| `onDepthChange`      | `(depth: number) => void`                  | -       | Callback when search depth changes             |
| `onError`            | `(error: Error) => void`                   | -       | Callback when an error occurs                  |
| `children`           | `ReactNode`                                | -       | Child components                               |

#### StockfishConfig

| Property     | Type     | Default | Range   | Description                                     |
| ------------ | -------- | ------- | ------- | ----------------------------------------------- |
| `skillLevel` | `number` | `20`    | `0-20`  | Engine playing strength (0 = weakest, 20 = max) |
| `depth`      | `number` | -       | `1-255` | Maximum search depth                            |
| `multiPV`    | `number` | `1`     | `1-500` | Number of principal variations to calculate     |

#### WorkerOptions

| Property     | Type                     | Default | Description                                           |
| ------------ | ------------------------ | ------- | ----------------------------------------------------- |
| `workerPath` | `string`                 | -       | URL to the Stockfish worker file (required)           |
| `throttleMs` | `number`                 | `50`    | Throttle updates to prevent excessive re-renders (ms) |
| `timeout`    | `number`                 | `30000` | Timeout for initialization and analysis (ms)          |
| `onError`    | `(error: Error) => void` | -       | Callback for worker-specific errors                   |

#### Example

```tsx
<ChessStockfish.Root
  fen="rnbqkbnr/pppppppp/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  config={{ skillLevel: 20, depth: 20, multiPV: 3 }}
  workerOptions={{
    workerPath: "/stockfish.js",
    throttleMs: 50,
    timeout: 30000,
  }}
  onEvaluationChange={(eval) => console.log("Evaluation:", eval)}
  onDepthChange={(depth) => console.log("Depth:", depth)}
  onError={(error) => console.error("Engine error:", error)}
>
  <ChessStockfish.EvaluationBar />
  <ChessStockfish.EngineLines maxLines={3} />
</ChessStockfish.Root>
```

### ChessStockfish.EvaluationBar

An unstyled evaluation bar showing the relative advantage between players.

Supports **ref forwarding** and all standard **HTML div attributes** (className, style, id, data-_, aria-_, etc.).

#### Props

| Name             | Type                             | Default      | Description                                                                 |
| ---------------- | -------------------------------- | ------------ | --------------------------------------------------------------------------- |
| `orientation`    | `"vertical" \| "horizontal"`     | `"vertical"` | Direction of the bar                                                        |
| `perspective`    | `"w" \| "b"`                     | `"w"`        | Which side is at the bottom/left of the board view (affects fill direction) |
| `showEvaluation` | `boolean`                        | `false`      | Whether to display evaluation text (e.g., "+1.2")                           |
| `asChild`        | `boolean`                        | `false`      | Render as child element (slot pattern)                                      |
| `children`       | `ReactNode`                      | -            | Optional children to render inside the bar                                  |
| `ref`            | `Ref<HTMLDivElement>`            | -            | Forwarded ref to the div element                                            |
| `className`      | `string`                         | -            | Custom CSS class names                                                      |
| `...`            | `HTMLAttributes<HTMLDivElement>` | -            | All standard HTML div attributes                                            |

#### Data Attributes

The root element provides these data attributes for styling:

| Attribute                        | Value                                    | Description                                    |
| -------------------------------- | ---------------------------------------- | ---------------------------------------------- |
| `data-stockfish-orientation`     | `"vertical"` or `"horizontal"`           | Direction of the bar                           |
| `data-stockfish-perspective`     | `"w"` or `"b"`                           | Which side's perspective (affects fill origin) |
| `data-stockfish-eval`            | string                                   | Formatted evaluation (e.g., "+1.2", "#3", "–") |
| `data-stockfish-eval-type`       | `"cp"`, `"mate"`, or `"none"`            | Type of evaluation                             |
| `data-stockfish-eval-value`      | number                                   | The raw numeric evaluation value               |
| `data-stockfish-fill-percentage` | 0-100                                    | Fill percentage for CSS styling                |
| `data-stockfish-fill-origin`     | `"bottom"`, `"top"`, `"left"`, `"right"` | Where the fill originates from                 |

**Inner Elements:**

| Element              | Attribute                  | Description                                          |
| -------------------- | -------------------------- | ---------------------------------------------------- |
| Fill div             | `data-stockfish-fill`      | The fill bar element (uses CSS transform for sizing) |
| Evaluation text span | `data-stockfish-eval-text` | The evaluation text (when `showEvaluation` is true)  |

#### Example

```tsx
<ChessStockfish.Root fen={fen} workerOptions={workerOptions}>
  <ChessStockfish.EvaluationBar
    orientation="horizontal"
    perspective="w"
    showEvaluation={true}
    className="my-eval-bar"
  />
</ChessStockfish.Root>
```

#### Styling Example

```css
.evaluation-bar {
  width: 20px;
  height: 400px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

/* The fill element uses CSS transform for sizing */
[data-stockfish-fill] {
  position: absolute;
  inset: 0;
  background: #333;
  transition: transform 0.15s ease;
}

/* White advantage fills from bottom by default (perspective="w") */
.evaluation-bar[data-stockfish-perspective="w"] [data-stockfish-fill] {
  transform-origin: bottom;
}

/* Black perspective - fill comes from top */
.evaluation-bar[data-stockfish-perspective="b"] [data-stockfish-fill] {
  transform-origin: top;
  background: #333;
}

/* Evaluation text styling */
[data-stockfish-eval-text] {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: bold;
  color: #333;
}
```

### ChessStockfish.EngineLines

Displays principal variation lines from the engine analysis. Each line shows moves in standard algebraic notation with move numbers.

Supports **ref forwarding**, **asChild pattern**, and all standard **HTML div attributes** (className, style, etc.).

#### Props

| Name          | Type                                             | Default | Description                                                  |
| ------------- | ------------------------------------------------ | ------- | ------------------------------------------------------------ |
| `maxLines`    | `number`                                         | -       | Maximum number of PV lines to display (shows all if not set) |
| `onLineClick` | `(rank: number, pv: PrincipalVariation) => void` | -       | Callback when a line is clicked (rank is 1-indexed)          |
| `asChild`     | `boolean`                                        | `false` | Render as child element (slot pattern)                       |
| `children`    | `ReactNode`                                      | -       | Optional children to render                                  |
| `ref`         | `Ref<HTMLDivElement>`                            | -       | Forwarded ref to the div element                             |
| `className`   | `string`                                         | -       | Custom CSS class names                                       |
| `...`         | `HTMLAttributes<HTMLDivElement>`                 | -       | All standard HTML div attributes                             |

#### PrincipalVariation Type

```typescript
interface PrincipalVariation {
  rank: number; // Line ranking (1 = best)
  evaluation: Evaluation | null; // Line evaluation
  moves: PVMove[]; // Array of moves in the line
}

interface PVMove {
  uci: string; // UCI notation (e.g., "e2e4")
  san: string; // Standard notation (e.g., "1. e4")
}
```

#### Data Attributes

Each line element (rendered for each PV) provides these data attributes:

| Attribute        | Value  | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
| `data-pv-rank`   | number | Line ranking (1 = best line)                  |
| `data-eval`      | string | Formatted evaluation (e.g., "+1.23", "#3")    |
| `data-depth`     | number | Current search depth                          |
| `data-uci-moves` | string | Space-separated UCI moves (e.g., "e2e4 e7e5") |

**Inner Elements:**

| Element              | Attribute        | Description                                  |
| -------------------- | ---------------- | -------------------------------------------- |
| Evaluation text span | `data-eval-text` | The evaluation text for this line            |
| Moves container      | `data-moves`     | Container for all moves                      |
| Individual move span | `data-move`      | A single move element                        |
| Move span            | `data-uci`       | The UCI notation for the move (e.g., "e2e4") |

**Accessibility:** When `onLineClick` is provided, lines automatically get `role="button"` and `tabIndex={0}` for keyboard accessibility.

#### Example

```tsx
<ChessStockfish.Root
  fen={fen}
  config={{ multiPV: 3 }}
  workerOptions={workerOptions}
>
  <ChessStockfish.EngineLines
    maxLines={3}
    onLineClick={(rank, pv) => console.log(`Selected line ${rank}:`, pv)}
    className="engine-lines"
  />
</ChessStockfish.Root>
```

#### Using asChild Pattern

```tsx
<ChessStockfish.EngineLines asChild>
  <div className="custom-lines-container">
    {/* Your custom rendering logic */}
  </div>
</ChessStockfish.EngineLines>
```

#### Styling Example

```css
.engine-lines {
  font-family: monospace;
  font-size: 14px;
}

/* Style each line container */
.engine-lines > div {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Evaluation text */
[data-eval-text] {
  font-weight: bold;
  min-width: 50px;
  color: #333;
}

/* Positive evaluation = green */
[data-eval^="+"] {
  color: #27ae60;
}

/* Negative evaluation = red */
[data-eval^="-"] {
  color: #e74c3c;
}

/* Moves container */
[data-moves] {
  color: #666;
}

/* Individual move */
[data-move] {
  cursor: pointer;
}

[data-move]:hover {
  color: #333;
  text-decoration: underline;
}

/* Interactive lines (when onLineClick is provided) */
.engine-lines > div[role="button"] {
  cursor: pointer;
}

.engine-lines > div[role="button"]:hover {
  background: #f5f5f5;
}
```

## Utility Functions

The package exports several utility functions for working with evaluations:

```tsx
import {
  formatEvaluation,
  normalizeEvaluation,
  cpToWinningChances,
  validateFen,
  uciToSan,
  uciToPvMoves,
} from "@react-chess-tools/react-chess-stockfish";

// Format an evaluation for display
formatEvaluation({ type: "cp", value: 123 }); // "+1.23"
formatEvaluation({ type: "mate", value: 3 }); // "#3"
formatEvaluation(null); // "–"

// Normalize centipawns to -1..1 range
normalizeEvaluation({ type: "cp", value: 100 }); // ~0.14

// Convert centipawns to winning probability (0-1)
cpToWinningChances(100); // ~0.57

// Validate a FEN string (returns true/false)
validateFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"); // true

// Convert UCI move to SAN notation
uciToSan(fen, "e2e4"); // "e4"

// Convert UCI move string to PVMove array
uciToPvMoves(fen, ["e2e4", "e7e5", "g1f3"]);
```

## Hooks

### useStockfish

Access the Stockfish analysis state and methods from any child component.

```tsx
import { useStockfish } from "@react-chess-tools/react-chess-stockfish";

function AnalysisDisplay() {
  const {
    evaluation,
    normalizedEvaluation,
    bestLine,
    principalVariations,
    depth,
    status,
    isEngineThinking,
    hasResults,
    error,
  } = useStockfish();

  return (
    <div>
      <p>
        Evaluation: {evaluation ? formatEvaluation(evaluation) : "Analyzing..."}
      </p>
      <p>Depth: {depth}</p>
      <p>Status: {status}</p>
    </div>
  );
}
```

#### Return Values

| Property               | Type                         | Description                                                         |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------- |
| `fen`                  | `string`                     | Current position being analyzed                                     |
| `config`               | `StockfishConfig`            | Current engine configuration                                        |
| `evaluation`           | `Evaluation \| null`         | Best line evaluation (cp or mate)                                   |
| `normalizedEvaluation` | `number`                     | Evaluation normalized to -1..1 range                                |
| `bestLine`             | `PrincipalVariation \| null` | Best principal variation                                            |
| `principalVariations`  | `PrincipalVariation[]`       | All calculated PV lines                                             |
| `depth`                | `number`                     | Current search depth                                                |
| `status`               | `EngineStatus`               | Engine status ("initializing" \| "ready" \| "analyzing" \| "error") |
| `isEngineThinking`     | `boolean`                    | Whether engine is currently calculating                             |
| `hasResults`           | `boolean`                    | Whether any analysis results are available                          |
| `error`                | `Error \| null`              | Last error that occurred                                            |

## Examples

### Basic Analysis

```tsx
import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";

function BasicAnalysis() {
  return (
    <ChessStockfish.Root
      fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      workerOptions={{ workerPath: "/stockfish.js" }}
    >
      <ChessStockfish.EvaluationBar />
      <ChessStockfish.EngineLines />
    </ChessStockfish.Root>
  );
}
```

### Multi-PV Analysis

```tsx
import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";

function MultiPVAnalysis() {
  return (
    <ChessStockfish.Root
      fen="r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3"
      config={{ multiPV: 4, depth: 20 }}
      workerOptions={{ workerPath: "/stockfish.js" }}
    >
      <ChessStockfish.EvaluationBar orientation="horizontal" />
      <ChessStockfish.EngineLines maxLines={4} />
    </ChessStockfish.Root>
  );
}
```

### Analysis with Callbacks

```tsx
import {
  ChessStockfish,
  useStockfish,
} from "@react-chess-tools/react-chess-stockfish";

function AnalysisWithCallbacks() {
  const handleEvaluationChange = (evaluation) => {
    if (evaluation?.type === "mate") {
      console.log(`Mate in ${evaluation.value}!`);
    } else if (evaluation?.type === "cp") {
      console.log(`Advantage: ${evaluation.value / 100} pawns`);
    }
  };

  return (
    <ChessStockfish.Root
      fen="4kb1r/p2r1ppp/4qn2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1"
      workerOptions={{ workerPath: "/stockfish.js" }}
      onEvaluationChange={handleEvaluationChange}
    >
      <StatusDisplay />
      <ChessStockfish.EvaluationBar />
    </ChessStockfish.Root>
  );
}

function StatusDisplay() {
  const { depth, status, isEngineThinking } = useStockfish();

  return (
    <div>
      <span>Depth: {depth}</span>
      <span>Status: {status}</span>
      {isEngineThinking && <span className="thinking">Analyzing...</span>}
    </div>
  );
}
```

### Clickable Engine Lines

```tsx
import {
  ChessStockfish,
  type PrincipalVariation,
} from "@react-chess-tools/react-chess-stockfish";
import { useState } from "react";

function ClickableLines() {
  const [selectedLine, setSelectedLine] = useState<PrincipalVariation | null>(
    null,
  );

  const handleLineClick = (rank: number, pv: PrincipalVariation) => {
    setSelectedLine(pv);
    console.log(`Clicked line ${rank}`);
  };

  return (
    <div>
      <ChessStockfish.Root
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        config={{ multiPV: 3 }}
        workerOptions={{ workerPath: "/stockfish.js" }}
      >
        <ChessStockfish.EngineLines
          maxLines={3}
          onLineClick={handleLineClick}
        />
      </ChessStockfish.Root>

      {selectedLine && (
        <div className="selected-line">
          <h3>Line {selectedLine.rank}</h3>
          <p>{selectedLine.moves.map((m) => m.san).join(" ")}</p>
        </div>
      )}
    </div>
  );
}
```

### Custom Styled Evaluation Bar

```tsx
import { ChessStockfish } from "@react-chess-tools/react-chess-stockfish";

function CustomEvalBar() {
  return (
    <ChessStockfish.Root
      fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      workerOptions={{ workerPath: "/stockfish.js" }}
    >
      <ChessStockfish.EvaluationBar
        className="custom-eval-bar"
        orientation="horizontal"
        perspective="w"
        showEvaluation={true}
      />
    </ChessStockfish.Root>
  );
}
```

```css
.custom-eval-bar {
  width: 100%;
  height: 16px;
  background: #e0e0e0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.custom-eval-bar [data-stockfish-fill] {
  position: absolute;
  inset: 0;
  border-radius: 8px;
}

/* White perspective - fill from left */
.custom-eval-bar[data-stockfish-perspective="w"] [data-stockfish-fill] {
  background: linear-gradient(to right, #2ecc71, #27ae60);
  transform-origin: left;
}

/* Black perspective - fill from right */
.custom-eval-bar[data-stockfish-perspective="b"] [data-stockfish-fill] {
  background: linear-gradient(to left, #e74c3c, #c0392b);
  transform-origin: right;
}
```

## License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.

## Show Your Support

Give a star if this project helped you!
