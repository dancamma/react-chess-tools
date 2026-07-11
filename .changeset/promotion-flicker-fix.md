---
"@react-chess-tools/react-chess-game": patch
---

Fix the board replaying the previous position when a new position is loaded while a move animation is still in flight (e.g. solving a puzzle with a promotion move and immediately loading the next puzzle, #83). The board now remounts when a new position is loaded, discarding stale animation timers.
