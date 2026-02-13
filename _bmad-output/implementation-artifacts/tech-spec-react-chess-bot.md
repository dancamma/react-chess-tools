---
title: "React Chess Bot"
slug: "react-chess-bot"
created: "2026-02-13"
status: "completed"
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - React 18/19
  - TypeScript 5.x
  - tsup (ESM + CJS bundling)
  - Jest + React Testing Library
  - Storybook
  - chess.js
  - "@radix-ui/react-slot"
files_to_modify:
  - "packages/react-chess-bot/* (new package)"
code_patterns:
  - Compound components (Root + parts)
  - Context-based state with descriptive error messages
  - Ref-based callbacks to avoid stale closures with timers
  - Tests in __tests__ directories adjacent to components
  - Stories co-located with components
  - tsup.config.ts at package level
test_patterns:
  - Jest with React Testing Library
  - Mock engine/hook at appropriate level (not the component)
  - TestChild component pattern for consuming context
  - beforeEach/afterEach for mock setup and cleanup
---

# Tech-Spec: React Chess Bot

**Created:** 2026-02-13

## Overview

### Problem Statement

Developers need a way to add CPU opponents to chess games built with `react-chess-game`. Currently there's no easy integration between the engine (`react-chess-stockfish`) and the game state to make automatic moves.

### Solution

A new `react-chess-bot` package that bridges `react-chess-stockfish` and `react-chess-game`. Uses compound component pattern with `ChessBot.Root` that wraps `ChessStockfish.Root` internally, subscribes to both game and engine contexts, and auto-plays when it's the bot's turn.

### Scope

**In Scope:**

- New package `@react-chess-tools/react-chess-bot`
- `ChessBot.Root` component with `playAs` prop ("white" | "black")
- Configurable move delay (`minDelayMs`, `maxDelayMs`)
- Stockfish `skillLevel` (0-20) exposed as prop with validation
- Game events: `onBotMoveStart`, `onBotMoveComplete`, `onBotError`
- Support for human vs CPU (one bot) and CPU vs CPU (two bots)
- Context provider exposing bot state (`isThinking`, `lastMove`, `error`)
- Data attributes for styling (`data-thinking`, `data-color`)
- Accessibility: ARIA live region announcements for bot moves
- Full test coverage
- README documentation
- Storybook stories with working Stockfish worker

**Out of Scope:**

- Alternative engine backends (only Stockfish)
- Opening books or endgame tablebases
- Bot personality/playing style configuration beyond skillLevel
- Network-based bots (e.g., lichess API)
- Shared engine for CPU vs CPU (each bot has its own engine instance)

## Context for Development

### Codebase Patterns

- **Compound Components:** Components follow Radix UI style (e.g., `ChessGame.Root`, `ChessStockfish.Root`)
- **Context-based State:** Each package has a context provider in Root and exposes hooks
- **Ref-based Callbacks:** Callbacks stored in refs to avoid stale closures with timers/intervals (see `useChessGame.ts` lines 67-68, `useStockfishAnalysis.ts` lines 72-78)
- **asChild Pattern:** Via `@radix-ui/react-slot` for flexible composition
- **Package Structure:** `src/components/`, `src/hooks/`, `src/types/`, `src/__tests__/`
- **Build:** tsup with ESM + CJS, React/React-DOM as peer deps

### Files to Reference

| File                                                                                         | Purpose                                                        |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `packages/react-chess-game/src/hooks/useChessGameContext.ts`                                 | Context pattern with descriptive errors                        |
| `packages/react-chess-game/src/hooks/useChessGame.ts`                                        | Game state management, `makeMove()`, `currentFen`, `info.turn` |
| `packages/react-chess-game/src/components/ChessGame/parts/Root.tsx`                          | Root component pattern with context provider                   |
| `packages/react-chess-stockfish/src/hooks/useStockfish.ts`                                   | Public hook to access engine state and `getBestMove()`         |
| `packages/react-chess-stockfish/src/components/ChessStockfish/parts/Root.tsx`                | Engine provider pattern                                        |
| `packages/react-chess-stockfish/src/types/index.ts`                                          | Types: `PVMove`, `StockfishConfig`, `WorkerOptions`            |
| `packages/react-chess-stockfish/src/components/ChessStockfish/parts/__tests__/Root.test.tsx` | Test patterns with mock engine                                 |
| `packages/react-chess-stockfish/src/components/ChessStockfish/ChessStockfish.stories.tsx`    | Storybook patterns                                             |
| `packages/react-chess-stockfish/package.json`                                                | Package structure for new packages                             |
| `tsup.config.ts`                                                                             | Build configuration                                            |
| `packages/react-chess-stockfish/README.md`                                                   | Documentation template                                         |

### Technical Decisions

1. **Architecture - Wrapping Pattern with Context Provider:**
   - `ChessBot.Root` creates and provides `ChessBotContext` for consumers
   - Internally wraps `ChessStockfish.Root` with `currentFen` from game context
   - A `BotController` child component uses `useStockfish()` to access engine state
   - This uses only the **public API** of `react-chess-stockfish`

   ```tsx
   // ChessBot.Root structure
   function Root({
     playAs,
     workerPath,
     skillLevel,
     asChild,
     ...callbacks,
     children,
   }) {
     const { currentFen } = useChessGameContext();
     const [isThinking, setIsThinking] = useState(false);
     const [lastMove, setLastMove] = useState<BotMove | null>(null);
     const [error, setError] = useState<Error | null>(null);

     // Validate skillLevel: clamp to 0-20 range
     const validatedSkillLevel = Math.max(0, Math.min(20, skillLevel ?? 10));

     const contextValue = useMemo(
       () => ({
         playAs,
         isThinking,
         lastMove,
         error,
       }),
       [playAs, isThinking, lastMove, error],
     );

     const Comp = asChild ? Slot : Fragment;

     return (
       <ChessBotContext.Provider value={contextValue}>
         <Comp>
           <ChessStockfish.Root
             fen={currentFen}
             config={{ skillLevel: validatedSkillLevel }}
             workerOptions={{ workerPath }}
             onError={(err) => {
               setError(err);
               callbacks.onBotError?.(err);
             }}
           >
             <BotController
               playAs={playAs}
               onThinkingChange={setIsThinking}
               onMoveComplete={(move) => {
                 setLastMove(move);
                 callbacks.onBotMoveComplete?.(move);
               }}
               onBotMoveStart={callbacks.onBotMoveStart}
               onError={setError}
             />
             {children}
           </ChessStockfish.Root>
         </Comp>
       </ChessBotContext.Provider>
     );
   }
   ```

2. **Turn Detection and Game State:**
   - Use `useChessGameContext()` to get `info.turn` ("w" or "b") and `info.isGameOver` (boolean)
   - Map `playAs` prop ("white"/"black") to chess.js color ("w"/"b")
   - Bot plays when `info.turn === playAsColor && !info.isGameOver`
   - Game over check uses `info.isGameOver` from `react-chess-game` (covers checkmate, stalemate, draw)

3. **Move Timing - Wait for Results:**
   - Bot must wait for `info.hasResults` (from `useStockfish()`) before calling `getBestMove()`
   - `getBestMove()` returns `null` if engine hasn't produced results yet
   - Track `hasMovedForPosition` state to prevent double-moves for the same FEN
   - **Fallback:** If `getBestMove()` returns `null` even with `hasResults=true`, log warning and fire `onBotError` with descriptive error - do not attempt to move

4. **Delay Implementation:**
   - Random delay between `minDelayMs` and `maxDelayMs`
   - Fire `onBotMoveStart` **before** delay starts (indicates thinking began)
   - Store timeout ID in ref for cleanup on unmount

5. **Move Execution with Error Handling:**
   - After delay, call `methods.makeMove(move.san)` from `useChessGameContext()`
   - `makeMove()` may throw if the move is invalid (shouldn't happen, but defensive coding)
   - Wrap in try-catch: on failure, fire `onBotError` with error, log warning, do not update state
   - On success, fire `onBotMoveComplete` with move data

6. **CPU vs CPU and Duplicate Bot Handling:**
   - Two `ChessBot.Root` components can coexist with different `playAs` values
   - Each bot has its own `ChessStockfish.Root` (own engine instance)
   - Works naturally because each bot only responds on their turn
   - **Warning:** Multiple bots with the same `playAs` value are undefined behavior - may cause race conditions or duplicate moves. Document this as unsupported in README.

7. **Event Callbacks:**
   - `onBotMoveStart`: Fired when bot begins thinking (before delay)
   - `onBotMoveComplete(move)`: Fired after move is successfully made
   - `onBotError(error)`: Fired for engine errors, failed moves, or null best move

## Implementation Plan

### Tasks

#### Phase 1: Package Setup

- [x] Task 1: Create package directory structure
  - File: `packages/react-chess-bot/`
  - Action: Create directory with `src/components/ChessBot/parts/`, `src/hooks/`, `src/types/`, `src/__tests__/` subdirectories
  - Notes: Follow existing package structure from `react-chess-stockfish`

- [x] Task 2: Create package.json
  - File: `packages/react-chess-bot/package.json`
  - Action: Create with name `@react-chess-tools/react-chess-bot`, dependencies on `react-chess-game`, `react-chess-stockfish`, `@radix-ui/react-slot`, `chess.js`, peer deps for React 18+
  - Notes: Copy structure from `packages/react-chess-stockfish/package.json`

- [x] ~~Task 3: Create tsconfig.json~~ (Skipped - packages use root tsconfig)
  - File: `packages/react-chess-bot/tsconfig.json`
  - Action: Create TypeScript config extending root config
  - Notes: Copy from `packages/react-chess-stockfish/tsconfig.json`

- [x] Task 4: Create tsup.config.ts
  - File: `packages/react-chess-bot/tsup.config.ts`
  - Action: Create build config with ESM/CJS output, React as external
  - Notes: Copy from root `tsup.config.ts`

#### Phase 2: Types

- [x] Task 5: Define types
  - File: `packages/react-chess-bot/src/types/index.ts`
  - Action: Define `PlayAsColor`, `ChessBotContextValue` types (re-use `PVMove` from react-chess-stockfish)
  - Notes:

    ```typescript
    import type { PVMove } from "@react-chess-tools/react-chess-stockfish";

    export type PlayAsColor = "white" | "black";

    // Re-export PVMove as BotMove for consumer convenience
    export type BotMove = PVMove;

    export interface ChessBotContextValue {
      playAs: PlayAsColor;
      isThinking: boolean;
      lastMove: BotMove | null;
      error: Error | null;
    }
    ```

#### Phase 3: Components

- [x] Task 6: Create BotController component
  - File: `packages/react-chess-bot/src/components/ChessBot/parts/BotController.tsx`
  - Action: Create internal component that handles bot logic
  - Notes:

    ```tsx
    interface BotControllerProps {
      playAs: PlayAsColor;
      minDelayMs: number;
      maxDelayMs: number;
      onThinkingChange: (isThinking: boolean) => void;
      onMoveComplete: (move: BotMove) => void;
      onBotMoveStart?: () => void;
      onError: (error: Error) => void;
    }
    ```

    - Use `useChessGameContext()` for game state (`info.turn`, `info.isGameOver`) and `methods.makeMove()`
    - Use `useStockfish()` for `info.hasResults` and `methods.getBestMove()`
    - Track `hasMovedForPosition` state with `positionFen` (the FEN when move was initiated), reset when FEN changes
    - **Race condition fix:** Store `positionFen` in ref when initiating move. After delay, check `currentFen === positionFen` before executing. If FEN changed, abort the move silently.
    - Store callbacks in refs (pattern from existing packages)
    - Store timeout ID in ref for cleanup
    - Returns `null` (no DOM output)

- [x] Task 7: Create ChessBot.Root component
  - File: `packages/react-chess-bot/src/components/ChessBot/parts/Root.tsx`
  - Action: Create Root provider component that wraps ChessStockfish.Root
  - Notes:

    ```tsx
    interface RootProps {
      playAs: PlayAsColor;
      skillLevel?: number; // 0-20, default 10 (clamped if out of range)
      minDelayMs?: number; // default 0
      maxDelayMs?: number; // default 1000
      workerPath: string;
      asChild?: boolean; // render as Slot for composition
      onBotMoveStart?: () => void;
      onBotMoveComplete?: (move: BotMove) => void;
      onBotError?: (error: Error) => void;
      children?: ReactNode;
    }
    ```

    - Get `currentFen` from `useChessGameContext()`
    - Create and provide `ChessBotContext` with `playAs`, `isThinking`, `lastMove`, `error`
    - Render `ChessStockfish.Root` with `fen={currentFen}`
    - Render `BotController` as child of `ChessStockfish.Root`
    - Support `asChild` prop via `@radix-ui/react-slot` for composition
    - **Data attributes:** Root element gets `data-thinking="true|false"` and `data-color="white|black"`
    - **Accessibility:** Include hidden live region with `aria-live="polite"` that announces bot moves (e.g., "Bot plays e4")
    - displayName: "ChessBot.Root"

- [x] Task 8: Create useChessBotContext hook
  - File: `packages/react-chess-bot/src/hooks/useChessBotContext.ts`
  - Action: Create context hook with descriptive error
  - Notes: Follow pattern from `useChessGameContext.ts`

- [x] Task 9: Create hooks index
  - File: `packages/react-chess-bot/src/hooks/index.ts`
  - Action: Export `useChessBotContext`

- [x] Task 10: Create ChessBot compound component index
  - File: `packages/react-chess-bot/src/components/ChessBot/index.ts`
  - Action: Export `ChessBot` object with `Root` property
  - Notes: Follow pattern from `packages/react-chess-stockfish/src/components/ChessStockfish/index.ts`

- [x] Task 11: Create package entry point
  - File: `packages/react-chess-bot/src/index.ts`
  - Action: Export `ChessBot` component, `useChessBotContext` hook, and types
  - Notes:
    ```typescript
    export { ChessBot } from "./components/ChessBot";
    export { useChessBotContext } from "./hooks";
    export type { PlayAsColor, BotMove, ChessBotContextValue } from "./types";
    export type { RootProps } from "./components/ChessBot/parts/Root";
    ```

#### Phase 4: Tests

- [x] Task 12: Create Root component tests
  - File: `packages/react-chess-bot/src/components/ChessBot/parts/__tests__/Root.test.tsx`
  - Action: Write comprehensive tests for ChessBot.Root
  - Notes: Test scenarios:
    - Renders children correctly
    - Throws descriptive error when used outside ChessGame.Root
    - Context is provided and `useChessBotContext` returns expected values
    - Bot makes move when it's its turn AND hasResults is true
    - Bot doesn't move when it's not its turn
    - Bot doesn't move when game is over (`info.isGameOver === true`)
    - Bot doesn't move when hasResults is false
    - Bot doesn't move twice for the same position
    - Delay is respected (use fake timers)
    - `onBotMoveStart` fires before delay
    - `onBotMoveComplete` fires after move with correct move data
    - `onBotError` fires when engine errors
    - `onBotError` fires when `getBestMove()` returns null with `hasResults=true`
    - `onBotError` fires when `makeMove()` throws
    - Pending move is cancelled on unmount (no state updates after unmount)
    - Race condition: FEN changes during delay, old timeout fires but move is aborted
    - skillLevel is clamped to 0-20 range
    - Two bots can coexist for CPU vs CPU
    - Data attributes are set correctly (`data-thinking`, `data-color`)

- [x] Task 13: Create BotController tests
  - File: `packages/react-chess-bot/src/components/ChessBot/parts/__tests__/BotController.test.tsx`
  - Action: Write unit tests for the BotController logic
  - Notes: Test scenarios:
    - Turn detection: plays only on correct turn
    - Game over detection: doesn't play when `info.isGameOver` is true
    - hasResults waiting: doesn't attempt move until `hasResults` is true
    - hasMovedForPosition tracking: doesn't move twice for same FEN
    - Race condition: FEN changes during delay, move is aborted
    - `getBestMove()` returns null: error is fired, no move attempted
    - `makeMove()` throws: error is caught and fired, state not corrupted
    - Delay calculation: random value within min/max range
    - Cleanup: timeout cleared on unmount

#### Phase 5: Documentation

- [x] Task 14: Create README.md
  - File: `packages/react-chess-bot/README.md`
  - Action: Write comprehensive documentation
  - Notes: Include:
    - Overview and features
    - Installation
    - Getting Stockfish Worker (link to stockfish.js npm package or official docs)
    - Quick Start examples
    - API Reference (Root props with types and defaults)
    - `useChessBotContext` hook documentation
    - Examples: Human vs CPU (both colors), CPU vs CPU
    - Data attributes: `data-thinking="true|false"`, `data-color="white|black"`
    - Accessibility: how live regions announce moves
    - Warning about duplicate bot instances with same `playAs`
    - License

- [x] Task 15: Create Storybook stories
  - File: `packages/react-chess-bot/src/components/ChessBot/ChessBot.stories.tsx`
  - Action: Write Storybook stories
  - Notes:
    - **Stockfish Worker:** Use `stockfish.js` from `node_modules/stockfish` or CDN. For Storybook, copy worker to `public/` folder and reference as `/stockfish.js`.
    - Stories:
      - `HumanVsCpu-White`: Human plays white, bot plays black
      - `HumanVsCpu-Black`: Human plays black, bot plays white
      - `CpuVsCpu`: Two bots playing each other
      - `ConfigurableBot`: With controls for skillLevel, minDelayMs, maxDelayMs
    - Each story must include working `workerPath` for functional demos

#### Phase 6: Integration

- [x] Task 16: Update root README
  - File: `README.md`
  - Action: Add `react-chess-bot` to packages list
  - Notes: Add brief description and link to package README

### Acceptance Criteria

#### Happy Path

- [ ] AC 1: Given a ChessGame.Root with a ChessBot.Root playAs="black", when white (human) makes a move and the engine produces results (hasResults=true), then the bot automatically makes a move for black after the configured delay

- [ ] AC 2: Given a ChessGame.Root with a ChessBot.Root playAs="white", when the game starts and hasResults=true, then the bot automatically makes the first move for white

- [ ] AC 3: Given a ChessGame.Root with two ChessBot.Root components (playAs="white" and playAs="black"), when the game starts, then both bots play each other automatically (each on their turn)

- [ ] AC 4: Given a bot with minDelayMs=500 and maxDelayMs=1000, when it's the bot's turn and hasResults=true, then the bot waits a random duration between 500-1000ms before making a move

#### Engine Timing

- [ ] AC 5: Given a bot's turn but hasResults=false, when the engine hasn't produced results yet, then the bot waits and does not attempt to make a move

- [ ] AC 6: Given a bot that has already moved for the current position, when the position hasn't changed, then the bot does not attempt to make another move

#### Error Handling

- [ ] AC 7: Given ChessBot.Root is used outside of ChessGame.Root, when rendered, then it throws a descriptive error message explaining it must be used within ChessGame.Root

- [ ] AC 8: Given a bot and the engine fails to initialize, when an error occurs, then `onBotError` is called with the error

- [ ] AC 9: Given a bot is thinking (delay in progress) and the component unmounts, when unmount happens, then the pending timeout is cancelled (no state updates after unmount)

#### Edge Cases

- [ ] AC 10: Given a game that is over (checkmate/stalemate/draw), when it would be the bot's turn, then the bot does not attempt to make a move

- [ ] AC 11: Given a bot with skillLevel=0, when the bot moves, then it makes a weak (but legal) move

- [ ] AC 12: Given a bot with skillLevel=20, when the bot moves, then it makes a strong move

#### Events

- [ ] AC 13: Given a bot with onBotMoveStart callback, when it's the bot's turn and hasResults=true, then onBotMoveStart fires immediately (before the delay)

- [ ] AC 14: Given a bot with onBotMoveComplete callback, when the bot successfully makes a move, then onBotMoveComplete fires with `{ san: string, uci: string }`

#### Error Handling (Extended)

- [ ] AC 15: Given `getBestMove()` returns `null` even with `hasResults=true`, when the bot attempts to move, then `onBotError` is fired with a descriptive error and no move is attempted

- [ ] AC 16: Given `makeMove()` throws an error (invalid move), when the bot attempts to execute the move, then `onBotError` is fired, the error is caught, and state is not corrupted

- [ ] AC 17: Given `skillLevel=25` (out of range), when the component renders, then the value is clamped to 20 (no error thrown)

- [ ] AC 18: Given `skillLevel=-5` (out of range), when the component renders, then the value is clamped to 0 (no error thrown)

#### Race Conditions

- [ ] AC 19: Given a bot is waiting during delay and the FEN changes (opponent moved), when the delay timeout fires, then the move is aborted because the position has changed

#### Context and Data Attributes

- [ ] AC 20: Given a ChessBot.Root with `playAs="black"`, when `useChessBotContext()` is called from a child component, then it returns `{ playAs: "black", isThinking: boolean, lastMove: BotMove | null, error: Error | null }`

- [ ] AC 21: Given a ChessBot.Root, when rendered, then the root element has `data-thinking` attribute set to "true" during thinking and "false" otherwise

- [ ] AC 22: Given a ChessBot.Root with `playAs="white"`, when rendered, then the root element has `data-color="white"`

#### Accessibility

- [ ] AC 23: Given a bot makes a move, when the move completes, then a screen reader announces the move via an ARIA live region

## Additional Context

### Dependencies

**Production:**

- `@react-chess-tools/react-chess-game` ^1.0.0 - Game state and move handling
- `@react-chess-tools/react-chess-stockfish` ^1.0.0 - Engine integration (uses public API only), re-exports `PVMove` type
- `@radix-ui/react-slot` ^1.2.0 - asChild pattern for Root composition
- `chess.js` ^1.4.0 - Chess logic

**Peer:**

- `react >= 18.0.0`
- `react-dom >= 18.0.0`

**Dev:**

- `react` ^19.2.3
- `react-dom` ^19.2.3

### Testing Strategy

**Unit Tests:**

- `BotController`: turn detection, delay calculation, hasResults waiting, positionFen tracking, error handling
- `Root` component: context provision, error boundaries, cleanup, data attributes

**Integration Tests:**

- Mock `useChessGameContext` to control game state
- Mock `ChessStockfish.Root` or use real with mock engine
- Test two bots playing each other

**Manual Testing:**

- Play a game against the bot (both colors)
- Watch CPU vs CPU game
- Verify delays feel natural
- Test with different skill levels
- Test screen reader announcements (use VoiceOver/NVDA)
- Verify data attributes update correctly during thinking/not thinking

### Notes

**Architecture - Why Wrap ChessStockfish.Root:**

- `useStockfishAnalysis` is NOT exported from react-chess-stockfish (internal hook)
- `useStockfish` is the public hook but requires `ChessStockfish.Root` provider
- Solution: `ChessBot.Root` wraps `ChessStockfish.Root` internally, child component uses `useStockfish()`

**Race Condition Handling:**

- FEN changes → engine starts new analysis → `hasResults` resets
- Bot tracks `positionFen` (the FEN when a move was initiated) to prevent double-moves
- **Mechanism:** When starting a move, store `positionFen = currentFen`. After delay, before executing, check `currentFen === positionFen`. If FEN changed (opponent moved during delay), abort the move silently.
- This prevents stale moves from being executed after the position has changed.

**CPU vs CPU Consideration:**

- Each bot has its own `ChessStockfish.Root` → own engine instance
- This is slightly wasteful (two engines analyzing same position) but simple and correct
- Future optimization: shared engine mode (out of scope)
- **Warning:** Multiple bots with the same `playAs` value are unsupported and may cause race conditions

**Accessibility:**

- Root component includes a hidden live region with `aria-live="polite"` and `aria-atomic="true"`
- When bot makes a move, announce to screen readers: "Bot plays {move.san}" (e.g., "Bot plays e4")
- Live region is visually hidden but accessible to assistive technology
- Announcement happens after `onBotMoveComplete` fires

**Future Considerations (Out of Scope):**

- Opening book support for faster opening play
- Configurable evaluation display during thinking
- "Ponder" mode (think during opponent's turn)
- Time management (adjust thinking time based on clock)
- Shared engine for CPU vs CPU

**High-Risk Items:**

- Timing: bot must wait for `hasResults` before calling `getBestMove()`
- Cleanup: pending timeout must be cleared on unmount
- State tracking: `positionFen` must be checked after delay to detect position changes
- Error handling: `getBestMove()` returning null and `makeMove()` throwing must both be handled
- skillLevel validation: must clamp to 0-20 to prevent Stockfish errors

## Review Notes

- Adversarial review completed: 2026-02-13
- Findings: 6 total, 6 fixed, 0 skipped
- Resolution approach: auto-fix

### Findings Fixed:

1. **F1 (Critical)**: Race condition with stale `currentFen` in timeout closure - Added `currentFenRef` to track current FEN value
2. **F2 (Critical)**: Delay calculation could produce NaN/negative values - Added min/max normalization
3. **F3 (Critical)**: Effect race condition in position reset - Only reset if no pending timeout
4. **F4 (Important)**: Accessibility live region never updated ref - Added effect to update `lastAnnouncedMoveRef`
5. **F5 (Important)**: Error state not cleared on user moves - Added effect to clear error on FEN change
6. **F6 (Important)**: No validation of required `workerPath` - Added dev-mode warning for empty workerPath
