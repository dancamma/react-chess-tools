# AGENTS.md

Guidelines for agentic coding agents working in this repository.

## Commands

```bash
npm install                      # Install dependencies
npm run build                    # Build all packages
npm test                         # Run all tests
npm run test:watch               # Tests in watch mode
npm run test:coverage            # Tests with coverage
npx jest path/to/test.test.tsx   # Single test file
npm test -- packages/react-chess-game  # Specific package
npm run lint                     # Lint
npm run test-types               # Type check
npm run storybook                # Run Storybook
```

## Architecture

npm workspaces monorepo for React chess components:

- `react-chess-game` - Chess game with sounds, move highlighting, keyboard controls
- `react-chess-puzzle` - Puzzle component (depends on react-chess-game)
- `react-chess-clock` - Standalone chess clock with Fischer/Delay/Bronstein timing
- `react-chess-stockfish` - Stockfish engine integration with evaluation bar and PV lines

### Core Dependencies

- **chess.js** - Chess logic engine
- **react-chessboard** (v5) - Board UI component
- **@radix-ui/react-slot** - asChild pattern

### File Organization

```
packages/<name>/src/
├── index.ts              # Public exports
├── components/<Name>/    # React components
│   ├── index.ts          # Compound component export
│   ├── parts/            # Component parts (Root, Board, etc.)
│   └── __tests__/        # Tests adjacent to components
├── hooks/                # Custom hooks
├── types/                # Shared domain types (not component props)
├── utils/                # Utility functions
└── theme/                # Theme definitions (if applicable)
```

## Code Style

### Imports

Order: React → External libraries → Internal modules (blank lines between):

```tsx
import React, { useCallback, useMemo } from "react";
import { Chess, Color } from "chess.js";

import { useChessGameContext } from "../hooks/useChessGameContext";
```

### Component Props

Define prop types **inline** with the component. Only shared domain types go in `src/types/`:

```tsx
export interface BoardProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: ChessboardOptions;
}

export const Board = React.forwardRef<HTMLDivElement, BoardProps>(
  ({ options = {}, className, ...rest }, ref) => { ... }
);
```

### Naming

- **Components**: PascalCase (`Board`, `EvaluationBar`)
- **Hooks**: camelCase with `use` prefix (`useChessGame`)
- **Context**: PascalCase with `Context` suffix (`ChessGameContext`)
- **Types**: PascalCase (`PrincipalVariation`)
- **Constants**: UPPER_SNAKE_CASE

### Compound Components

```tsx
export const ChessGame = { Root, Board, Sounds };
Board.displayName = "ChessGame.Board";
```

### asChild Pattern

```tsx
import { Slot, Slottable } from "@radix-ui/react-slot";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, children, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component ref={ref} {...props}>
        <Slottable>{children}</Slottable>
      </Component>
    );
  },
);
```

### Context Hooks

Must throw descriptive errors when used outside provider:

```tsx
export function useChessClockContext(): UseChessClockReturn {
  const context = useContext(ChessClockContext);
  if (!context) {
    throw new Error(
      "useChessClockContext must be used within a ChessClock.Root component.",
    );
  }
  return context;
}
```

### Ref Pattern for Callbacks

Store state in refs to avoid stale closures with intervals:

```tsx
const stateRef = useRef(state);
stateRef.current = state;

const callback = useCallback(() => {
  const current = stateRef.current;
}, []);
```

### Error Handling

- try/catch for parsing/validation that may fail
- `console.error` with fallbacks for recoverable errors
- Throw for programming errors (missing context, invalid usage)

### Comments

Write comments that explain **why**, not **what**. Avoid restating what the code already expresses clearly:

```tsx
// Bad - restates the obvious
// Increment the counter
setCount(count + 1);

// Good - explains the reasoning
// Skip promotion dialog for computer moves to avoid UI blocking
if (isComputerMove) return "q";
```

Prefer self-documenting code over comments. Extract logic into well-named functions or variables when the intent isn't immediately clear.

## Testing

Jest + React Testing Library. Tests in `__tests__` adjacent to components. Prefer real chess.js over mocking.

```tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Component } from "../Component";

describe("Component", () => {
  it("should have correct displayName", () => {
    expect(Component.displayName).toBe("PackageName.Component");
  });
});
```

## Formatting

Prettier with default settings. Pre-commit hooks auto-format via lint-staged.

## Build

**tsup** bundles TypeScript to ESM/CJS with type definitions. React and React DOM are externalized as peer dependencies.
