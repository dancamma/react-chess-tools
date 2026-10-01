import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: ["esm", "cjs"],
  external: ["react", "react-dom"],
  // The dependency ships a CommonJS .js entry inside a type:module package.
  noExternal: ["react-chessboard"],
  dts: true,
  loader: {
    ".ogg": "dataurl",
  },
});
