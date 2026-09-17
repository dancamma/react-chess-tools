# @react-chess-tools/react-chess-stockfish

## 2.0.2

### Patch Changes

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

## 2.0.1

### Patch Changes

- 1797884: Fix several correctness bugs: history review at the start position can no longer append live moves; a cancelled Stockfish search no longer swallows the next bestmove; puzzles lock after solve/fail and during CPU ply; a clock flag freezes the board and bot; multi-period increment/delay follow the current period; addTime no longer refunds elapsed time while running or paused, and no longer decays after a flag.

  Note two consumer-visible changes in `react-chess-game`: `isLatestMove` now returns `false` at the start position when history exists (it previously returned `true`), and the game context exposes a new `isPlayable` field that gates board interaction.

## 2.0.0

### Major Changes

- 0c3df58: fix: prop sync and dependency restructuring

## 1.0.5

### Patch Changes

- 333c1ff: feat: add react-chess-bot package

## 1.0.4

### Patch Changes

- 8e1a4ab: feat(stockfish): add multi-engine support with Fairy-Stockfish

## 1.0.3

### Patch Changes

- df8dc01: chore: upgrade dependencies

## 1.0.2

### Patch Changes

- 5b74626: docs: add comprehensive documentation and Storybook redesign

## 1.0.1

### Patch Changes

- f37ec0a: feat: add react-chess-stockfish
