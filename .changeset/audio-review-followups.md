---
"@react-chess-tools/react-chess-game": patch
---

fix: inline bundled audio as data URIs so default sounds work in consumer apps, restore deselection clicks not emitting illegal-move events, and skip replaying stale game events when Sounds mounts mid-game
