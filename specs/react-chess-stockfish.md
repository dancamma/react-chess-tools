# react-chess-stockfish Technical Specification

**Package:** `@react-chess-tools/react-chess-stockfish`

Stockfish chess engine integration for React. Provides hooks and components for continuous position analysis using the Stockfish NNUE engine via Web Workers.

---

## Features

- Real-time NNUE evaluation with configurable multi-PV (default 1)
- Best move extraction from ongoing analysis
- Unstyled compound components (evaluation bar, engine lines) with data attributes
- Provider-scoped workers — each `ChessStockfish.Root` owns its own independent Stockfish worker
- Pure analysis — no game logic, works with any FEN string
- Client-only (`"use client"`) — requires Web Workers

### Configurable UCI Options

| Option       | Type   | Range | Default   |
| ------------ | ------ | ----- | --------- |
| `multiPV`    | number | 1–500 | 1         |
| `depth`      | number | 1–∞   | unlimited |
| `skillLevel` | number | 0–20  | 20        |

---

## Architecture

### Dependencies

```
react-chess-stockfish
├── chess.js          — FEN validation and UCI-to-SAN move conversion
└── @radix-ui/react-slot — asChild pattern
```

No dependency on `react-chess-game`. The `stockfish` npm package is a **devDependency only** for Storybook — its files are loaded from a CDN in development and must be self-hosted by consumers in production.

### Design Principles

1. **FEN-based** — all operations use FEN strings
2. **Provider-scoped workers** — each Root creates and owns its own Web Worker, no singletons
3. **Auto cleanup** — worker terminated on provider unmount
4. **Throttled updates** — Stockfish outputs rapidly; updates are throttled to ~10/sec with trailing-edge emission
5. **White-normalized evaluation** — all scores normalized to white's perspective (positive = white advantage)
6. **Multi-instance safe** — multiple providers analyze different positions simultaneously

### Update Throttling

Stockfish emits `info` messages at a high rate (50-100+ per second during early depths). To avoid overwhelming React, the engine uses a throttle-with-trailing-edge pattern:

```typescript
// On every info message:
if (now - lastUpdate >= THROTTLE_MS) {
  // Leading edge: emit immediately
  emitNewSnapshot();
  lastUpdate = now;
  cancelTrailingTimeout();
} else if (!trailingTimeout) {
  // Schedule trailing edge: emit latest state after throttle window
  trailingTimeout = setTimeout(
    () => {
      emitNewSnapshot();
      trailingTimeout = null;
    },
    THROTTLE_MS - (now - lastUpdate),
  );
}
```

This ensures:

- Updates are capped at ~10/second (100ms throttle)
- The final message in any burst is always emitted (trailing edge)
- No intermediate results are lost
- Simple, predictable behavior across all devices

### Data Flow

```
FEN → Root (owns worker)
  → StockfishEngine
    → Validate FEN (chess.js)
    → UCI: position fen <fen> → isready → readyok → go infinite
    → info messages stream in → normalize eval to white's perspective
    → Update mutable state → throttled emit → new immutable snapshot
    → useSyncExternalStore → context → React children
```

**On FEN change:** Increment generation counter → `stop` → wait for `bestmove` → check generation (discard if stale) → validate new FEN → `position fen` → `isready`/`readyok` → `go infinite`.

When FENs change rapidly, the generation counter ensures the engine analyzes only the latest position by discarding any results for outdated states.

---

## Types

```typescript
import { Color } from "chess.js";

/** Error thrown when an invalid FEN is provided. Recoverable — next valid FEN clears the error. */
export class InvalidFenError extends Error {
  constructor(fen: string, reason: string) {
    super(`Invalid FEN: ${reason}`);
    this.name = "InvalidFenError";
  }
  readonly fen: string;
}

/** Always normalized to white's perspective. */
export type Evaluation =
  | { type: "cp"; value: number }
  | { type: "mate"; value: number };

export interface PVMove {
  uci: string; // e.g., "e2e4"
  san: string; // e.g., "Nf3"
}

export interface PrincipalVariation {
  rank: number;
  evaluation: Evaluation | null;
  moves: PVMove[];
}

export type EngineStatus = "initializing" | "ready" | "analyzing" | "error";

export interface StockfishConfig {
  skillLevel?: number; // 0–20, clamped. Default: 20
  depth?: number; // Default: unlimited
  multiPV?: number; // 1–500, clamped. Default: 1
}

export interface AnalysisInfo {
  evaluation: Evaluation | null;
  normalizedEvaluation: number; // -1 to 1, for progress bars
  bestLine: PrincipalVariation | null;
  principalVariations: PrincipalVariation[];
  depth: number;
  status: EngineStatus;
  isEngineThinking: boolean; // convenience for status === "analyzing"
  hasResults: boolean; // distinguishes "never analyzed" from "stopped with results"
  error: Error | null;
}

export interface AnalysisMethods {
  startAnalysis: () => void;
  stopAnalysis: () => void;
  getBestMove: () => PVMove | null; // first move of best PV, null if no results yet
  setConfig: (config: Partial<StockfishConfig>) => void;
}

/**
 * Default worker path for development and Storybook.
 * Uses unpkg CDN which serves the stockfish npm package.
 * The WASM file is loaded relative to the JS file by the worker itself.
 *
 * For production, consumers should self-host these files for reliability.
 */
export const WORKER_PATH =
  "https://unpkg.com/stockfish@17.1.0/src/stockfish-17.1-lite-single-03e3232.js";

export interface WorkerOptions {
  /**
   * URL path to the Stockfish JS worker file.
   *
   * For development/Storybook, use `WORKER_PATH` from this package.
   * For production, provide a self-hosted path (see Browser & Deployment section).
   *
   * JS and WASM files must be served from the same directory.
   *
   * Validation (allowlist):
   * - Trim input, reject null bytes
   * - Parse with new URL(workerPath, window.location.origin)
   * - Allow only https: protocols (or http: for localhost)
   * - Everything else rejected (data:, javascript:, blob:, file:, etc.)
   */
  workerPath: string;
  throttleMs?: number; // Update throttle in ms. Default: 100
  timeout?: number; // Init timeout in ms. Default: 30000
  onError?: (error: Error) => void;
}
```

---

## Engine (`StockfishEngine`)

Core class instantiated per-provider. Acts as an external store for `useSyncExternalStore`.

### Key Behaviors

- **Init:** Validates workerPath → creates Worker → `uci`/`uciok` → `isready`/`readyok` → status "ready"
- **Start analysis:** Deduplicates same FEN+config → validates FEN → increments generation → stops current analysis if running → waits for `bestmove` → checks generation for staleness → sends `position fen` → applies changed config via `setoption` → `isready`/`readyok` → `go infinite` (or `go depth N`)
- **Stop analysis:** Sends `stop` (no-op if not analyzing)
- **Cleanup:** Clears throttle timeout → sends `quit` → `worker.terminate()` → clears listeners

### UCI Protocol

```
[init]  → uci → uciok → isready → readyok
[start] → stop (if analyzing) → bestmove → position fen <fen>
          → setoption (only if changed) → isready → readyok
          → go infinite (or go depth N)
[stop]  → stop → bestmove
[cleanup] → clearTimeout → quit → worker.terminate()
```

**Notes:**

- `Skill Level` UCI option name contains a space — this is correct
- `ucinewgame` is intentionally omitted to preserve the transposition table

---

## Hooks

### useStockfishAnalysis (internal, not exported)

Manages the `StockfishEngine` lifecycle inside `ChessStockfish.Root`.

```typescript
interface UseStockfishAnalysisProps {
  fen: string;
  config?: StockfishConfig;
  workerOptions: WorkerOptions;
}

// Returns { info: AnalysisInfo; methods: AnalysisMethods }
```

- Engine stored in `useRef`, destroyed on unmount
- State read via `useSyncExternalStore(engine.subscribe, engine.getSnapshot)`
- All returned methods are stable `useCallback` references

### Public Hook

```typescript
/**
 * Access Stockfish analysis state and methods.
 * Throws if used outside ChessStockfish.Root.
 *
 * Methods are stable references — components using only methods won't re-render
 * when analysis info changes.
 */
export const useStockfish = (): {
  fen: string;
  info: AnalysisInfo;
  methods: AnalysisMethods;
};
```

---

## Components

### ChessStockfish (Compound Component)

```typescript
export const ChessStockfish = { Root, EvaluationBar, EngineLines };
```

All components have `displayName` set for React DevTools.

### Root

Provider component. Creates a Stockfish worker and provides context to children.

```typescript
interface RootProps {
  fen: string; // Validated with chess.js; invalid FEN sets error in context (recoverable)
  config?: StockfishConfig; // Hoist or memoize to avoid unnecessary restarts
  workerOptions: WorkerOptions; // onError, throttleMs live here
  children: React.ReactNode;
}
```

### EvaluationBar

Unstyled evaluation bar. `React.memo(React.forwardRef(...))`.

```typescript
interface EvaluationBarProps {
  orientation?: "vertical" | "horizontal";
  showEvaluation?: boolean;
  range?: number; // Centipawn clamp range. Default: 1000
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}
```

**Rendered HTML:**

```html
<div
  data-stockfish-orientation="vertical"
  data-stockfish-eval="+1.23"
  data-stockfish-eval-type="cp"
  data-stockfish-eval-value="123"
  data-stockfish-fill-percentage="62"
>
  <div data-stockfish-fill style="height: 62%"></div>
  <span data-stockfish-eval-text>+1.23</span>
  <!-- only when showEvaluation -->
</div>
```

Fill grows from bottom (vertical) or left (horizontal) for white advantage. No colors or styles applied — consumers style via data attributes.

### EngineLines

Unstyled engine lines display. `React.memo(React.forwardRef(...))`.

```typescript
interface EngineLinesProps {
  maxLines?: number;
  showMoveNumbers?: boolean; // Default: true
  onLineClick?: (rank: number, pv: PrincipalVariation) => void;
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}
```

**Rendered HTML:**

```html
<div>
  <div
    data-stockfish-pv-rank="1"
    data-stockfish-eval="+1.23"
    data-stockfish-depth="20"
    data-stockfish-uci-moves="e2e4 e7e5 g1f3"
  >
    <span data-stockfish-move="e4" data-stockfish-move-uci="e2e4">e4</span>
    <span data-stockfish-move="e5" data-stockfish-move-uci="e7e5">e5</span>
    <span data-stockfish-move="Nf3" data-stockfish-move-uci="g1f3">Nf3</span>
  </div>
  <!-- more lines... -->
</div>
```

**Note:** Align `maxLines` with `multiPV` on Root — computing extra PVs is expensive.

---

## Utilities

```typescript
/**
 * Format evaluation for display.
 * cp: "+1.23", "-0.50", "0.00"  |  mate: "M3", "-M5"  |  null: "–"
 */
export function formatEvaluation(evaluation: Evaluation | null): string;

/**
 * Normalize evaluation to -1..1 (sigmoid-like curve).
 * Mate → ±1, null → 0.
 * @param range - Centipawn clamp range (default: 1000)
 */
export function normalizeEvaluation(
  evaluation: Evaluation | null,
  range?: number,
): number;
```

Both are also exported from `@react-chess-tools/react-chess-stockfish/utils`.

---

## Error Handling

### Error status is permanent

Once a worker crashes or fails to initialize, the `StockfishEngine` cannot recover. To retry, remount the `ChessStockfish.Root` provider (use a `key` prop).

### Error scenarios

| Scenario                            | Handling                                                                                                                                      |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Worker init failure**             | Status "error", `onError` called. Permanent — requires remount with `key` to retry.                                                           |
| **Init timeout**                    | `init()` rejects after `timeout` ms, status "error". Permanent — requires remount with `key` to retry.                                        |
| **Worker crash** (`worker.onerror`) | Status "error", `isAnalyzing` false, snapshot updated, `onError` called. Permanent.                                                           |
| **Invalid FEN**                     | Status "ready" (not "error"), `isAnalyzing: false`, `error: InvalidFenError`. Recoverable — next valid FEN clears error and resumes analysis. |
| **Invalid workerPath**              | Throws during `init()`, status "error" (configuration error). Permanent.                                                                      |

---

## Browser & Deployment

### Requirements

| Feature           | Requirement                                          |
| ----------------- | ---------------------------------------------------- |
| Web Workers       | Required — no fallback                               |
| WebAssembly       | Required for NNUE builds (ASM.JS fallback available) |
| SharedArrayBuffer | Multi-threaded builds only                           |

### Worker/WASM Asset Serving

#### For Development and Storybook

Use the default CDN path provided by this package:

```typescript
import { WORKER_PATH } from "@react-chess-tools/react-chess-stockfish";

<ChessStockfish.Root
  fen={fen}
  workerOptions={{ workerPath: WORKER_PATH }}
>
```

This loads Stockfish from unpkg, a free Cloudflare-powered CDN that serves npm packages. No setup required.

#### For Production

**Consumers must self-host the Stockfish files** for production deployments. Relying on a CDN for a core engine feature is not recommended due to:

- **Reliability** — CDN outages or rate limits could break your app
- **CORS control** — self-hosting gives you control over cross-origin policies
- **CSP compliance** — some security policies block external workers
- **Version pinning** — ensures the exact version you tested against

**Step 1: Copy files from the stockfish package**

```bash
# After npm install, copy the files to your public directory
cp node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js public/stockfish/
cp node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.wasm public/stockfish/
```

**Step 2: Configure your app to serve the files**

Both files must be in the same directory — the JS worker fetches its WASM sibling by relative URL.

**Step 3: Use the self-hosted path**

```typescript
<ChessStockfish.Root
  fen={fen}
  workerOptions={{ workerPath: "/stockfish/stockfish-17.1-lite-single-03e3232.js" }}
>
```

#### Available Stockfish Builds

The stockfish npm package includes multiple builds. File names include content hashes (e.g., `03e3232`) that change between versions.

| Build                   | Size  | Threading | File Pattern                           |
| ----------------------- | ----- | --------- | -------------------------------------- |
| Lite NNUE Single (rec.) | ~7MB  | Single    | `stockfish-17.1-lite-single-*.js/wasm` |
| Lite NNUE Multi         | ~7MB  | Multi     | `stockfish-17.1-lite-*.js/wasm`        |
| Full NNUE Single        | ~75MB | Single    | `stockfish-17.1-single-*.js/wasm`      |
| Full NNUE Multi         | ~75MB | Multi     | `stockfish-17.1-*.js/wasm`             |

The "Lite" builds are recommended for web use. Multi-threaded builds require COOP/COEP headers for SharedArrayBuffer.

To see the exact file names for the installed version:

```bash
ls node_modules/stockfish/src/
```

### Content Security Policy

If using a CSP, ensure these directives are set:

```
worker-src 'self' https://unpkg.com;
script-src 'wasm-unsafe-eval';
connect-src 'self';
```

For production with self-hosted files, remove `https://unpkg.com` from `worker-src`.

---

## Package Structure

```
packages/react-chess-stockfish/
├── src/
│   ├── index.ts                    # Public exports ("use client")
│   ├── utils-entry.ts              # Utility-only exports
│   ├── components/ChessStockfish/
│   │   ├── index.ts
│   │   ├── parts/
│   │   │   ├── Root.tsx
│   │   │   ├── EvaluationBar.tsx
│   │   │   ├── EngineLines.tsx
│   │   │   └── __tests__/
│   │   └── ChessStockfish.stories.tsx
│   ├── hooks/
│   │   ├── useStockfishAnalysis.ts
│   │   ├── useStockfish.ts
│   │   └── __tests__/
│   ├── engine/
│   │   └── stockfishEngine.ts
│   └── utils/
│       ├── uci.ts                      # InvalidFenError, UCI parsing, FEN validation
│       ├── evaluation.ts
│       ├── workerPath.ts
│       └── __tests__/
├── package.json
├── tsup.config.ts
└── tsconfig.json
```

---

## Configuration

### package.json

```json
{
  "name": "@react-chess-tools/react-chess-stockfish",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils-entry.d.ts",
      "import": "./dist/utils-entry.js",
      "require": "./dist/utils-entry.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.4",
    "chess.js": "^1.4.0"
  },
  "devDependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "stockfish": "^17.1.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

### tsup.config.ts

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts", "./src/utils-entry.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["esm", "cjs"],
  external: ["react", "react-dom", "chess.js"],
  dts: true,
});
```

---

## Public API Exports

```typescript
// src/index.ts
"use client";

export { ChessStockfish } from "./components/ChessStockfish";
export { useStockfish } from "./hooks/useStockfish";
export { formatEvaluation, normalizeEvaluation } from "./utils/evaluation";
export { WORKER_PATH } from "./utils/workerPath";
export type {
  Evaluation,
  PVMove,
  PrincipalVariation,
  EngineStatus,
  StockfishConfig,
  AnalysisInfo,
  AnalysisMethods,
  WorkerOptions,
} from "./types";
export { InvalidFenError } from "./utils/uci";

// src/utils-entry.ts
export { formatEvaluation, normalizeEvaluation } from "./utils/evaluation";
export { WORKER_PATH } from "./utils/workerPath";
export type {} from /* same types */ "./types";
```

---

## Implementation Plan

The implementation is organized into **7 stories** with **15 tasks** total. Tasks should be completed in dependency order.

### Important: Test-First, Document-First Approach

**Each task must be fully tested and documented before being marked complete.** Tests and documentation are NOT separate phases at the end — they are integral parts of each task:

1. **Write tests first** (or alongside implementation) — TDD approach preferred
2. **Document as you code** — JSDoc comments, TypeScript types, and inline documentation
3. **Storybook stories** — Created immediately after component implementation
4. **Task complete only when**: implementation passes all tests AND has complete documentation

### Task Dependencies

```
Story 1: Foundation (1-3)
  ├── Task 1: Package structure
  ├── Task 2: Types
  └── Task 3: Utilities → → → Story 2, 3, 4

Story 2: Core Engine (4-5)
  ├── Task 4: StockfishEngine class
  └── Task 5: useStockfishAnalysis hook → → → Story 3

Story 3: React Integration (6, 7, 10)
  ├── Task 6: Context & useStockfish
  ├── Task 7: ChessStockfish.Root
  └── Task 10: Compound component export → → → Story 5

Story 4: UI Components (8-9)
  ├── Task 8: EvaluationBar
  └── Task 9: EngineLines → → → Task 10

Story 5: Public API (11)
  └── Task 11: index.ts & utils-entry.ts
```

---

### Story 1: Foundation & Types

#### Task 1: Create package structure and configuration

**File:** `packages/react-chess-stockfish/`

Create directory structure:

```
src/
├── components/ChessStockfish/parts/__tests__/
├── hooks/__tests__/
├── engine/__tests__/
└── utils/__tests__/
```

Create config files:

- `package.json` - See Configuration section for exact contents
- `tsconfig.json` - Extend root config, set `composite: true`, paths to other packages
- `tsup.config.ts` - See Configuration section for exact contents

**Acceptance Criteria:**

- [x] Package directory created under `packages/`
- [x] `package.json` has correct name, dependencies, exports
- [x] `tsup.config.ts` outputs dual ESM/CJS with types
- [x] `npm run build` succeeds (produces empty dist)

---

#### Task 2: Create types and domain models

**File:** `src/types/index.ts`

```typescript
import { Color } from "chess.js";

export type Evaluation =
  | { type: "cp"; value: number }
  | { type: "mate"; value: number };

export interface PVMove {
  uci: string;
  san: string;
}

export interface PrincipalVariation {
  rank: number;
  evaluation: Evaluation | null;
  moves: PVMove[];
}

export type EngineStatus = "initializing" | "ready" | "analyzing" | "error";

export interface StockfishConfig {
  skillLevel?: number;
  depth?: number;
  multiPV?: number;
}

export interface AnalysisInfo {
  evaluation: Evaluation | null;
  normalizedEvaluation: number;
  bestLine: PrincipalVariation | null;
  principalVariations: PrincipalVariation[];
  depth: number;
  status: EngineStatus;
  isEngineThinking: boolean;
  hasResults: boolean;
  error: Error | null;
}

export interface AnalysisMethods {
  startAnalysis: () => void;
  stopAnalysis: () => void;
  getBestMove: () => PVMove | null;
  setConfig: (config: Partial<StockfishConfig>) => void;
}

export const WORKER_PATH =
  "https://unpkg.com/stockfish@17.1.0/src/stockfish-17.1-lite-single-03e3232.js";

export interface WorkerOptions {
  workerPath: string;
  throttleMs?: number;
  timeout?: number;
  onError?: (error: Error) => void;
}
```

**Acceptance Criteria:**

- [x] All types exported from `src/types/index.ts`
- [x] Types compile without errors
- [x] WORKER_PATH constant defined
- [x] **Code fully tested and documented before marking task complete**

---

#### Task 3: Implement utility functions

**Files:**

- `src/utils/evaluation.ts`
- `src/utils/workerPath.ts`
- `src/utils/uci.ts`

**`src/utils/evaluation.ts`:**

```typescript
import type { Evaluation } from "../types";

export class InvalidFenError extends Error {
  readonly fen: string;
  constructor(fen: string, reason: string) {
    super(`Invalid FEN: ${reason}`);
    this.name = "InvalidFenError";
    this.fen = fen;
  }
}

export function formatEvaluation(evaluation: Evaluation | null): string {
  if (!evaluation) return "–";
  if (evaluation.type === "mate") {
    return evaluation.value > 0
      ? `M${evaluation.value}`
      : `-M${Math.abs(evaluation.value)}`;
  }
  const sign = evaluation.value > 0 ? "+" : "";
  return `${sign}${(evaluation.value / 100).toFixed(2)}`;
}

export function normalizeEvaluation(
  evaluation: Evaluation | null,
  range = 1000,
): number {
  if (!evaluation) return 0;
  if (evaluation.type === "mate") {
    return Math.sign(evaluation.value);
  }
  const clamped = Math.max(-range, Math.min(range, evaluation.value));
  return Math.tanh(clamped / range);
}
```

**`src/utils/workerPath.ts`:**

```typescript
import { WORKER_PATH } from "../types";

export function validateWorkerPath(workerPath: string): void {
  const trimmed = workerPath.trim();
  if (trimmed.includes("\0")) {
    throw new Error("workerPath cannot contain null bytes");
  }
  try {
    const url = new URL(trimmed, window.location.origin);
    const isLocalhost =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (
      url.protocol !== "https:" &&
      !(isLocalhost && url.protocol === "http:")
    ) {
      throw new Error(
        `workerPath must use https:// protocol (http:// allowed for localhost only)`,
      );
    }
  } catch {
    throw new Error(`Invalid workerPath: ${workerPath}`);
  }
}

export { WORKER_PATH };
```

**`src/utils/uci.ts`:**

```typescript
import { Chess } from "chess.js";
import type { PVMove } from "../types";

export function validateFen(fen: string): void {
  const chess = new Chess();
  if (!chess.validate_fen(fen).valid) {
    throw new InvalidFenError(fen, "Invalid FEN string");
  }
}

export function uciToSan(uci: string, fen: string): string {
  const chess = new Chess(fen);
  const move = chess.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.slice(4) || undefined,
  });
  return move ? move.san : uci;
}

export {
  InvalidFenError,
  formatEvaluation,
  normalizeEvaluation,
} from "./evaluation";
```

**Acceptance Criteria:**

- [x] `formatEvaluation` handles cp, mate, null cases
- [x] `normalizeEvaluation` returns -1 to 1 range
- [x] `validateWorkerPath` rejects data:, javascript:, blob:, file:
- [x] `validateFen` uses chess.js for validation
- [x] `uciToSan` converts UCI to SAN using chess.js
- [x] `uciToPvMoves` converts arrays of UCI moves to PVMove objects
- [x] All utilities exported from `src/utils/index.ts`
- [x] **Code fully tested and documented before marking task complete**

---

### Story 2: Core Engine

#### Task 4: Implement StockfishEngine class

**File:** `src/engine/stockfishEngine.ts`

The core engine class managing Web Worker and UCI protocol. Key behaviors:

1. **Initialization**: Creates worker, sends `uci`, waits for `uciok`, sends `isready`, waits for `readyok`
2. **Analysis**: Validates FEN, sends `position fen`, applies `setoption` for config, sends `go infinite`
3. **Info parsing**: Parses `info` messages, normalizes eval to white perspective, updates mutable state
4. **Throttling**: 100ms throttle with trailing edge
5. **Generation counter**: Increments on each FEN change, discards stale results
6. **External store**: Implements `subscribe`/`getSnapshot` for `useSyncExternalStore`

```typescript
export class StockfishEngine {
  private worker: Worker | null = null;
  private mutableState: AnalysisState;
  private listeners = new Set<(state: AnalysisState) => void>();
  private generation = 0;
  private lastUpdate = 0;
  private trailingTimeout: ReturnType<typeof setTimeout> | null = null;
  private appliedConfig: StockfishConfig = {};

  constructor(workerOptions: WorkerOptions) {
    /* ... */
  }

  async init(): Promise<void> {
    /* ... */
  }
  startAnalysis(fen: string, config: StockfishConfig): void {
    /* ... */
  }
  stopAnalysis(): void {
    /* ... */
  }
  getBestMove(): PVMove | null {
    /* ... */
  }
  setConfig(config: Partial<StockfishConfig>): void {
    /* ... */
  }

  subscribe(listener: (state: AnalysisState) => void): () => void {
    /* ... */
  }
  getSnapshot(): AnalysisState {
    /* ... */
  }

  destroy(): void {
    /* ... */
  }

  private handleMessage(event: MessageEvent): void {
    /* ... */
  }
  private parseInfoLine(line: string): ParsedInfo | null {
    /* ... */
  }
  private emitUpdate(): void {
    /* ... */
  }
}
```

**Acceptance Criteria:**

- [x] Worker initializes with UCI handshake
- [x] `startAnalysis` validates FEN, sends position commands
- [x] Info messages parsed (cp, mate, multiPV, depth, pv)
- [x] Evaluations normalized to white perspective
- [x] Updates throttled to ~10/sec with trailing edge
- [x] Generation counter prevents stale analysis
- [x] `subscribe`/`getSnapshot` work with `useSyncExternalStore`
- [x] `destroy` terminates worker and clears listeners
- [x] Error states handled (init failure, timeout, worker crash)
- [x] **Code fully tested and documented before marking task complete**

---

#### Task 5: Create internal hook useStockfishAnalysis

**File:** `src/hooks/useStockfishAnalysis.ts`

Internal hook managing `StockfishEngine` lifecycle within `Root` component.

```typescript
interface UseStockfishAnalysisProps {
  fen: string;
  config?: StockfishConfig;
  workerOptions: WorkerOptions;
}

export function useStockfishAnalysis({
  fen,
  config = {},
  workerOptions,
}: UseStockfishAnalysisProps): {
  info: AnalysisInfo;
  methods: AnalysisMethods;
} {
  const engineRef = useRef<StockfishEngine | null>(null);
  const isInitializingRef = useRef(false);

  // Initialize engine on mount
  useEffect(() => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    const engine = new StockfishEngine(workerOptions);
    engineRef.current = engine;
    engine.init().catch(() => {}); // Error handled by engine

    return () => {
      engine.destroy();
    };
  }, [workerOptions]);

  // Read state via useSyncExternalStore
  const snapshot = useSyncExternalStore(
    useCallback((listener) => engineRef.current?.subscribe(listener) ?? () => {}, []),
    useCallback(() => engineRef.current?.getSnapshot() ?? getInitialState(), []),
  );

  // Auto-start analysis on FEN/config change
  useEffect(() => {
    engineRef.current?.startAnalysis(fen, config);
  }, [fen, config]);

  // Stable methods
  const methods = useMemo<AnalysisMethods>(
    () => ({
      startAnalysis: () => engineRef.current?.startAnalysis(fen, config),
      stopAnalysis: () => engineRef.current?.stopAnalysis(),
      getBestMove: () => engineRef.current?.getBestMove() ?? null,
      setConfig: (newConfig) => engineRef.current?.setConfig(newConfig),
    }),
    [fen, config],
  );

  return { info: snapshot, methods };
}
```

**Acceptance Criteria:**

- [x] Engine created once on mount
- [x] Engine destroyed on unmount
- [x] State read via `useSyncExternalStore`
- [x] Auto-starts analysis when fen/config changes
- [x] Methods are stable references (useMemo)
- [x] Hook not exported (internal only)
- [x] **Code fully tested and documented before marking task complete**

---

### Story 3: React Integration

#### Task 6: Create context and public hook useStockfish

**Files:**

- `src/hooks/useStockfishContext.ts`
- `src/hooks/useStockfish.ts`

**`src/hooks/useStockfishContext.ts`:**

```typescript
import { createContext } from "react";
import type { AnalysisInfo, AnalysisMethods } from "../types";

export interface StockfishContextValue {
  fen: string;
  info: AnalysisInfo;
  methods: AnalysisMethods;
}

export const StockfishContext = createContext<StockfishContextValue | null>(
  null,
);
```

**`src/hooks/useStockfish.ts`:**

```typescript
import { useContext } from "react";
import { StockfishContext } from "./useStockfishContext";

export function useStockfish(): StockfishContextValue {
  const context = useContext(StockfishContext);
  if (!context) {
    throw new Error("useStockfish must be used within ChessStockfish.Root");
  }
  return context;
}
```

**Acceptance Criteria:**

- [x] Context defined with proper typing
- [x] `useStockfish` throws outside provider
- [x] Context value includes fen, info, methods
- [x] **Code fully tested and documented before marking task complete**

---

#### Task 7: Implement ChessStockfish.Root component

**File:** `src/components/ChessStockfish/parts/Root.tsx`

```typescript
import React from "react";
import { StockfishContext } from "../../../hooks/useStockfishContext";
import { useStockfishAnalysis } from "../../../hooks/useStockfishAnalysis";
import type { RootProps } from "./types";

export const Root: React.FC<RootProps> = ({
  fen,
  config,
  workerOptions,
  children,
}) => {
  const { info, methods } = useStockfishAnalysis({ fen, config, workerOptions });

  const context = React.useMemo(
    () => ({ fen, info, methods }),
    [fen, info, methods],
  );

  return (
    <StockfishContext.Provider value={context}>
      {children}
    </StockfishContext.Provider>
  );
};

Root.displayName = "ChessStockfish.Root";
```

**`src/components/ChessStockfish/parts/types.ts`:**

```typescript
import type { StockfishConfig, WorkerOptions } from "../../../types";

export interface RootProps {
  fen: string;
  config?: StockfishConfig;
  workerOptions: WorkerOptions;
  children: React.ReactNode;
}
```

**Acceptance Criteria:**

- [x] Uses `useStockfishAnalysis` internally
- [x] Provides context to children
- [x] displayName set for DevTools
- [x] FEN validated (errors set in context, recoverable)
- [x] **Code fully tested and documented before marking task complete**

---

### Story 4: UI Components

#### Task 8: Implement EvaluationBar component

**File:** `src/components/ChessStockfish/parts/EvaluationBar.tsx`

```typescript
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useStockfish } from "../../../hooks/useStockfish";
import { normalizeEvaluation, formatEvaluation } from "../../../utils/evaluation";

export interface EvaluationBarProps {
  orientation?: "vertical" | "horizontal";
  showEvaluation?: boolean;
  range?: number;
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}

export const EvaluationBar = React.forwardRef<
  HTMLDivElement,
  EvaluationBarProps
>(
  (
    {
      orientation = "vertical",
      showEvaluation = false,
      range = 1000,
      className,
      asChild = false,
      children,
    },
    ref,
  ) => {
    const { info } = useStockfish();
    const Comp = asChild ? Slot : "div";

    const normalized = normalizeEvaluation(info.evaluation, range);
    const fillPercentage = Math.round((normalized + 1) * 50);
    const evalText = formatEvaluation(info.evaluation);

    return (
      <Comp
        ref={ref}
        data-stockfish-orientation={orientation}
        data-stockfish-eval={evalText}
        data-stockfish-eval-type={info.evaluation?.type ?? "none"}
        data-stockfish-eval-value={info.evaluation?.value ?? 0}
        data-stockfish-fill-percentage={fillPercentage}
        className={className}
      >
        <div data-stockfish-fill style={{
          [orientation === "vertical" ? "height" : "width"]: `${fillPercentage}%`,
        }} />
        {showEvaluation && (
          <span data-stockfish-eval-text>{evalText}</span>
        )}
        {children}
      </Comp>
    );
  },
);

EvaluationBar.displayName = "ChessStockfish.EvaluationBar";
```

**Acceptance Criteria:**

- [x] Renders with data attributes
- [x] Fill grows from bottom (vertical) or left (horizontal)
- [x] Supports `asChild` via Radix Slot
- [x] Memoized with `React.memo`
- [x] `forwardRef` support
- [x] **Code fully tested and documented before marking task complete**

---

#### Task 9: Implement EngineLines component

**File:** `src/components/ChessStockfish/parts/EngineLines.tsx`

```typescript
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { useStockfish } from "../../../hooks/useStockfish";
import type { PrincipalVariation } from "../../../types";

export interface EngineLinesProps {
  maxLines?: number;
  showMoveNumbers?: boolean;
  onLineClick?: (rank: number, pv: PrincipalVariation) => void;
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
}

export const EngineLines = React.forwardRef<
  HTMLDivElement,
  EngineLinesProps
>(
  (
    {
      maxLines,
      showMoveNumbers = true,
      onLineClick,
      className,
      asChild = false,
      children,
    },
    ref,
  ) => {
    const { info } = useStockfish();
    const Comp = asChild ? Slot : "div";

    const lines = maxLines
      ? info.principalVariations.slice(0, maxLines)
      : info.principalVariations;

    return (
      <Comp ref={ref} className={className}>
        {lines.map((pv) => (
          <div
            key={pv.rank}
            data-stockfish-pv-rank={pv.rank}
            data-stockfish-eval={formatEvaluation(pv.evaluation)}
            data-stockfish-depth={info.depth}
            data-stockfish-uci-moves={pv.moves.map(m => m.uci).join(" ")}
            onClick={() => onLineClick?.(pv.rank, pv)}
          >
            {pv.moves.map((move, i) => (
              <span
                key={i}
                data-stockfish-move={move.san}
                data-stockfish-move-uci={move.uci}
              >
                {showMoveNumbers && `${i + 1}. `}{move.san}
              </span>
            ))}
          </div>
        ))}
        {children}
      </Comp>
    );
  },
);

EngineLines.displayName = "ChessStockfish.EngineLines";
```

**Acceptance Criteria:**

- [x] Renders PV lines with data attributes
- [x] Respects maxLines prop
- [x] Supports `onLineClick` callback
- [x] Supports `asChild` via Radix Slot
- [x] Memoized with `React.memo`
- [x] `forwardRef` support
- [x] **Code fully tested and documented before marking task complete**

---

### Story 5: Public API

#### Task 10: Create ChessStockfish compound component export

**File:** `src/components/ChessStockfish/index.ts`

```typescript
import { Root } from "./parts/Root";
import { EvaluationBar } from "./parts/EvaluationBar";
import { EngineLines } from "./parts/EngineLines";

export const ChessStockfish = {
  Root,
  EvaluationBar,
  EngineLines,
};
```

**Acceptance Criteria:**

- [ ] Exports compound component object
- [ ] All parts exported
- [ ] **Code fully tested and documented before marking task complete**

---

#### Task 11: Create public API exports

**Files:**

- `src/index.ts`
- `src/utils-entry.ts`

**`src/index.ts`:**

```typescript
"use client";

export { ChessStockfish } from "./components/ChessStockfish";
export { useStockfish } from "./hooks/useStockfish";
export { formatEvaluation, normalizeEvaluation } from "./utils/evaluation";
export { WORKER_PATH } from "./utils/workerPath";
export type {
  Evaluation,
  PVMove,
  PrincipalVariation,
  EngineStatus,
  StockfishConfig,
  AnalysisInfo,
  AnalysisMethods,
  WorkerOptions,
} from "./types";
export { InvalidFenError } from "./utils/uci";
```

**`src/utils-entry.ts`:**

```typescript
export { formatEvaluation, normalizeEvaluation } from "./utils/evaluation";
export { WORKER_PATH } from "./utils/workerPath";
export type {
  Evaluation,
  PVMove,
  PrincipalVariation,
  EngineStatus,
  StockfishConfig,
  AnalysisInfo,
  AnalysisMethods,
  WorkerOptions,
} from "./types";
export { InvalidFenError } from "./utils/uci";
```

**Acceptance Criteria:**

- [ ] `"use client"` directive on index.ts
- [ ] All components, hooks, utilities, types exported
- [ ] `./utils` subpath export works
- [ ] Build produces correct ESM/CJS files
- [ ] **Code fully tested and documented before marking task complete**

---

## Testing Requirements

Tests are written **concurrently with implementation**, not as a separate phase. Each task's acceptance criteria includes full test coverage.

### Test Files (created during implementation)

- `src/utils/__tests__/evaluation.test.ts`
- `src/utils/__tests__/workerPath.test.ts`
- `src/utils/__tests__/uci.test.ts`
- `src/engine/__tests__/stockfishEngine.test.ts`
- `src/components/ChessStockfish/parts/__tests__/Root.test.tsx`
- `src/components/ChessStockfish/parts/__tests__/EvaluationBar.test.tsx`
- `src/components/ChessStockfish/parts/__tests__/EngineLines.test.tsx`
- `src/hooks/__tests__/useStockfish.test.tsx`

### Test Coverage Standards

- Unit tests for all utility functions
- Mocked Web Worker tests for StockfishEngine
- Component tests using React Testing Library
- Edge cases and error states covered
- Security validations tested

## Documentation Requirements

Documentation is written **concurrently with implementation**. Each task includes:

1. **JSDoc comments** on all exported functions and classes
2. **TypeScript types** with descriptive comments
3. **Inline comments** for complex logic (throttling, generation counter, UCI protocol)
4. **Storybook stories** created immediately after component implementation

### Storybook Stories (created during implementation)

File: `src/components/ChessStockfish/ChessStockfish.stories.tsx`

Stories to implement:

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { ChessStockfish } from "./index";
import { WORKER_PATH } from "../../utils/workerPath";

const meta: Meta<typeof ChessStockfish.Root> = {
  title: "ChessStockfish",
  component: ChessStockfish.Root,
};

export default meta;

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const Basic: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen={START_FEN}
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <ChessStockfish.EvaluationBar showEvaluation />
      <ChessStockfish.EngineLines />
    </ChessStockfish.Root>
  ),
};

export const MultiPV: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen={START_FEN}
      config={{ multiPV: 3 }}
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <ChessStockfish.EngineLines maxLines={3} />
    </ChessStockfish.Root>
  ),
};

export const HorizontalBar: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen={START_FEN}
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <ChessStockfish.EvaluationBar orientation="horizontal" showEvaluation />
    </ChessStockfish.Root>
  ),
};

export const CustomConfig: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen={START_FEN}
      config={{ skillLevel: 10, depth: 15 }}
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <ChessStockfish.EvaluationBar showEvaluation />
    </ChessStockfish.Root>
  ),
};

export const ErrorState: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen="invalid-fen"
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <div>Invalid FEN - check context for error</div>
    </ChessStockfish.Root>
  ),
};
```

---

## Example Test Implementations

These examples show the expected test coverage for each module.

### Utility Tests (Task 3)

**Files:**

- `src/utils/__tests__/evaluation.test.ts`
- `src/utils/__tests__/workerPath.test.ts`
- `src/utils/__tests__/uci.test.ts`

**evaluation.test.ts:**

```typescript
import { formatEvaluation, normalizeEvaluation } from "../evaluation";

describe("formatEvaluation", () => {
  it("formats centipawn evaluations", () => {
    expect(formatEvaluation({ type: "cp", value: 123 })).toBe("+1.23");
    expect(formatEvaluation({ type: "cp", value: -50 })).toBe("-0.50");
    expect(formatEvaluation({ type: "cp", value: 0 })).toBe("0.00");
  });

  it("formats mate evaluations", () => {
    expect(formatEvaluation({ type: "mate", value: 3 })).toBe("M3");
    expect(formatEvaluation({ type: "mate", value: -5 })).toBe("-M5");
  });

  it("formats null as dash", () => {
    expect(formatEvaluation(null)).toBe("–");
  });
});

describe("normalizeEvaluation", () => {
  it("normalizes to -1..1 range", () => {
    expect(normalizeEvaluation({ type: "cp", value: 0 })).toBe(0);
    expect(normalizeEvaluation({ type: "cp", value: 1000 })).toBeCloseTo(
      0.76,
      1,
    );
    expect(normalizeEvaluation({ type: "cp", value: -1000 })).toBeCloseTo(
      -0.76,
      1,
    );
  });

  it("clamps at range", () => {
    const result = normalizeEvaluation({ type: "cp", value: 2000 }, 1000);
    expect(result).toBeCloseTo(0.76, 1);
  });

  it("returns ±1 for mate", () => {
    expect(normalizeEvaluation({ type: "mate", value: 3 })).toBe(1);
    expect(normalizeEvaluation({ type: "mate", value: -3 })).toBe(-1);
  });

  it("returns 0 for null", () => {
    expect(normalizeEvaluation(null)).toBe(0);
  });
});
```

**workerPath.test.ts:**

```typescript
import { validateWorkerPath } from "../workerPath";

describe("validateWorkerPath", () => {
  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    });
  });

  it("accepts https URLs", () => {
    expect(() =>
      validateWorkerPath("https://example.com/worker.js"),
    ).not.toThrow();
  });

  it("accepts http URLs for localhost", () => {
    expect(() =>
      validateWorkerPath("http://localhost:3000/worker.js"),
    ).not.toThrow();
  });

  it("rejects null bytes", () => {
    expect(() => validateWorkerPath("path\x00")).toThrow("null bytes");
  });

  it("rejects data URLs", () => {
    expect(() => validateWorkerPath("data:text/javascript,...")).toThrow();
  });

  it("rejects javascript URLs", () => {
    expect(() => validateWorkerPath("javascript:...")).toThrow();
  });
});
```

**uci.test.ts:**

```typescript
import { validateFen, uciToSan, InvalidFenError } from "../uci";

describe("validateFen", () => {
  it("accepts valid FENs", () => {
    expect(() =>
      validateFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
    ).not.toThrow();
  });

  it("throws InvalidFenError for invalid FENs", () => {
    expect(() => validateFen("invalid")).toThrow(InvalidFenError);
  });
});

describe("uciToSan", () => {
  it("converts UCI to SAN", () => {
    expect(
      uciToSan(
        "e2e4",
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      ),
    ).toBe("e4");
  });
});
```

### Engine Tests (Task 4)

**File:** `src/engine/__tests__/stockfishEngine.test.ts`

Mock Web Worker for testing. Test initialization, UCI protocol, info parsing, throttling, generation counter, cleanup.

```typescript
import { StockfishEngine } from "../stockfishEngine";

function mockWorker() {
  return {
    postMessage: jest.fn(),
    terminate: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
}

describe("StockfishEngine", () => {
  it("initializes with UCI handshake", async () => {
    // Test uci → uciok → isready → readyok sequence
  });

  it("parses info messages", () => {
    // Test cp, mate, multiPV, depth, pv parsing
    // Test white normalization (flip sign when black to move)
  });

  it("throttles updates with trailing edge", () => {
    // Test rapid messages only emit ~10/sec
    // Test final message always emitted
  });

  it("discards stale analysis with generation counter", () => {
    // Test that changing FEN cancels pending analysis
  });

  it("handles errors", () => {
    // Test init failure, timeout, worker crash
  });

  it("cleans up on destroy", () => {
    // Test quit sent, worker terminated, listeners cleared
  });
});
```

**Acceptance Criteria (for engine tests):**

- [ ] UCI protocol initialization tested
- [ ] Info message parsing tested
- [ ] Throttling behavior verified
- [ ] Generation counter prevents stale analysis
- [ ] Error states covered
- [ ] Cleanup verified

### Component Tests (Tasks 7, 8, 9)

**Files:**

- `src/components/ChessStockfish/parts/__tests__/Root.test.tsx`
- `src/components/ChessStockfish/parts/__tests__/EvaluationBar.test.tsx`
- `src/components/ChessStockfish/parts/__tests__/EngineLines.test.tsx`
- `src/hooks/__tests__/useStockfish.test.tsx`

```typescript
import { render, screen } from "@testing-library/react";
import { ChessStockfish } from "../index";
import { WORKER_PATH } from "../../../../utils/workerPath";

describe("ChessStockfish.Root", () => {
  it("provides context to children", () => {
    // Test useStockfish works inside Root
  });

  it("validates FEN", () => {
    // Test invalid FEN sets error in context
  });
});

describe("EvaluationBar", () => {
  it("renders with data attributes", () => {
    // Test data-stockfish-eval, data-stockfish-fill-percentage
  });

  it("supports asChild", () => {
    // Test renders as custom element
  });
});

describe("EngineLines", () => {
  it("renders PV lines", () => {
    // Test data-stockfish-move attributes
  });

  it("respects maxLines", () => {
    // Test only N lines rendered
  });
});

describe("useStockfish", () => {
  it("throws outside provider", () => {
    // Test error thrown when used without Root
  });
});
```

**Acceptance Criteria (for component tests):**

- [ ] All components tested
- [ ] Data attributes verified
- [ ] asChild pattern tested
- [ ] Context behavior tested

---

## Storybook Stories (created during Tasks 8-9)

**File:** `src/components/ChessStockfish/ChessStockfish.stories.tsx`

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { ChessStockfish } from "./index";
import { WORKER_PATH } from "../../utils/workerPath";

const meta: Meta<typeof ChessStockfish.Root> = {
  title: "ChessStockfish",
  component: ChessStockfish.Root,
};

export default meta;

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const Basic: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen={START_FEN}
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <ChessStockfish.EvaluationBar showEvaluation />
      <ChessStockfish.EngineLines />
    </ChessStockfish.Root>
  ),
};

export const MultiPV: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen={START_FEN}
      config={{ multiPV: 3 }}
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <ChessStockfish.EngineLines maxLines={3} />
    </ChessStockfish.Root>
  ),
};

export const HorizontalBar: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen={START_FEN}
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <ChessStockfish.EvaluationBar orientation="horizontal" showEvaluation />
    </ChessStockfish.Root>
  ),
};

export const CustomConfig: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen={START_FEN}
      config={{ skillLevel: 10, depth: 15 }}
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <ChessStockfish.EvaluationBar showEvaluation />
    </ChessStockfish.Root>
  ),
};

export const ErrorState: StoryObj = {
  render: () => (
    <ChessStockfish.Root
      fen="invalid-fen"
      workerOptions={{ workerPath: WORKER_PATH }}
    >
      <div>Invalid FEN - check context for error</div>
    </ChessStockfish.Root>
  ),
};
```

**Acceptance Criteria (for Storybook stories):**

- [ ] Basic usage story works
- [ ] Multi-PV story shows multiple lines
- [ ] Horizontal orientation story works
- [ ] Custom config story demonstrates skillLevel/depth
- [ ] Error state shows InvalidFenError handling
- [ ] All stories use WORKER_PATH
