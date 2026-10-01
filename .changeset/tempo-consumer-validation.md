---
"@react-chess-tools/react-chess-game": minor
"@react-chess-tools/react-chess-puzzle": minor
---

Fix Node ESM/CommonJS imports of the built packages, and validate packed exports with server rendering in CI. Bundle react-chessboard to avoid its incorrectly classified CommonJS entry while keeping React external.

Add disabled game/puzzle roots and puzzle hint notifications. Count all accepted solution plies, including CPU replies and the final move, in movesPlayed. Wrong moves do not increase the count.

Give promotion choices localizable accessible names, keyboard focus containment, Escape cancellation, and focus restoration. Clear pending promotions when a position changes or input is disabled.
