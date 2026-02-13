import { createRequire } from "node:module";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: [
    "../packages/**/*.mdx",
    "../packages/**/*.stories.@(js|jsx|ts|tsx)",
  ],

  staticDirs: ["../.storybook/public"],

  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-docs"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  docs: {},

  typescript: {
    reactDocgen: "react-docgen-typescript",
  },

  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          "@story-helpers": resolve(__dirname, "helpers.tsx"),
          "@story-helpers/stockfish": resolve(
            __dirname,
            "stockfish-helpers.tsx",
          ),
        },
      },
    });
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, "package.json")));
}
