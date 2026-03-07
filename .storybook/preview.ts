import type { Preview } from "@storybook/react-vite";
import "./styles.css";

const preview: Preview = {
  parameters: {
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
          "Theming",
          "Packages",
          [
            "react-chess-game",
            "react-chess-puzzle",
            "react-chess-clock",
            "react-chess-stockfish",
          ],
        ],
      },
    },
  },
};

export default preview;
