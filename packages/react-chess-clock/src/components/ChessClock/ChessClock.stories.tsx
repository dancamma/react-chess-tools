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
  radioGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "13px",
    fontWeight: 500,
    color: color.text,
    cursor: "pointer",
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
// 1. Default
// ============================================================================

export const Default = () => (
  <ChessClock.Root timeControl={{ time: "5+3" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Blitz &middot; 5+3</h3>
        <p style={s.subtitle}>
          5 minutes with 3-second Fischer increment (delayed start)
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

// ============================================================================
// 2. TimingMethods
// ============================================================================

export const TimingMethods = () => {
  const [method, setMethod] = React.useState<"fischer" | "delay" | "bronstein">(
    "fischer",
  );

  const descriptions: Record<string, string> = {
    fischer: "Adds increment to your clock after each move.",
    delay: "Countdown waits for the delay period before decrementing.",
    bronstein:
      "Adds back actual time used (up to delay amount) after each move.",
  };

  return (
    <ChessClock.Root
      key={method}
      timeControl={{
        time: {
          baseTime: 300,
          increment: method === "fischer" ? 3 : 0,
          delay: method !== "fischer" ? 3 : 0,
        },
        timingMethod: method,
      }}
    >
      <div style={s.container}>
        <div style={s.header}>
          <h3 style={s.title}>Timing Methods</h3>
          <p style={s.subtitle}>Compare Fischer, Delay, and Bronstein</p>
        </div>
        <div style={s.radioGroup}>
          {(["fischer", "delay", "bronstein"] as const).map((m) => (
            <label key={m} style={s.radioLabel}>
              <input
                type="radio"
                name="timing"
                checked={method === m}
                onChange={() => setMethod(m)}
              />
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </label>
          ))}
        </div>
        <ClockPair />
        <div style={s.info}>{descriptions[method]}</div>
        <Controls>
          <ResetBtn />
        </Controls>
      </div>
    </ChessClock.Root>
  );
};

// ============================================================================
// 3. ClockStartModes
// ============================================================================

export const ClockStartModes = () => {
  const [mode, setMode] = React.useState<"delayed" | "immediate" | "manual">(
    "delayed",
  );

  const descriptions: Record<string, string> = {
    delayed:
      "Clock starts after Black's first move (Lichess-style). White moves → Black moves → Clock starts.",
    immediate:
      "White's clock starts counting down immediately on first switch (Chess.com-style).",
    manual: "Clock stays idle until you press Start.",
  };

  return (
    <ChessClock.Root key={mode} timeControl={{ time: "5+3", clockStart: mode }}>
      <div style={s.container}>
        <div style={s.header}>
          <h3 style={s.title}>Clock Start Modes</h3>
          <p style={s.subtitle}>Controls when the clock begins counting down</p>
        </div>
        <div style={s.radioGroup}>
          {(["delayed", "immediate", "manual"] as const).map((m) => (
            <label key={m} style={s.radioLabel}>
              <input
                type="radio"
                name="clockStart"
                checked={mode === m}
                onChange={() => setMode(m)}
              />
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </label>
          ))}
        </div>
        <ClockPair />
        <div style={s.info}>{descriptions[mode]}</div>
        <Controls>
          <ResetBtn />
        </Controls>
      </div>
    </ChessClock.Root>
  );
};

// ============================================================================
// 4. TimeOdds
// ============================================================================

export const TimeOdds = () => (
  <ChessClock.Root timeControl={{ time: "5", whiteTime: 300, blackTime: 180 }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Time Odds</h3>
        <p style={s.subtitle}>White 5 min vs Black 3 min</p>
      </div>
      <ClockPair />
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

// ============================================================================
// 5. DisplayFormats
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

export const DisplayFormats = () => (
  <ChessClock.Root
    timeControl={{
      time: { baseTime: 20, increment: 0 },
      clockStart: "immediate",
    }}
  >
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Display Formats</h3>
        <p style={s.subtitle}>
          All built-in formats + custom formatTime (20s base to show auto
          decimals)
        </p>
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
          <span style={fmt.label}>format=&quot;ss.d&quot;</span>
          <ChessClock.Display color="white" format="ss.d" style={fmt.display} />
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
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

// ============================================================================
// 6. Callbacks
// ============================================================================

export const Callbacks = () => {
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
          <p style={s.subtitle}>
            onTimeout, onSwitch, onTimeUpdate event logging
          </p>
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
// 7. DynamicReset
// ============================================================================

export const DynamicReset = () => (
  <ChessClock.Root timeControl={{ time: "5+3" }}>
    <div style={s.container}>
      <div style={s.header}>
        <h3 style={s.title}>Dynamic Reset</h3>
        <p style={s.subtitle}>
          Reset with a different time control using the timeControl prop
        </p>
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

// ============================================================================
// 8. MultiPeriod
// ============================================================================

function PeriodInfo() {
  const { currentPeriodIndex, totalPeriods, periodMoves, currentPeriod } =
    useChessClockContext();

  const periodLabel = (playerColor: "white" | "black") => {
    const idx = currentPeriodIndex[playerColor];
    const moves = periodMoves[playerColor];
    const period = currentPeriod[playerColor];
    const required = period.moves;
    return required
      ? `Period ${idx + 1}/${totalPeriods} — ${moves}/${required} moves`
      : `Period ${idx + 1}/${totalPeriods} — Sudden death`;
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      {(["white", "black"] as const).map((c) => (
        <div
          key={c}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 10px",
            backgroundColor: c === "white" ? color.bg : color.dark,
            borderRadius: "4px",
            fontSize: "12px",
            fontFamily: font.mono,
            color: c === "white" ? color.text : "#f0f0ec",
          }}
        >
          <span style={{ textTransform: "capitalize" }}>{c}</span>
          <span>{periodLabel(c)}</span>
        </div>
      ))}
    </div>
  );
}

export const MultiPeriod = () => (
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
        <p style={s.subtitle}>90min/40 + 30min/20 + 15min SD</p>
      </div>
      <ClockPair />
      <PeriodInfo />
      <div style={s.info}>
        Each player advances independently through 3 periods
      </div>
      <Controls>
        <ResetBtn />
      </Controls>
    </div>
  </ChessClock.Root>
);

// ============================================================================
// 9. ServerSync
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

export const ServerSync = () => {
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

// ============================================================================
// 10. AsChild
// ============================================================================

function AsChildStatus() {
  const { status } = useChessClockContext();
  return (
    <div
      style={{
        fontSize: "12px",
        fontFamily: font.mono,
        color: color.textSecondary,
      }}
    >
      Status: {status}
    </div>
  );
}

export const AsChild = () => {
  const customBtn: React.CSSProperties = {
    ...s.btn,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    userSelect: "none",
  };

  return (
    <ChessClock.Root timeControl={{ time: "5+3", clockStart: "manual" }}>
      <div style={s.container}>
        <div style={s.header}>
          <h3 style={s.title}>asChild Pattern</h3>
          <p style={s.subtitle}>
            All controls rendered as custom elements via asChild
          </p>
        </div>
        <ClockPair />
        <div style={s.controls}>
          <ChessClock.PlayPause
            asChild
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
            finishedContent="Game Over"
          >
            <div style={{ ...customBtn, ...s.btnPrimary }}>
              <span>placeholder</span>
            </div>
          </ChessClock.PlayPause>

          <ChessClock.Switch asChild>
            <div style={customBtn}>
              <span>Switch</span>
            </div>
          </ChessClock.Switch>

          <ChessClock.Reset asChild>
            <div style={customBtn}>
              <span>Reset</span>
            </div>
          </ChessClock.Reset>
        </div>
        <AsChildStatus />
        <div style={s.info}>
          All 3 buttons use asChild with custom &lt;div&gt; elements.
          <br />
          Disabled state propagates automatically (try when idle or finished).
        </div>
      </div>
    </ChessClock.Root>
  );
};
