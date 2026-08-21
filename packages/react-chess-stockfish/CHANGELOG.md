# @react-chess-tools/react-chess-stockfish

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
