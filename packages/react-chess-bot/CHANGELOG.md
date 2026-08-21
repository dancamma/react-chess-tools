# @react-chess-tools/react-chess-bot

## 2.0.1

### Patch Changes

- 1797884: Fix several correctness bugs: history review at the start position can no longer append live moves; a cancelled Stockfish search no longer swallows the next bestmove; puzzles lock after solve/fail and during CPU ply; a clock flag freezes the board and bot; multi-period increment/delay follow the current period; addTime no longer refunds elapsed time while running or paused, and no longer decays after a flag.

  Note two consumer-visible changes in `react-chess-game`: `isLatestMove` now returns `false` at the start position when history exists (it previously returned `true`), and the game context exposes a new `isPlayable` field that gates board interaction.

- Updated dependencies [1797884]
  - @react-chess-tools/react-chess-game@2.0.1
  - @react-chess-tools/react-chess-stockfish@2.0.1

## 2.0.0

### Major Changes

- 0c3df58: fix: prop sync and dependency restructuring

### Patch Changes

- Updated dependencies [5db15e8]
- Updated dependencies [0c3df58]
- Updated dependencies [fb50ea5]
- Updated dependencies [da6ce4d]
- Updated dependencies [ea81945]
  - @react-chess-tools/react-chess-game@2.0.0
  - @react-chess-tools/react-chess-stockfish@2.0.0

## 1.0.1

### Patch Changes

- 333c1ff: feat: add react-chess-bot package
- Updated dependencies [333c1ff]
  - @react-chess-tools/react-chess-stockfish@1.0.5
