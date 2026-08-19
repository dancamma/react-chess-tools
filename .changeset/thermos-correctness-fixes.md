---
"@react-chess-tools/react-chess-game": patch
"@react-chess-tools/react-chess-clock": patch
"@react-chess-tools/react-chess-puzzle": patch
"@react-chess-tools/react-chess-stockfish": patch
"@react-chess-tools/react-chess-bot": patch
---

Fix several correctness bugs: history review at the start position can no longer append live moves; a cancelled Stockfish search no longer swallows the next bestmove; puzzles lock after solve/fail and during CPU ply; a clock flag freezes the board and bot; multi-period increment/delay follow the current period; addTime while running no longer refunds elapsed time.
