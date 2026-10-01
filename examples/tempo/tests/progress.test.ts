import assert from "node:assert/strict";
import test from "node:test";

import {
  completeLesson,
  EMPTY_PROGRESS,
  parseProgress,
} from "../src/progress.ts";

test("malformed and incompatible saved data recover safely", () => {
  for (const raw of [
    null,
    "broken",
    "null",
    '{"version":2}',
    '{"version":1,"completions":null}',
  ])
    assert.deepEqual(parseProgress(raw, ["one"]), EMPTY_PROGRESS);
});

test("saved progress is filtered, deduplicated and bounds the sprint score", () => {
  const valid = {
    id: "one",
    clean: true,
    completedAt: "2026-09-30T10:00:00.000Z",
  };
  const loaded = parseProgress(
    JSON.stringify({
      version: 1,
      completions: [
        null,
        valid,
        valid,
        { ...valid, id: "unknown" },
        { ...valid, completedAt: "nonsense" },
      ],
      bestSprint: 900,
    }),
    ["one"],
  );
  assert.deepEqual(loaded.completions, [valid]);
  assert.equal(loaded.bestSprint, 0);
});

test("revisiting a lesson preserves a previously unassisted completion", () => {
  const initial = completeLesson(
    EMPTY_PROGRESS,
    "one",
    true,
    new Date("2026-09-29T12:00:00Z"),
  );
  const updated = completeLesson(
    initial,
    "one",
    false,
    new Date("2026-09-30T12:00:00Z"),
  );
  assert.equal(updated.completions.length, 1);
  assert.equal(updated.completions[0].clean, true);
  assert.equal(initial.completions[0].completedAt, "2026-09-29T12:00:00.000Z");
  assert.deepEqual(parseProgress(JSON.stringify(updated), ["one"]), updated);
});
