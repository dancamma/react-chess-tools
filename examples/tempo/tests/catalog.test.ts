import assert from "node:assert/strict";
import test from "node:test";
import { Chess } from "chess.js";

import { COLLECTIONS, LESSONS, getLessons } from "../src/catalog.ts";

test("all curated solutions are legal, end on a player move and achieve their objective", () => {
  assert.equal(
    new Set(LESSONS.map((lesson) => lesson.id)).size,
    LESSONS.length,
  );
  for (const lesson of LESSONS) {
    const game = new Chess(lesson.puzzle.fen);
    assert.equal(
      game.isGameOver(),
      false,
      `${lesson.id}: starting position must be playable`,
    );
    assert.equal(lesson.puzzle.moves.length % 2, 1);
    for (const move of lesson.puzzle.moves)
      assert.ok(game.move(move), `${lesson.id}: ${move}`);
    if (lesson.id === "fork") assert.equal(game.get("d5")?.type, "n");
    else assert.equal(game.isCheckmate(), true, lesson.id);
  }
});

test("collections cover every position exactly once", () => {
  const ids = COLLECTIONS.flatMap((collection) => [...collection.ids]);
  assert.deepEqual([...ids].sort(), LESSONS.map((lesson) => lesson.id).sort());
  assert.equal(getLessons(ids).length, LESSONS.length);
  assert.throws(() => getLessons(["missing"]), /Unknown lesson/);
});

test("underpromotion to rook also delivers the promised mate", () => {
  const lesson = LESSONS.find((item) => item.id === "promotion")!;
  const game = new Chess(lesson.puzzle.fen);
  game.move("f7f8r");
  assert.equal(game.isCheckmate(), true);
});
