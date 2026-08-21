# @react-chess-tools/react-chess-game

## 2.1.0

### Minor Changes

- dc09e01: Correctness fixes and honest React peer ranges.

  - `react-chess-puzzle`: a puzzle whose FEN carries an en-passant square no longer
    hangs. chess.js re-serializes FENs and drops an unusable ep square, so the raw
    string compare never matched and a `makeFirstMove` puzzle never played its
    first move, leaving the board unplayable.
  - `react-chess-puzzle`: the context now describes the puzzle set through
    `changePuzzle`, not the `puzzle` prop, so `puzzle`, `totalMoves`, `resetPuzzle`
    and the `onSolve`/`onFail` payload stay consistent after a puzzle change.
  - `react-chess-game`: history review no longer draws the live position's
    last-move and check highlights on the position being reviewed.
  - `react-chess-game`: `goToNextMove` no longer advances past an empty history
    after `setPosition`, which used to freeze every piece.
  - `react-chess-stockfish`: a `bestmove` that arrives after its search was
    superseded is no longer published as the new position's result.
  - `react-chess-stockfish`: a relative `workerPath` is accepted on any plain-http
    dev origin, not just `localhost`/`127.0.0.1`.
  - `react-chess-bot`: an inline `workerOptions.onError` no longer re-creates the
    engine on every render, which previously prevented the bot from ever moving
    while a clock was running.
  - `react-chess-game`, `react-chess-puzzle`, `react-chess-bot`: React peer range
    narrowed to `^19.0.0`. `react-chessboard@5` peers on React 19 only, so the
    advertised `>=16.14.0` could never be installed.
  - `react-chess-clock`: `ChessClock.PlayPause` is disabled in the default
    `clockStart: "delayed"` mode; the docs and example now say so.

### Patch Changes

- Updated dependencies [dc09e01]
  - @react-chess-tools/react-chess-clock@2.0.2

## 2.0.1

### Patch Changes

- 1797884: Fix several correctness bugs: history review at the start position can no longer append live moves; a cancelled Stockfish search no longer swallows the next bestmove; puzzles lock after solve/fail and during CPU ply; a clock flag freezes the board and bot; multi-period increment/delay follow the current period; addTime no longer refunds elapsed time while running or paused, and no longer decays after a flag.

  Note two consumer-visible changes in `react-chess-game`: `isLatestMove` now returns `false` at the start position when history exists (it previously returned `true`), and the game context exposes a new `isPlayable` field that gates board interaction.

- Updated dependencies [1797884]
  - @react-chess-tools/react-chess-clock@2.0.1

## 2.0.0

### Major Changes

- 0c3df58: fix: prop sync and dependency restructuring
- da6ce4d: feat(react-chess-game): redesign sound system with AudioManager

### Patch Changes

- 5db15e8: fix: inline bundled audio as data URIs so default sounds work in consumer apps, restore deselection clicks not emitting illegal-move events, and skip replaying stale game events when Sounds mounts mid-game
- fb50ea5: Fix the board replaying the previous position when a new position is loaded while a move animation is still in flight (e.g. solving a puzzle with a promotion move and immediately loading the next puzzle, #83). The board now remounts when a new position is loaded, discarding stale animation timers.
- ea81945: fix: sound and keyboard control improvements
- Updated dependencies [0c3df58]
  - @react-chess-tools/react-chess-clock@2.0.0

## 1.0.5

### Patch Changes

- df8dc01: chore: upgrade dependencies
- Updated dependencies [df8dc01]
  - @react-chess-tools/react-chess-clock@1.0.4

## 1.0.4

### Patch Changes

- 5b74626: docs: add comprehensive documentation and Storybook redesign
- Updated dependencies [5b74626]
  - @react-chess-tools/react-chess-clock@1.0.3

## 1.0.3

### Patch Changes

- 1c4f876: docs: update README files
- e678d58: chore: update dependencies
- Updated dependencies [1c4f876]
- Updated dependencies [e678d58]
  - @react-chess-tools/react-chess-clock@1.0.2

## 1.0.2

### Patch Changes

- 93e1029: feat: add chess clock
- Updated dependencies [93e1029]
  - @react-chess-tools/react-chess-clock@1.0.1

## 1.0.1

### Patch Changes

- f9b7665: feat: add ref forwarding, HTML attributes, and improved asChild pattern

## 1.0.0

### Major Changes

- b8f72df: Add comprehensive theming system with ThemeProvider, preset themes (Default, Lichess, Chess.com), Storybook documentation with interactive playgrounds, and comprehensive tests.

### Minor Changes

- 8f16568: Add dual package ESM + CJS support with conditional exports for better compatibility across different environments and build tools.
- 15482ec: Upgrade dependencies including ESLint 9, TypeScript-ESLint 8, Jest 30, React 19.2.3, chess.js 1.4.0, and more.

### Patch Changes

- b38be2f: Add automated release workflow with modern CI/CD pipeline. Fix changesets config and simplify package.json scripts.

## 0.5.2

### Patch Changes

- 9d33423: Fix PuzzleBoard options merging

## 0.5.1

### Patch Changes

- f50ac0f: feat: improve chessboard options merging with deep merge utility

## 0.5.0

### Minor Changes

- f58c1ac: chore: upgrade to react-chessboard v5

### Patch Changes

- 95cf0c3: docs: update README documentation for react-chess-tools packages
- a877019: fix: handle sound playback errors gracefully

## 0.4.2

### Patch Changes

- f18ce4b: fix: improve error messages for context hook usage

## 0.4.1

### Patch Changes

- 755a85d: fix: export missing TypeScript types and component props
- a9c69b5: test: add unit tests
- 5ed0baf: fix: fix SSR compatibility and prevent unnecessary sound re-renders
- c3ac738: fix: fix state management and lifecycle issues in chess components

## 0.4.0

### Minor Changes

- a161f18: Add keyboard controls

### Patch Changes

- 706b5ec: Upgrade dependencies (June 2024)

## 0.3.1

### Patch Changes

- 17805de: fix: fix captures highlight

## 0.3.0

### Minor Changes

- 3a9745f: Upgrade dependencies (June 2024)

## 0.2.1

### Patch Changes

- a2ff2f3: fixed Cannot update a component (Root) while rendering a different component (PuzzleRoot) error

## 0.2.0

### Minor Changes

- ea0eafb: Add changesets versioning
  setup `changesets` and created the first changeset for the available packages. Removed release-it
