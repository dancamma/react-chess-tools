import type { Preview } from "@storybook/react-vite";
import "./styles.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: [
          "Getting Started",
          ["Introduction", "Installation", "Quick Start", "Core Concepts"],
          "Use Cases",
          "Theming",
          "Packages",
          "*",
        ],
      },
    },
  },
};

export default preview;
