import type { Meta } from "@storybook/react-vite";

import React from "react";
import { ChessGame } from "./index";
import {
  useSimulatedServer,
  ServerMoveDetector,
  ServerTimeSync,
} from "./ChessGame.stories.helpers";

// ============================================================================
// Design Tokens
// ============================================================================
const color = {
  bg: "#f5f5f0",
  surface: "#ffffff",
  border: "#e2e0db",
  text: "#2d2d2d",
  textSecondary: "#7a7a72",
  textMuted: "#a5a59c",
  accent: "#5b8a3c",
  accentLight: "#eef4e8",
  dark: "#1c1c1a",
  danger: "#c44",
  dangerLight: "#fef2f2",
  dangerBorder: "#e8b4b4",
  warn: "#b58a1b",
  warnLight: "#fdf8ec",
  warnBorder: "#e0d3a8",
};

const font = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
};

// ============================================================================
// Shared Styles
// ============================================================================
const s = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    fontFamily: font.sans,
    maxWidth: "560px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center" as const,
  },
  title: {
    fontSize: "15px",
    fontWeight: 600,
    color: color.text,
    margin: "0 0 4px",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: "13px",
    color: color.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
  board: {
    borderRadius: "6px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
  },
  hint: {
    fontSize: "12px",
    color: color.textMuted,
    textAlign: "center" as const,
    margin: 0,
    lineHeight: 1.5,
  },
  btn: {
    padding: "7px 14px",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: font.sans,
    cursor: "pointer",
    border: `1px solid ${color.border}`,
    borderRadius: "4px",
    backgroundColor: color.surface,
    color: color.text,
  } as React.CSSProperties,
  btnPrimary: {
    backgroundColor: color.accent,
    borderColor: color.accent,
    color: "#fff",
  } as React.CSSProperties,
  controls: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  divider: {
    width: "100%",
    height: "1px",
    backgroundColor: color.border,
    margin: "4px 0",
  },
};

// ============================================================================
// Clock Styles
// ============================================================================
const clock = {
  row: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    alignItems: "center",
  },
  cell: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "4px",
  },
  label: {
    fontSize: "11px",
    fontWeight: 600,
    color: color.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  white: {
    padding: "10px 20px",
    fontSize: "24px",
    fontWeight: 600,
    fontFamily: font.mono,
    borderRadius: "5px",
    textAlign: "center" as const,
    minWidth: "100px",
    backgroundColor: color.surface,
    border: `2px solid ${color.text}`,
    color: color.text,
  },
  black: {
    padding: "10px 20px",
    fontSize: "24px",
    fontWeight: 600,
    fontFamily: font.mono,
    borderRadius: "5px",
    textAlign: "center" as const,
    minWidth: "100px",
    backgroundColor: color.dark,
    border: `2px solid ${color.dark}`,
    color: "#f0f0ec",
  },
};

// ============================================================================
// Keyboard Hint Styles
// ============================================================================
const kbd = {
  grid: {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  item: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: color.textSecondary,
  },
  key: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "22px",
    height: "22px",
    padding: "0 5px",
    backgroundColor: color.bg,
    border: `1px solid ${color.border}`,
    borderRadius: "3px",
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 600,
    color: color.text,
    lineHeight: 1,
  },
};

// ============================================================================
// Meta
// ============================================================================
const meta = {
  title: "react-chess-game/Components/ChessGame",
  component: ChessGame.Root,
  tags: ["components", "game", "board"],
  argTypes: {},
  parameters: {
    actions: { argTypesRegex: "^_on.*" },
    layout: "centered",
  },
} satisfies Meta<typeof ChessGame.Root>;

export default meta;

// ============================================================================
// Stories
// ============================================================================

export const Default = () => (
  <div style={s.container}>
    <div style={s.header}>
      <h3 style={s.title}>Standard Game</h3>
      <p style={s.subtitle}>Interactive chess board with default settings</p>
    </div>
    <div style={s.board}>
      <ChessGame.Root>
        <ChessGame.KeyboardControls />
        <ChessGame.Board />
      </ChessGame.Root>
    </div>
    <p style={s.hint}>Arrow keys to navigate moves &middot; Press F to flip</p>
  </div>
);

export const WithSounds = () => (
  <div style={s.container}>
    <div style={s.header}>
      <h3 style={s.title}>Sound Effects</h3>
      <p style={s.subtitle}>Audio feedback on every move</p>
    </div>
    <div style={s.board}>
      <ChessGame.Root>
        <ChessGame.Sounds />
        <ChessGame.Board />
      </ChessGame.Root>
    </div>
    <p style={s.hint}>Move pieces to hear sounds for each piece type</p>
  </div>
);

export const WithKeyboardControls = () => (
  <div style={s.container}>
    <div style={s.header}>
      <h3 style={s.title}>Keyboard Navigation</h3>
      <p style={s.subtitle}>Custom keyboard shortcuts for game control</p>
    </div>
    <div style={s.board}>
      <ChessGame.Root>
        <ChessGame.KeyboardControls
          controls={{
            f: (ctx) => ctx.methods.flipBoard(),
            w: (ctx) => ctx.methods.goToStart(),
            s: (ctx) => ctx.methods.goToEnd(),
            a: (ctx) => ctx.methods.goToPreviousMove(),
            d: (ctx) => ctx.methods.goToNextMove(),
          }}
        />
        <ChessGame.Board />
      </ChessGame.Root>
    </div>
    <div style={kbd.grid}>
      <span style={kbd.item}>
        <kbd style={kbd.key}>W</kbd> Start
      </span>
      <span style={kbd.item}>
        <kbd style={kbd.key}>A</kbd> Prev
      </span>
      <span style={kbd.item}>
        <kbd style={kbd.key}>D</kbd> Next
      </span>
      <span style={kbd.item}>
        <kbd style={kbd.key}>S</kbd> End
      </span>
      <span style={kbd.item}>
        <kbd style={kbd.key}>F</kbd> Flip
      </span>
    </div>
  </div>
);

// ============================================================================
// Clock Stories
// ============================================================================

const ClockDisplay = ({
  label,
  color: side,
  ...props
}: { label: string; color: "white" | "black" } & Record<string, unknown>) => (
  <div style={clock.cell}>
    <span style={clock.label}>{label}</span>
    <ChessGame.Clock.Display
      color={side}
      style={side === "white" ? clock.white : clock.black}
      {...props}
    />
  </div>
);

export const WithClockBlitz = () => (
  <ChessGame.Root timeControl={{ time: "5+3", clockStart: "immediate" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Blitz &middot; 5+3</h3>
        <p style={s.subtitle}>5 minutes with 3-second increment</p>
      </div>
      <div style={clock.row}>
        <ClockDisplay label="White" color="white" />
        <ClockDisplay label="Black" color="black" />
      </div>
      <div style={s.board}>
        <ChessGame.Board />
      </div>
    </div>
  </ChessGame.Root>
);

export const WithClockBullet = () => (
  <ChessGame.Root timeControl={{ time: "1+0", clockStart: "immediate" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Bullet &middot; 1+0</h3>
        <p style={s.subtitle}>1 minute, no increment</p>
      </div>
      <div style={clock.row}>
        <ClockDisplay label="White" color="white" format="ss.d" />
        <ClockDisplay label="Black" color="black" format="ss.d" />
      </div>
      <div style={s.board}>
        <ChessGame.Board />
      </div>
    </div>
  </ChessGame.Root>
);

export const WithClockControls = () => (
  <ChessGame.Root
    timeControl={{ time: "3+2", clockStart: "immediate" }}
    autoSwitchOnMove={false}
  >
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Rapid &middot; 3+2</h3>
        <p style={s.subtitle}>Manual clock controls enabled</p>
      </div>
      <div style={clock.row}>
        <ClockDisplay label="White" color="white" />
        <ClockDisplay label="Black" color="black" />
      </div>
      <div style={s.controls}>
        <ChessGame.Clock.PlayPause style={{ ...s.btn, ...s.btnPrimary }}>
          Play / Pause
        </ChessGame.Clock.PlayPause>
        <ChessGame.Clock.Switch style={s.btn}>Switch</ChessGame.Clock.Switch>
        <ChessGame.Clock.Reset style={s.btn}>Reset</ChessGame.Clock.Reset>
      </div>
      <div style={s.board}>
        <ChessGame.Board />
      </div>
    </div>
  </ChessGame.Root>
);

// ============================================================================
// Server-Controlled Clock
// ============================================================================

const srv = {
  panel: {
    width: "100%",
    padding: "14px 16px",
    backgroundColor: color.warnLight,
    border: `1px solid ${color.warnBorder}`,
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    fontFamily: font.sans,
  },
  panelTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: color.warn,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    margin: 0,
  },
  row: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "12px",
    color: "#5a4e1a",
    fontFamily: font.mono,
    flexWrap: "wrap" as const,
  },
  badge: {
    padding: "2px 8px",
    borderRadius: "3px",
    backgroundColor: "#f5edcf",
    fontWeight: 600,
    fontSize: "11px",
    fontFamily: font.sans,
  },
  smallBtn: {
    padding: "3px 8px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    border: `1px solid ${color.warnBorder}`,
    borderRadius: "3px",
    backgroundColor: "#f5edcf",
    color: "#5a4e1a",
    fontFamily: font.sans,
  } as React.CSSProperties,
  dangerBtn: {
    padding: "3px 8px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    border: `1px solid ${color.dangerBorder}`,
    borderRadius: "3px",
    backgroundColor: color.dangerLight,
    color: color.danger,
    fontFamily: font.sans,
  } as React.CSSProperties,
  slider: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#5a4e1a",
    fontFamily: font.sans,
  },
};

export const WithServerControlledClock = () => {
  const INITIAL_TIME = 30 * 1000;
  const INCREMENT = 2 * 1000;
  const { clientView, lagMs, setLagMs, serverMove, serverReset, addTime } =
    useSimulatedServer(INITIAL_TIME, INCREMENT);

  return (
    <ChessGame.Root
      timeControl={{
        time: { baseTime: 30, increment: 2 },
        clockStart: "immediate",
        onTimeout: (loser) => console.log(`Server: ${loser} flagged`),
      }}
      autoSwitchOnMove={false}
    >
      <ServerTimeSync
        serverTimes={{
          white: clientView.whiteTime,
          black: clientView.blackTime,
        }}
      />
      <div style={s.container}>
        <div style={s.header}>
          <h3 style={s.title}>Server-Synced Clock</h3>
          <p style={s.subtitle}>
            Server-authoritative times synced via setTime()
          </p>
        </div>

        {/* Server control panel */}
        <div style={srv.panel}>
          <p style={srv.panelTitle}>Server Controls</p>

          <div style={srv.row}>
            <span>
              W: <b>{(clientView.whiteTime / 1000).toFixed(1)}s</b>
            </span>
            <span>
              B: <b>{(clientView.blackTime / 1000).toFixed(1)}s</b>
            </span>
            <span style={srv.badge}>
              {clientView.finished
                ? "finished"
                : clientView.running
                  ? `${clientView.activePlayer} to move`
                  : "waiting"}
            </span>
          </div>

          <div style={srv.row}>
            <span style={{ fontWeight: 600, fontFamily: font.sans }}>W:</span>
            <button
              style={srv.smallBtn}
              onClick={() => addTime("white", 15000)}
            >
              +15s
            </button>
            <button
              style={srv.dangerBtn}
              onClick={() => addTime("white", -15000)}
            >
              -15s
            </button>
            <span
              style={{
                fontWeight: 600,
                fontFamily: font.sans,
                marginLeft: "4px",
              }}
            >
              B:
            </span>
            <button
              style={srv.smallBtn}
              onClick={() => addTime("black", 15000)}
            >
              +15s
            </button>
            <button
              style={srv.dangerBtn}
              onClick={() => addTime("black", -15000)}
            >
              -15s
            </button>
          </div>

          <div style={srv.slider}>
            <span style={{ fontWeight: 600 }}>Lag</span>
            <input
              type="range"
              min={0}
              max={3000}
              step={100}
              value={lagMs}
              onChange={(e) => setLagMs(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span
              style={{
                fontFamily: font.mono,
                fontSize: "11px",
                fontWeight: 600,
                minWidth: "40px",
                textAlign: "right" as const,
              }}
            >
              {lagMs}ms
            </span>
          </div>
        </div>

        <div style={clock.row}>
          <ClockDisplay label="White" color="white" />
          <ClockDisplay label="Black" color="black" />
        </div>

        <ServerMoveDetector onMove={serverMove} />
        <div style={s.board}>
          <ChessGame.Board />
        </div>

        <div style={s.controls}>
          <button style={s.btn} onClick={serverReset}>
            Reset Server
          </button>
        </div>

        <p style={s.hint}>
          Use +/- to change server time. Set lag &gt; 0 and make moves to see
          client interpolation with delayed server corrections.
        </p>
      </div>
    </ChessGame.Root>
  );
};

export const WithClockMultiPeriod = () => (
  <ChessGame.Root
    timeControl={{
      time: [
        { baseTime: 120, increment: 0, moves: 5 },
        { baseTime: 60, increment: 0 },
      ],
      clockStart: "immediate",
    }}
  >
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Multi-Period Tournament</h3>
        <p style={s.subtitle}>2 min (5 moves) then 1 min sudden death</p>
      </div>
      <div style={clock.row}>
        <ClockDisplay label="White" color="white" format="mm:ss" />
        <ClockDisplay label="Black" color="black" format="mm:ss" />
      </div>
      <div style={s.board}>
        <ChessGame.Board />
      </div>
    </div>
  </ChessGame.Root>
);
