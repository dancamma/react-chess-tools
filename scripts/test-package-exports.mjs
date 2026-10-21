import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const scratch = mkdtempSync(join(tmpdir(), "chess-package-exports-"));
const packages = ["clock", "stockfish", "game", "puzzle", "bot"];

try {
  const modules = join(scratch, "node_modules");
  mkdirSync(join(modules, "@react-chess-tools"), { recursive: true });
  // Only runtime dependencies are shared; the tested packages come from npm tarballs.
  for (const entry of readdirSync(join(root, "node_modules"))) {
    if (entry.startsWith(".") || entry === "@react-chess-tools") continue;
    symlinkSync(join(root, "node_modules", entry), join(modules, entry), "dir");
  }
  for (const name of packages) {
    const [packed] = JSON.parse(
      execFileSync(
        "npm",
        [
          "pack",
          "--json",
          "--ignore-scripts",
          "--pack-destination",
          scratch,
          "--cache",
          join(scratch, "cache"),
        ],
        {
          cwd: join(root, "packages", `react-chess-${name}`),
          encoding: "utf8",
        },
      ),
    );
    assert.ok(packed.files.some((file) => file.path === "dist/index.js"));
    const destination = join(
      modules,
      "@react-chess-tools",
      `react-chess-${name}`,
    );
    mkdirSync(destination);
    execFileSync("tar", [
      "-xzf",
      join(scratch, packed.filename),
      "--strip-components=1",
      "-C",
      destination,
    ]);
  }
  const probe = `
    import assert from "node:assert/strict";
    import { createRequire } from "node:module";
    import React from "react";
    import { renderToString } from "react-dom/server";
    const require = createRequire(import.meta.url);
    for (const name of ${JSON.stringify(packages)}) {
      const id = "@react-chess-tools/react-chess-" + name;
      for (const [format, load] of [["ESM", () => import(id)], ["CJS", () => require(id)]]) {
        const library = await load();
        assert.ok(Object.keys(library).length > 0);
        if (name === "game") {
          assert.equal(library.mergeTheme({ state: { check: "red" } }).state.check, "red");
          assert.ok(renderToString(React.createElement(library.ChessGame.Root, null, React.createElement(library.ChessGame.Board))).length > 0);
        }
        if (name === "puzzle") {
          const puzzle = { fen: "6k1/5ppp/8/8/8/8/6PP/4R1K1 w - - 0 1", moves: ["e1e8"] };
          assert.ok(renderToString(React.createElement(library.ChessPuzzle.Root, { puzzle }, React.createElement(library.ChessPuzzle.Board))).length > 0);
        }
        console.log(id + " " + format + " OK");
      }
    }
  `;
  const probePath = join(scratch, "probe.mjs");
  writeFileSync(probePath, probe);
  execFileSync(process.execPath, [probePath], { stdio: "inherit" });
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
