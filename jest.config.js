module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/packages"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@react-chess-tools/react-chess-game$":
      "<rootDir>/packages/react-chess-game/src/index.ts",
    "^@react-chess-tools/react-chess-puzzle$":
      "<rootDir>/packages/react-chess-puzzle/src/index.ts",
    "^@react-chess-tools/react-chess-clock$":
      "<rootDir>/packages/react-chess-clock/src/index.ts",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "packages/**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/*.stories.{ts,tsx}",
    "!**/*.stories.*.{ts,tsx}",
    "!**/tsup.config.ts",
    "!**/index.ts",
  ],
};
