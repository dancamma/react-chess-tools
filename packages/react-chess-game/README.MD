<div align="center">
  <p>

  </p>
  <p>
    <a href="https://github.com/Clariity/react-chessboard" target="blank">react-chessboard</a> + <a href="https://github.com/jhlywa/chess.js" target="blank">chess.js</a> + nice defaults
    </p>
    <p>
    An easy-customizable, ready-to-use chess game component for React.
</div>

## Project Description

This project is a React-based chess game that allows users to play chess online. It is part of the `react-chess-tools` package and is designed to be easy to use and customizable. It is built on top of the `react-chessboard` and `chess.js` packages, and provides a nice default configuration for the chess game, including:

- Sounds
- Move-by-click
- Square highlighting
- Keyboard controls

It is build using an approach similar to the one used in the `radix-ui`, where the `ChessGame` component is built using a `ChessGameContext` that you can use to customize and ehance the component game. Is also provides a set of default components that you can use to build your next chess app.

## Preview

Visit the [demo](https://react-chess-tools.vercel.app/) to see the `react-chess-game` component in action.

## Installation

To install the `react-chess-game` package, run the following command:

```bash
$ npm install @react-chess-tools/react-chess-game
```

## Usage

To use the `react-chess-game` package, you can import the `ChessGame` component and use it as follows:

```tsx
import { ChessGame } from "@react-chess-tools/react-chess-game";

const App = () => {
  <ChessGame.Root>
    <ChessGame.Board />
  </ChessGame.Root>;
};
```

## Documentation

The `react-chess-game` package provides a set of components that you can use to build your chess app. The following sections describe the components and their usage.

### ChessGame.Root

The `ChessGame.Root` component is the root component of the `react-chess-game` package. It is used to provide the `ChessGameContext` to the rest of the components. It also provides a set of default values for the `ChessGameContext` that you can customize. It instantiates a `Chess` instance using the `fen` prop and provides it to the `ChessGameContext`.

#### Props

The `ChessGame.Root` component accepts the following props:

| Name        | Type       | Default          | Description                                     |
| ----------- | ---------- | ---------------- | ----------------------------------------------- |
| children    | React.FC   |                  | The children of the `ChessGame.Root` component. |
| fen         | string     | initial position | The FEN of the chess game.                      |
| orientation | "w" \| "b" | "white"          | The orientation of the chess game.              |

### ChessGame.Board

The `ChessGame.Board` component is the main component of the `react-chess-game` package. It is used to render the chess board and the pieces. It uses the `ChessGameContext` to get the `Chess` instance and the `orientation` of the game.

#### Props

All the props from Chessboard.js are supported. You can find the full list of props [here](https://github.com/Clariity/react-chessboard#props).

### ChessGame.Sounds

The `ChessGame.Sounds` component is used to provide the sounds for the chess game. By default, it uses the sounds from the `react-chess-sounds` package, but you can provide your own sounds. Sounds must be provided as base 64 encoded strings.

#### Props

The `ChessGame.Sounds` component accepts the following props:

| Name     | Type   | Default | Description                                       |
| -------- | ------ | ------- | ------------------------------------------------- |
| check    | string |         | The sound to play when a player is in check.      |
| move     | string |         | The sound to play when a player makes a move.     |
| capture  | string |         | The sound to play when a player captures a piece. |
| gameOver | string |         | The sound to play when the game is over.          |

### ChessGame.KeyboardControls

The `ChessGame.KeyboardControls` component is used to provide keyboard controls for navigating through the chess game. By default, it enables arrow key controls for moving through game history, but you can customize the key bindings.

#### Props

The `ChessGame.KeyboardControls` component accepts the following props:

| Name     | Type             | Default                 | Description                                                                                                                                                              |
| -------- | ---------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| controls | KeyboardControls | defaultKeyboardControls | Object mapping key names to handler functions. The default controls are: ArrowLeft (previous move), ArrowRight (next move), ArrowUp (go to start), ArrowDown (go to end) |

### useChessGameContext

The `useChessGameContext` hook is used to get the `ChessGameContext` from the `ChessGame.Root` component. It can be used to customize the chess game.

#### Returns

The `useChessGameContext` hook returns the following values:

| Name        | Type       | Description                                                                            |
| ----------- | ---------- | -------------------------------------------------------------------------------------- |
| chess       | Chess      | The `Chess` instance of the chess game.                                                |
| orientation | "w" \| "b" | The orientation of the chess game.                                                     |
| methods     | Methods    | The methods you can use to interact with the chess game.                               |
| info        | Info       | The info of the chess game, calculated using the chess instance using chess.js methods |

#### Methods

The `useChessGameContextContext` hook returns the following methods:

| Name             | Type                        | Description                                  |
| ---------------- | --------------------------- | -------------------------------------------- |
| makeMove         | (move: string) => void      | Makes a move in the chess game.              |
| setPostion       | (fen: string) => void       | Sets the position of the chess game.         |
| flipBoard        | () => void                  | Flips the board.                             |
| goToMove         | (moveIndex: number) => void | Goes to a specific move in the game history. |
| goToStart        | () => void                  | Goes to the starting position.               |
| goToEnd          | () => void                  | Goes to the latest position.                 |
| goToPreviousMove | () => void                  | Goes to the previous move.                   |
| goToNextMove     | () => void                  | Goes to the next move.                       |

#### Info

The `useChessGameContext` hook returns the following info:

| Name                   | Type       | Description                                                                |
| ---------------------- | ---------- | -------------------------------------------------------------------------- |
| turn                   | "w" \| "b" | The turn of the chess game                                                 |
| isPlayerTurn           | boolean    | Whether it is the player's turn                                            |
| isOpponentTurn         | boolean    | Whether it is the opponent's turn                                          |
| moveNumber             | number     | The number of the current move                                             |
| lastMove               | Move       | The last move made in the chess game                                       |
| isCheck                | boolean    | Whether the player is in check                                             |
| isCheckmate            | boolean    | Whether the player is in checkmate                                         |
| isDraw                 | boolean    | Whether the game is a draw                                                 |
| isStalemate            | boolean    | Whether the game is a stalemate                                            |
| isThreefoldRepetition  | boolean    | Whether the game is a threefold repetition                                 |
| isInsufficientMaterial | boolean    | Whether the game is a insufficient material                                |
| isGameOver             | boolean    | Whether the game is over                                                   |
| isDrawn                | boolean    | Whether the game is drawn                                                  |
| hasPlayerWon           | boolean    | Whether the player (the side specified in the `orientation` prop) has won  |
| hasPlayerLost          | boolean    | Whether the player (the side specified in the `orientation` prop) has lost |
| currentFen             | string     | The current FEN string representing the board position                     |
| currentPosition        | string     | The current move in the game history                                       |
| currentMoveIndex       | number     | The index of the current move in the game history                          |
| isLatestMove           | boolean    | Whether the current position is the latest move in the game                |
| game                   | Chess      | The underlying Chess.js instance                                           |

## 📝 License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.

## Show your support

Give a ⭐️ if this project helped you!
