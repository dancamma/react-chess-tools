---
"@react-chess-tools/react-chess-game": minor
"@react-chess-tools/react-chess-puzzle": minor
"@react-chess-tools/react-chess-bot": minor
"@react-chess-tools/react-chess-stockfish": patch
"@react-chess-tools/react-chess-clock": patch
---

Correctness fixes and honest React peer ranges.

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
