---
title: Storybook Redesign - Architecture & Implementation Plan
description: Complete redesign of Storybook as a developer adoption tool and library showcase
author: Paige (Technical Writer)
date: 2026-02-18
---

# Storybook Redesign: Architecture & Implementation Plan

## Executive Summary

Transform Storybook from a development sandbox into a **developer adoption engine**. The new design balances an impressive interactive landing experience with comprehensive package documentation, following a hybrid structure that guides users from "wow" to "how".

---

## Target Audience & Goals

### Primary Audience

**JavaScript/React Developers** evaluating chess UI solutions who need to:

- Quickly assess if this library meets their needs
- Understand integration complexity
- See real-world examples of composition

### Goals

1. **Capture Attention**: Landing page that immediately demonstrates capability
2. **Guide Adoption**: Clear path from "impressed" to "implementing"
3. **Reduce Friction**: Copy-paste examples for common use cases
4. **Build Confidence**: Comprehensive documentation shows maturity

---

## New Information Architecture

```
Storybook
│
├── 🏠 Home                          [Landing Page - Interactive Demo]
│   └── Full-featured chess experience
│
├── 🚀 Getting Started               [MDX Documentation]
│   ├── Introduction.mdx
│   ├── Installation.mdx
│   ├── Quick Start.mdx
│   └── Core Concepts.mdx
│
├── 📋 Use Cases                      [Stories with Integration Examples]
│   ├── Build a Chess Game
│   │   ├── Basic Game
│   │   ├── Game with Clock
│   │   ├── Game with Analysis
│   │   └── Full Featured App
│   ├── Create Puzzles
│   │   ├── Simple Puzzle
│   │   ├── Puzzle with Hints
│   │   └── Puzzle Platform
│   └── Build Analysis Tools
│       ├── Position Analysis
│       ├── Engine Evaluation
│       └── Game Review
│
├── 📦 Packages                       [Deep-dive Documentation]
│   ├── react-chess-game/
│   │   ├── Overview.mdx
│   │   ├── API Reference.mdx
│   │   ├── Components/
│   │   │   ├── Root
│   │   │   ├── Board
│   │   │   ├── Sounds
│   │   │   ├── KeyboardControls
│   │   │   └── Clock (nested)
│   │   ├── Hooks/
│   │   │   ├── useChessGame
│   │   │   └── useChessGameContext
│   │   └── Theming/
│   │       ├── Theme System
│   │       ├── Presets
│   │       └── Custom Themes
│   ├── react-chess-puzzle/
│   │   └── [same structure]
│   ├── react-chess-clock/
│   │   └── [same structure]
│   └── react-chess-stockfish/
│       └── [same structure]
│
└── 🎨 Theming                        [Cross-cutting Concern]
    ├── Theme System Overview
    ├── Preset Gallery
    └── Custom Theme Builder
```

---

## Section Specifications

### 1. Home - Interactive Landing Page

**Purpose**: Immediately demonstrate the library's full potential.

**Implementation**: Single story with maximum feature integration.

**Components**:

```tsx
// Home.stories.tsx
// Note: ChessStockfish wraps ChessGame to share FEN state
<ChessStockfish.Root
  fen={fen}
  onFenChange={setFen}
  workerOptions={{ workerPath: "/stockfish.js" }}
>
  <ChessGame.Root
    fen={fen}
    onMove={handleMove}
    timeControl={{ time: "5+3", clockStart: "firstMove" }}
  >
    {/* Left Panel: Evaluation */}
    <ChessStockfish.EvaluationBar showEvaluation />

    {/* Center: The Board */}
    <ChessGame.Board />
    <ChessGame.Sounds />
    <ChessGame.KeyboardControls />

    {/* Right Panel: Engine Analysis */}
    <ChessStockfish.EngineLines maxLines={3} />

    {/* Bottom: Clocks */}
    <ChessGame.Clock.Display color="white" />
    <ChessGame.Clock.Display color="black" />
  </ChessGame.Root>
</ChessStockfish.Root>
```

**Layout**:

```
┌─────────────────────────────────────────────────────────────┐
│                    react-chess-tools                        │
│           Build beautiful chess experiences                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌──────┐                              ┌──────────────┐   │
│    │ eval │    ┌──────────────────┐     │ Engine Lines │   │
│    │ bar  │    │                  │     │ 1. e4 +0.3   │   │
│    │      │    │   CHESS BOARD    │     │ 2. d4 +0.2   │   │
│    │      │    │                  │     │ 3. Nf3 +0.1  │   │
│    └──────┘    └──────────────────┘     └──────────────┘   │
│                                                             │
│         ┌────────────┐      ┌────────────┐                 │
│         │   05:03    │      │   05:00    │                 │
│         │   White    │      │   Black    │                 │
│         └────────────┘      └────────────┘                 │
│                                                             │
│    [Play vs Engine]  [Solve Puzzle]  [Analyze Position]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features**:

- Live playable board
- Real-time Stockfish evaluation
- Active clock
- Sound effects
- Keyboard shortcuts (shown inline)
- CTA buttons linking to Use Cases

---

### 2. Getting Started - MDX Documentation

**Purpose**: Guide developers from zero to first working implementation.

#### 2.1 Introduction.mdx

````mdx
import { Meta } from "@storybook/blocks";

<Meta title="Getting Started/Introduction" />

# Welcome to react-chess-tools

Build beautiful, accessible chess applications in minutes.

## Why react-chess-tools?

- **Compound Components**: Compose your UI exactly how you want it
- **Type-Safe**: Full TypeScript support with intelligent autocomplete
- **Accessible**: Keyboard navigation and screen reader friendly
- **Theming**: Presets for Lichess, Chess.com, or build your own
- **Engine Integration**: Built-in Stockfish support for analysis

## What's Included

| Package               | Purpose                              |
| --------------------- | ------------------------------------ |
| react-chess-game      | Core game board with move validation |
| react-chess-puzzle    | Interactive puzzle solving           |
| react-chess-clock     | Tournament-grade timing controls     |
| react-chess-stockfish | Engine analysis and evaluation       |

## Quick Example

```tsx
import { ChessGame } from "@react-chess-tools/react-chess-game";

function App() {
  return (
    <ChessGame.Root>
      <ChessGame.Board />
      <ChessGame.Sounds />
    </ChessGame.Root>
  );
}
```
````

That's it. You have a fully functional chess board.

````

#### 2.2 Installation.mdx

Package installation instructions for each package.

#### 2.3 Quick Start.mdx

Step-by-step guide for common scenarios with copy-paste code.

#### 2.4 Core Concepts.mdx

Explain the architectural patterns:

- Compound Component Pattern
- Context-based State
- asChild Pattern
- Theme System
- Package Composition

---

### 3. Use Cases - Integration Stories

**Purpose**: Show how packages work together for real-world scenarios.

#### 3.1 Build a Chess Game

**Story: Basic Game**

```tsx
// Simple board with sounds
<ChessGame.Root>
  <ChessGame.Board />
  <ChessGame.Sounds />
</ChessGame.Root>
````

**Story: Game with Clock**

```tsx
// 5+3 Blitz game
<ChessGame.Root timeControl={{ time: "5+3" }}>
  <div className="clock-row">
    <ChessGame.Clock.Display color="white" />
    <ChessGame.Clock.Display color="black" />
  </div>
  <ChessGame.Board />
</ChessGame.Root>
```

**Story: Game with Analysis**

```tsx
// Board + Stockfish - Stockfish wraps Game for FEN sync
<ChessStockfish.Root
  fen={fen}
  onFenChange={setFen}
  workerOptions={{ workerPath: "/stockfish.js" }}
>
  <ChessGame.Root fen={fen} onMove={handleMove}>
    <ChessStockfish.EvaluationBar showEvaluation />
    <ChessGame.Board />
    <ChessStockfish.EngineLines maxLines={3} />
  </ChessGame.Root>
</ChessStockfish.Root>
```

**Story: Full Featured App**

All features combined - essentially mirrors the Landing Page but as a reference implementation with annotations.

#### 3.2 Create Puzzles

Similar progression: Simple → Hint System → Full Platform

#### 3.3 Build Analysis Tools

Position analysis, game review, engine comparison

---

### 4. Packages - Deep Documentation

Each package follows the same documentation structure:

#### Overview.mdx

- What the package does
- When to use it
- Dependencies
- Peer dependencies

#### API Reference.mdx

Complete props documentation with:

- Type definitions
- Default values
- Examples

#### Components/

Individual stories for each component:

- All variants
- Edge cases
- Composition examples

#### Hooks/

- Hook signature
- Return values
- Usage examples
- Common patterns

#### Theming/

- Theme structure
- Available presets
- Custom theme examples

---

### 5. Theming - Cross-Cutting

**Theme System Overview**: How theming works across packages

**Preset Gallery**: Visual comparison of all presets

**Custom Theme Builder**: Interactive story where users can modify colors and see results in real-time

---

## Implementation Checklist

### Phase 1: Foundation

- [x] Create new folder structure in Storybook
- [x] Update `.storybook/main.ts` story paths
- [x] Update Tailwind CSS source paths

### Phase 2: Landing Page

- [x] Build `Home.stories.tsx` with full integration
- [x] Design responsive layout for board + analysis panels
- [x] Add CTA buttons linking to Use Cases
- [x] Configure as default Storybook landing

### Phase 3: Getting Started Docs

- [x] Write Introduction.mdx
- [x] Write Installation.mdx
- [x] Write Quick Start.mdx
- [x] Write Core Concepts.mdx

### Phase 4: Use Cases

- [x] Create Use Cases story structure
- [x] Build "Build a Chess Game" stories
- [x] Build "Create Puzzles" stories
- [x] Build "Build Analysis Tools" stories

### Phase 5: Package Documentation

- [x] Restructure existing stories under new hierarchy
- [x] Add Overview.mdx for each package
- [ ] Add API Reference.mdx for each package (optional - Overview covers main API)
- [ ] Enhance component stories with better descriptions

### Phase 6: Theming

- [x] Create Theme System Overview
- [x] Build Preset Gallery
- [x] Create Custom Theme Builder interactive story

---

## Technical Implementation Details

### Storybook Configuration Updates

```typescript
// .storybook/main.ts
const config: StorybookConfig = {
  stories: [
    // Landing Page (first for default view)
    "../src/stories/Home.stories.tsx",

    // MDX Documentation
    "../docs/**/*.mdx",

    // Use Cases
    "../src/stories/use-cases/**/*.stories.tsx",

    // Package Stories
    "../packages/**/*.stories.@(js|jsx|ts|tsx)",
    "../packages/**/*.mdx",
  ],

  // ... rest of config
};
```

### Folder Structure

Since this is a monorepo, stories and docs integrate with the package structure:

```
.storybook/
├── main.ts                  # Updated story paths
├── preview.ts
├── helpers/                 # Existing shared components
│   └── index.tsx
└── styles.css

docs/                        # NEW: MDX Documentation
├── getting-started/
│   ├── Introduction.mdx
│   ├── Installation.mdx
│   ├── QuickStart.mdx
│   └── CoreConcepts.mdx
└── packages/
    └── [per-package overview docs]

src/                         # NEW: Cross-package stories
├── stories/
│   ├── Home.stories.tsx     # Landing page
│   └── use-cases/
│       ├── ChessGame.stories.tsx
│       ├── ChessPuzzle.stories.tsx
│       └── AnalysisTools.stories.tsx

packages/
├── react-chess-game/
│   └── src/
│       └── components/
│           └── ChessGame/
│               ├── ChessGame.stories.tsx  # Existing - update title
│               ├── Theme.stories.tsx
│               └── ThemePresets.stories.tsx
├── react-chess-puzzle/
│   └── [similar structure]
├── react-chess-clock/
│   └── [similar structure]
└── react-chess-stockfish/
    └── [similar structure]
```

### Story Naming Convention

Use Storybook's title naming for hierarchy:

```typescript
// Use Case Story
title: "Use Cases/Build a Chess Game/With Clock";

// Package Component Story
title: "Packages/react-chess-game/Components/Board";

// Theme Story
title: "Theming/Presets/Lichess";
```

---

## Design Principles

1. **Show, Don't Tell**: Interactive examples over lengthy explanations
2. **Progressive Disclosure**: Simple first, advanced later
3. **Copy-Paste Ready**: Every example should be immediately usable
4. **Real Code, Real Use**: Actual working implementations, not toy examples
5. **Composition Focus**: Emphasize how components work together

---

## Success Metrics

The redesign is successful when developers can:

1. Understand the library's value within 30 seconds of landing
2. Have a working implementation within 10 minutes
3. Find any API detail within 2 clicks
4. Compose multiple packages without confusion

---

## Next Steps

1. Review and approve this architecture
2. Begin Phase 1 implementation
3. Iterate based on feedback
