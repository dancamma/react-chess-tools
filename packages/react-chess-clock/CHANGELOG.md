# @react-chess-tools/react-chess-clock

## 2.0.1

### Patch Changes

- 1797884: Fix several correctness bugs: history review at the start position can no longer append live moves; a cancelled Stockfish search no longer swallows the next bestmove; puzzles lock after solve/fail and during CPU ply; a clock flag freezes the board and bot; multi-period increment/delay follow the current period; addTime no longer refunds elapsed time while running or paused, and no longer decays after a flag.

  Note two consumer-visible changes in `react-chess-game`: `isLatestMove` now returns `false` at the start position when history exists (it previously returned `true`), and the game context exposes a new `isPlayable` field that gates board interaction.

## 2.0.0

### Major Changes

- 0c3df58: fix: prop sync and dependency restructuring

## 1.0.4

### Patch Changes

- df8dc01: chore: upgrade dependencies

## 1.0.3

### Patch Changes

- 5b74626: docs: add comprehensive documentation and Storybook redesign

## 1.0.2

### Patch Changes

- 1c4f876: docs: update README files
- e678d58: chore: update dependencies

## 1.0.1

### Patch Changes

- 93e1029: feat: add chess clock
