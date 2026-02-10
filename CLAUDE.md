# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run a single test file
npx jest path/to/test.test.tsx

# Lint
npm run lint

# Type check
npm run test-types

# Run Storybook for development
npm run storybook

# Release (uses changesets)
npm run changeset    # Create a changeset
npm run version      # Apply changesets and bump versions
npm run release      # Publish to npm
```

## Architecture

This is an **npm workspaces monorepo** for building React components that help developers create chess applications. Current packages:

- `packages/react-chess-game` - Chess game component with sounds, move highlighting, keyboard controls
- `packages/react-chess-puzzle` - Chess puzzle component (depends on react-chess-game)
- `packages/react-chess-clock` - Standalone chess clock with Fischer/Delay/Bronstein timing and multi-period support

New packages can be added under `packages/` following the same patterns.

### Core Dependencies

- **chess.js** - Chess logic engine (game state, move validation, FEN handling)
- **react-chessboard** (v5) - Underlying board UI component
- **@radix-ui/react-slot** - Enables the asChild pattern

### Key Patterns

**Compound Components**: Components use the compound pattern (Radix UI style):

```tsx
<ChessGame.Root>
  <ChessGame.Board />
  <ChessGame.Sounds />
</ChessGame.Root>
```

**Context-based State**: Each package has a context provider in Root and exposes hooks:

- `useChessGame` - Creates game state (used in ChessGame.Root)
- `useChessGameContext` - Accesses game state from child components
- `useChessPuzzleContext` - Accesses puzzle state from child components
- `useChessClockContext` - Accesses clock state from child components

Context hooks throw descriptive errors when used outside their provider.

**Theme System**: Nested theme objects with deep merge utilities (lodash `merge`):

- `defaultGameTheme`, `lichessTheme`, `chessComTheme`
- `mergeTheme()` / `mergePuzzleTheme()` for partial overrides
- Themes use `DeepPartial<T>` for type-safe partial overrides

**AsChild Pattern**: Components support `asChild` prop via Radix Slot to render as custom elements.

**Ref Pattern for Callbacks**: Hooks like `useChessClock` and `useChessGame` store callbacks in refs to avoid triggering resets or recreating functions on every render. This prevents stale closure issues with timer intervals.

**Clock Integration**: `react-chess-game` optionally integrates `react-chess-clock` — the clock auto-starts on first move, pauses on game over, and switches after each move (configurable via `autoSwitchOnMove`).

### File Organization

Each package follows this structure:

- `src/index.ts` - Public exports
- `src/components/` - React components (compound component parts in `parts/` subdirectory)
- `src/hooks/` - Custom hooks (useChessGame, etc.)
- `src/theme/` - Theme definitions, context, presets, and merge utilities (only in packages that render the chessboard)
- `src/types/` - TypeScript type definitions (for domain types, not component props)
- `src/__tests__/` - Test files

### Code Style Preferences

**Component Props Types**: Define component prop types inline with the component file, not in a separate types file. Only shared domain types should be in `src/types/`. This keeps component-related types co-located with their implementation.

### Build

Uses **tsup** to bundle TypeScript. Each package outputs ESM and CJS formats with type definitions. React and React DOM are externalized as peer dependencies.

## Testing

- Jest with React Testing Library
- Tests in `__tests__` directories adjacent to components
- Prefer using real chess.js instead of mocking it
- Test environment: jsdom
- Module name mapper resolves `@react-chess-tools/*` to source for cross-package imports in tests
