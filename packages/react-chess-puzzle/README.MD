<div align="center">
    A lightweight, customizable React component library for rendering and interacting with chess puzzles.
</div>

## Project Description

This project is a React-based chess puzzle component that allows users to solve chess puzzles online. It is part of the `react-chess-tools` package and is designed to be easy to use and customizable. It is built on top of `react-chess-game` component.

## Preview

Visit the [demo](https://react-chess-tools.vercel.app/) to see the `react-chess-puzzle` component in action.

## Installation

To install the `react-chess-puzzle` package, run the following command:

```bash
$ npm install @react-chess-tools/react-chess-puzzle
```

## Usage

To use the `react-chess-puzzle` package, you can import the `ChessPuzzle` component and use it as follows:

```tsx
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";

const App = () => {
  <ChessPuzzle.Root puzzle={...}>
    <ChessPuzzle.Board />
  </ChessPuzzle.Root>;
};
```

## Documentation

The `react-chess-puzzle` package provides a set of components that you can use to build your chess app. The following sections describe the components and their usage.

### ChessPuzzle.Root

The `ChessPuzzle.Root` component is the root component of the `react-chess-puzzle` package. It is used to provide the `ChessPuzzleContext` to the rest of the components. It accept a `puzzle` prop that is used to instantiate the puzzle.

#### Props

The `ChessPuzzle.Root` component accepts the following props:

| Name        | Type        | Default | Description                 |
| ----------- | ----------- | ------- | --------------------------- |
| `puzzle`    | `Puzzle`    |         | The puzzle to be solved     |
| `children?` | `ReactNode` |         | The children to be rendered |

the `puzzle` prop contains the following properties:

| Name            | Type       | Default | Description                                                                |
| --------------- | ---------- | ------- | -------------------------------------------------------------------------- |
| `fen`           | `string`   |         | The FEN string of the puzzle                                               |
| `moves`         | `string[]` |         | The moves of the puzzle                                                    |
| `makeFirstMove` | `boolean`  | `false` | Whether the first move is part of the problem or must be played by the CPU |

### ChessPuzzle.Board

The `ChessPuzzle.Board` component is used to render the chess board. It is a wrapper around the `ChessGame.Board` component and accepts the same props.

### Using react-chess-game Components

Since `react-chess-puzzle` is built on top of `react-chess-game`, you can use any of its components within your puzzle interface. This includes:

- `ChessGame.Sounds` - Add sound effects for moves/captures
- `ChessGame.KeyboardControls` - Add keyboard navigation
- `useChessGameContext` - Access game state and methods

Example usage with sounds and keyboard controls:

```tsx
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";
import { ChessGame } from "@react-chess-tools/react-chess-game";

const App = () => (
  <ChessPuzzle.Root puzzle={...}>
    <ChessGame.Sounds />
    <ChessGame.KeyboardControls />
    <ChessPuzzle.Board />
  </ChessPuzzle.Root>
);
```

### `Puzzle.Reset`

A button that changes the puzzle. It can be used, for example, to restart the puzzle or move to the next puzzle.

#### Props

| Name      | Type                                                       | Default | Description                                                                                                                                                                                                   |
| --------- | ---------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `puzzle`  | `Puzzle`                                                   |         | The puzzle object containing the FEN string and moves sequence. If not provided, the current puzzle is reset.                                                                                                 |
| `onReset` | `() => void`                                               |         | A callback function that is called when the puzzle is reset.                                                                                                                                                  |
| `showOn`  | `"not-started" \| "in-progress" \| "solved" \| "failed"[]` |         | The state(s) in which the button is shown.                                                                                                                                                                    |
| `asChild` | `boolean`                                                  | `false` | Change the component to the HTML tag or custom component of the only child. This will merge the original component props with the props of the supplied element/component and change the underlying DOM node. |

### `Puzzle.Hint`

A button that shows the next move of the puzzle.

#### Props

| Name      | Type                                                       | Default | Description                                                                                                                                                                                                   |
| --------- | ---------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `showOn`  | `"not-started" \| "in-progress" \| "solved" \| "failed"[]` |         | The state(s) in which the button is shown.                                                                                                                                                                    |
| `asChild` | `boolean`                                                  | `false` | Change the component to the HTML tag or custom component of the only child. This will merge the original component props with the props of the supplied element/component and change the underlying DOM node. |

## 📝 License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.

## Show your support

Give a ⭐️ if this project helped you!
