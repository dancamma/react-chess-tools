import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts", "./src/utils-entry.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["esm", "cjs"],
  external: ["react", "react-dom", "chess.js"],
  dts: true,
});
