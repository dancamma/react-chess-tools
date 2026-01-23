import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import globals from "globals";

export default [
  { ignores: ["**/dist/*", "**/coverage/*", "**/storybook-static/*"] },

  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript recommended rules (new v8 approach)
  ...tseslint.configs.recommended,

  // React + TypeScript rules
  {
    plugins: {
      react,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Config files not in TypeScript project - disable type-aware linting
  {
    files: [
      ".storybook/**/*.{js,ts}",
      "jest.config.js",
      "jest.setup.js",
      "tsup.config.ts",
      "eslint.config.mjs",
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: null,
      },
      globals: {
        ...globals.node,
      },
    },
  },
];
