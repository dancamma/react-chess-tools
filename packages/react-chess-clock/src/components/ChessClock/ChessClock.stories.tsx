import type { Meta } from "@storybook/react";
import React from "react";
import { ChessClock } from "./index";
import { useChessClockContext } from "../../hooks/useChessClockContext";

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
  dark: "#1c1c1a",
  info: "#e7f5ff",
  infoBorder: "#b4d5f0",
  infoText: "#1864ab",
  warn: "#b58a1b",
  warnBg: "#fff9db",
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
    maxWidth: "420px",
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
  controls: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
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
  btnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  } as React.CSSProperties,
  info: {
    padding: "10px 14px",
    backgroundColor: color.info,
    border: `1px solid ${color.infoBorder}`,
    borderRadius: "5px",
    fontSize: "12px",
    color: color.infoText,
    textAlign: "center" as const,
    lineHeight: 1.5,
  },
  logBox: {
    width: "100%",
    padding: "10px 12px",
    backgroundColor: color.bg,
    border: `1px solid ${color.border}`,
    borderRadius: "5px",
    fontSize: "11px",
    fontFamily: font.mono,
    maxHeight: "90px",
    overflow: "auto",
    color: color.textSecondary,
  },
};

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
// Reusable Helpers
// ============================================================================

const ClockPair = ({
  format,
}: {
  format?: "auto" | "mm:ss" | "ss.d" | "hh:mm:ss";
}) => (
  <div style={clock.row}>
    <div style={clock.cell}>
      <span style={clock.label}>White</span>
      <ChessClock.Display color="white" format={format} style={clock.white} />
    </div>
    <div style={clock.cell}>
      <span style={clock.label}>Black</span>
      <ChessClock.Display color="black" format={format} style={clock.black} />
    </div>
  </div>
);

const PlayPauseBtn = () => {
  const { status } = useChessClockContext();
  const isDisabled = status === "finished" || status === "delayed";

  return (
    <ChessClock.PlayPause
      style={{
        ...s.btn,
        ...s.btnPrimary,
        ...(isDisabled ? s.btnDisabled : {}),
      }}
      startContent="Start"
      pauseContent="Pause"
      resumeContent="Resume"
      finishedContent="Game Over"
    />
  );
};

const SwitchBtn = () => (
  <ChessClock.Switch style={s.btn}>Switch</ChessClock.Switch>
);

const ResetBtn = () => <ChessClock.Reset style={s.btn}>Reset</ChessClock.Reset>;

const Controls = ({ children }: { children?: React.ReactNode }) => (
  <div style={s.controls}>
    <PlayPauseBtn />
    <SwitchBtn />
    {children}
  </div>
);

// ============================================================================
// Meta
// ============================================================================
const meta = {
  title: "react-chess-clock/Components/ChessClock",
  component: ChessClock.Root,
  tags: ["components", "clock", "timer"],
  argTypes: {},
  parameters: {
    actions: { argTypesRegex: "^_on.*" },
    layout: "centered",
  },
} satisfies Meta<typeof ChessClock.Root>;

export default meta;

// ============================================================================
// Basic Stories
// ============================================================================

export const Default = () => (
  <ChessClock.Root timeControl={{ time: "5+3" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Blitz &middot; 5+3</h3>
        <p style={s.subtitle}>
          5 minutes with 3-second increment (Lichess-style delayed start)
        </p>
      </div>
      <ClockPair />
      <div style={s.info}>Clock starts after Black&apos;s first move</div>
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

export const Blitz5Minutes = () => (
  <ChessClock.Root timeControl={{ time: "5" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Blitz &middot; 5+0</h3>
        <p style={s.subtitle}>5 minutes, no increment</p>
      </div>
      <ClockPair />
      <Controls />
    </div>
  </ChessClock.Root>
);

export const Rapid10Plus5 = () => (
  <ChessClock.Root timeControl={{ time: "10+5" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Rapid &middot; 10+5</h3>
        <p style={s.subtitle}>10 minutes with 5-second increment</p>
      </div>
      <ClockPair />
      <Controls />
    </div>
  </ChessClock.Root>
);

export const Bullet1Plus0 = () => (
  <ChessClock.Root timeControl={{ time: "1" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Bullet &middot; 1+0</h3>
        <p style={s.subtitle}>1 minute, no increment</p>
      </div>
      <ClockPair />
      <Controls />
    </div>
  </ChessClock.Root>
);

// ============================================================================
// Timing Methods
// ============================================================================

export const WithDelay = () => (
  <ChessClock.Root
    timeControl={{
      time: { baseTime: 300, delay: 5 },
      timingMethod: "delay",
    }}
  >
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Simple Delay &middot; 5 min</h3>
        <p style={s.subtitle}>5-second delay before countdown starts</p>
      </div>
      <ClockPair />
      <div style={s.info}>Clock delays before counting down each move</div>
      <Controls />
    </div>
  </ChessClock.Root>
);

export const BronsteinDelay = () => (
  <ChessClock.Root
    timeControl={{
      time: { baseTime: 300, delay: 3 },
      timingMethod: "bronstein",
    }}
  >
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Bronstein &middot; 5 min</h3>
        <p style={s.subtitle}>3-second delay added back after each move</p>
      </div>
      <ClockPair />
      <div style={s.info}>
        Delay is added back after each move (Bronstein method)
      </div>
      <Controls />
    </div>
  </ChessClock.Root>
);

// ============================================================================
// Configuration
// ============================================================================

export const TimeOdds = () => (
  <ChessClock.Root timeControl={{ time: "5", whiteTime: 300, blackTime: 180 }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Time Odds</h3>
        <p style={s.subtitle}>White 5 min vs Black 3 min</p>
      </div>
      <ClockPair />
      <Controls />
    </div>
  </ChessClock.Root>
);

export const ImmediateStart = () => (
  <ChessClock.Root timeControl={{ time: "5+3", clockStart: "immediate" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Immediate Start &middot; 5+3</h3>
        <p style={s.subtitle}>White&apos;s clock starts on first switch</p>
      </div>
      <ClockPair />
      <div style={s.info}>
        White&apos;s clock begins counting down immediately
      </div>
      <Controls />
    </div>
  </ChessClock.Root>
);

export const DelayedStart = () => (
  <ChessClock.Root timeControl={{ time: "5+3", clockStart: "delayed" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Delayed Start &middot; 5+3</h3>
        <p style={s.subtitle}>
          Clock starts after Black&apos;s first move (Lichess-style)
        </p>
      </div>
      <ClockPair />
      <div style={s.info}>
        Both clocks are paused until after Black&apos;s first move.
        <br />
        <span style={{ fontFamily: font.mono, fontSize: "11px" }}>
          White moves → Black moves → Clock starts for White
        </span>
      </div>
      <Controls />
    </div>
  </ChessClock.Root>
);

export const ManualStart = () => (
  <ChessClock.Root timeControl={{ time: "5+3", clockStart: "manual" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Manual Start &middot; 5+3</h3>
        <p style={s.subtitle}>Clock starts when you press the button</p>
      </div>
      <ClockPair />
      <div style={s.info}>Clock is idle until you press Start</div>
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

// ============================================================================
// Display Formats
// ============================================================================

const fmt = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 10px",
    backgroundColor: color.bg,
    borderRadius: "4px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 500,
    color: color.textSecondary,
    fontFamily: font.mono,
  },
  display: {
    padding: "6px 14px",
    fontSize: "16px",
    fontWeight: 600,
    fontFamily: font.mono,
    borderRadius: "4px",
    backgroundColor: color.surface,
    border: `2px solid ${color.text}`,
    color: color.text,
  },
};

export const CustomTimeFormat = () => (
  <ChessClock.Root timeControl={{ time: "5+3" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Time Formats</h3>
        <p style={s.subtitle}>Different display format options</p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          width: "100%",
        }}
      >
        <div style={fmt.row}>
          <span style={fmt.label}>format=&quot;auto&quot;</span>
          <ChessClock.Display color="white" format="auto" style={fmt.display} />
        </div>
        <div style={fmt.row}>
          <span style={fmt.label}>format=&quot;mm:ss&quot;</span>
          <ChessClock.Display
            color="white"
            format="mm:ss"
            style={fmt.display}
          />
        </div>
        <div style={fmt.row}>
          <span style={fmt.label}>format=&quot;hh:mm:ss&quot;</span>
          <ChessClock.Display
            color="white"
            format="hh:mm:ss"
            style={fmt.display}
          />
        </div>
        <div style={fmt.row}>
          <span style={fmt.label}>Custom fn</span>
          <ChessClock.Display
            color="white"
            formatTime={(ms) => `${Math.ceil(ms / 1000)}s`}
            style={fmt.display}
          />
        </div>
      </div>
    </div>
  </ChessClock.Root>
);

// ============================================================================
// Callbacks & Events
// ============================================================================

export const WithCallbacks = () => {
  const [logs, setLogs] = React.useState<string[]>([]);
  const addLog = (msg: string) => setLogs((prev) => [...prev.slice(-4), msg]);

  return (
    <ChessClock.Root
      timeControl={{
        time: "1+5",
        clockStart: "immediate",
        onTimeout: (loser) => addLog(`Timeout! ${loser} loses on time`),
        onSwitch: (active) => addLog(`Switch: ${active} is now active`),
        onTimeUpdate: (times) =>
          addLog(`Time: W=${times.white}ms B=${times.black}ms`),
      }}
    >
      <div style={s.container}>
        <div style={s.header}>
          <h3 style={s.title}>Callbacks &middot; 1+5</h3>
          <p style={s.subtitle}>Event logging demo</p>
        </div>
        <ClockPair format="ss.d" />
        <Controls>
          <ResetBtn />
        </Controls>
        <div style={s.logBox}>
          {logs.length === 0 ? (
            <span style={{ color: color.textMuted, fontStyle: "italic" }}>
              Events will appear here...
            </span>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </ChessClock.Root>
  );
};

// ============================================================================
// Reset with New Time Control
// ============================================================================

export const ResetWithNewTimeControl = () => (
  <ChessClock.Root timeControl={{ time: "5+3" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Dynamic Reset</h3>
        <p style={s.subtitle}>Switch time controls on reset</p>
      </div>
      <ClockPair />
      <Controls />
      <div style={s.controls}>
        <ChessClock.Reset style={s.btn}>Reset</ChessClock.Reset>
        <ChessClock.Reset style={s.btn} timeControl="1">
          1+0
        </ChessClock.Reset>
        <ChessClock.Reset style={s.btn} timeControl="3+2">
          3+2
        </ChessClock.Reset>
        <ChessClock.Reset style={s.btn} timeControl="5+3">
          5+3
        </ChessClock.Reset>
        <ChessClock.Reset style={s.btn} timeControl="10">
          10+0
        </ChessClock.Reset>
      </div>
    </div>
  </ChessClock.Root>
);

export const LowTimeDisplay = () => (
  <ChessClock.Root
    timeControl={{
      time: { baseTime: 10, increment: 0 },
      clockStart: "immediate",
    }}
  >
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Low Time Display</h3>
        <p style={s.subtitle}>Shows decimals under 20 seconds</p>
      </div>
      <ClockPair />
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

// ============================================================================
// Preset Time Controls
// ============================================================================

export const PresetBlitz5Plus3 = () => (
  <ChessClock.Root timeControl={{ time: "5+3" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Preset: Blitz 5+3</h3>
        <p style={s.subtitle}>Popular blitz format</p>
      </div>
      <ClockPair />
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

export const PresetBullet1Plus1 = () => (
  <ChessClock.Root timeControl={{ time: "1+1" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Preset: Bullet 1+1</h3>
        <p style={s.subtitle}>Bullet with 1-second increment</p>
      </div>
      <ClockPair format="ss.d" />
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

export const PresetClassical90Plus30 = () => (
  <ChessClock.Root timeControl={{ time: "90+30" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Preset: Classical 90+30</h3>
        <p style={s.subtitle}>Standard tournament format</p>
      </div>
      <ClockPair />
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

export const PresetRapid15Plus10 = () => (
  <ChessClock.Root timeControl={{ time: "15+10" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Preset: Rapid 15+10</h3>
        <p style={s.subtitle}>Popular rapid format</p>
      </div>
      <ClockPair />
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

// ============================================================================
// Multi-Period Tournament Controls
// ============================================================================

export const MultiPeriodFideClassical = () => (
  <ChessClock.Root
    timeControl={{
      time: [
        { baseTime: 5400, increment: 30, moves: 40 },
        { baseTime: 1800, increment: 30, moves: 20 },
        { baseTime: 900, increment: 30 },
      ],
      clockStart: "manual",
    }}
  >
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>FIDE Classical</h3>
        <p style={s.subtitle}>90min/40 + 30min/20 + 15min</p>
      </div>
      <ClockPair />
      <Controls>
        <ResetBtn />
      </Controls>
      <div style={s.info}>
        Each player advances independently:
        <br />
        <span style={{ fontFamily: font.mono, fontSize: "11px" }}>
          Period 1: 40 moves &rarr; Period 2: 20 moves &rarr; Period 3: Sudden
          death
        </span>
      </div>
    </div>
  </ChessClock.Root>
);

export const MultiPeriodSimple = () => (
  <ChessClock.Root
    timeControl={{
      time: [
        { baseTime: 300, increment: 3, moves: 10 },
        { baseTime: 180, increment: 2 },
      ],
      clockStart: "manual",
    }}
  >
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Multi-Period &middot; 5+3 &rarr; 3+2</h3>
        <p style={s.subtitle}>5 min / 10 moves then 3 min sudden death</p>
      </div>
      <ClockPair />
      <Controls>
        <ResetBtn />
      </Controls>
      <div style={s.info}>Each player advances to Period 2 after 10 moves</div>
    </div>
  </ChessClock.Root>
);

export const MultiPeriodSuddenDeath = () => (
  <ChessClock.Root
    timeControl={{
      time: [{ baseTime: 120, moves: 5 }, { baseTime: 60 }],
      clockStart: "manual",
    }}
  >
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Multi-Period &middot; 2 min &rarr; 1 min</h3>
        <p style={s.subtitle}>5 moves then sudden death</p>
      </div>
      <ClockPair format="mm:ss" />
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

// ============================================================================
// Server Sync via setTime
// ============================================================================

function ServerTimeSyncHelper({
  serverTimes,
}: {
  serverTimes: { white: number; black: number };
}) {
  const { methods } = useChessClockContext();
  const prevTimes = React.useRef(serverTimes);

  React.useEffect(() => {
    if (serverTimes.white !== prevTimes.current.white) {
      methods.setTime("white", serverTimes.white);
    }
    if (serverTimes.black !== prevTimes.current.black) {
      methods.setTime("black", serverTimes.black);
    }
    prevTimes.current = serverTimes;
  }, [serverTimes, methods]);

  return null;
}

export const ServerSyncWithSetTime = () => {
  const [serverTimes, setServerTimes] = React.useState({
    white: 300000,
    black: 300000,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setServerTimes((prev) => ({
        white: Math.max(0, prev.white - 1000),
        black: Math.max(0, prev.black - 2000),
      }));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <ChessClock.Root
      timeControl={{
        time: "5+0",
        onTimeout: (loser) => console.log(`${loser} timed out`),
      }}
    >
      <ServerTimeSyncHelper serverTimes={serverTimes} />
      <div style={s.container}>
        <div style={s.header}>
          <h3 style={s.title}>Server Sync</h3>
          <p style={s.subtitle}>Times synced from server via setTime()</p>
        </div>
        <ClockPair format="mm:ss" />
        <Controls>
          <ResetBtn />
        </Controls>
        <div
          style={{
            ...s.info,
            backgroundColor: color.warnBg,
            borderColor: "#e0d3a8",
            color: color.warn,
          }}
        >
          <span style={{ fontFamily: font.mono, fontSize: "11px" }}>
            Server: W={Math.ceil(serverTimes.white / 1000)}s B=
            {Math.ceil(serverTimes.black / 1000)}s
          </span>
        </div>
      </div>
    </ChessClock.Root>
  );
};
