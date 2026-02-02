import type { Meta } from "@storybook/react";
import React from "react";
import { ChessClock } from "./index";

const meta = {
  title: "react-chess-clock/Components/ChessClock",
  component: ChessClock.Root,
  tags: ["components", "clock", "timer"],
  argTypes: {},
  parameters: {
    actions: { argTypesRegex: "^_on.*" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px", fontFamily: "monospace" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChessClock.Root>;

export default meta;

const clockStyles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    padding: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
  },
  displayContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  },
  display: {
    padding: "16px 24px",
    fontSize: "24px",
    fontWeight: "bold",
    borderRadius: "4px",
    backgroundColor: "#f0f0f0",
    textAlign: "center" as const,
  },
  whiteDisplay: {
    backgroundColor: "#ffffff",
    border: "3px solid #333",
    color: "#333",
  },
  blackDisplay: {
    backgroundColor: "#1a1a1a",
    border: "3px solid #fff",
    color: "#fff",
  },
  activeDisplay: {
    backgroundColor: "#4caf50",
    color: "white",
  },
  timeControlLabel: {
    fontSize: "14px",
    fontWeight: "bold",
    textAlign: "center" as const,
    padding: "4px 8px",
    backgroundColor: "#e3e3e3",
    borderRadius: "4px",
  },
  controls: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
  },
  button: {
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#fff",
  },
};

export const Default = () => {
  return (
    <ChessClock.Root timeControl={{ time: "5+3" }}>
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>Blitz 5|3</div>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
          <ChessClock.Reset style={clockStyles.button}>Reset</ChessClock.Reset>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const Blitz5Minutes = () => {
  return (
    <ChessClock.Root timeControl={{ time: "5" }}>
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>Blitz 5|0</div>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const Rapid10Plus5 = () => {
  return (
    <ChessClock.Root timeControl={{ time: "10+5" }}>
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>Rapid 10|5</div>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const Bullet1Plus0 = () => {
  return (
    <ChessClock.Root timeControl={{ time: "1" }}>
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>Bullet 1|0</div>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const WithDelay = () => {
  return (
    <ChessClock.Root
      timeControl={{
        time: { baseTime: 300, delay: 5 },
        timingMethod: "delay",
      }}
    >
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>5 min + 5 sec delay</div>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const BronsteinDelay = () => {
  return (
    <ChessClock.Root
      timeControl={{
        time: { baseTime: 300, delay: 3 },
        timingMethod: "bronstein",
      }}
    >
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>
          5 min Bronstein (3 sec delay)
        </div>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const TimeOdds = () => {
  return (
    <ChessClock.Root
      timeControl={{
        time: "5",
        whiteTime: 300,
        blackTime: 180,
      }}
    >
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>
          Time Odds (5 min vs 3 min)
        </div>
        <div style={clockStyles.displayContainer}>
          <div>
            <div style={{ marginBottom: "4px", fontSize: "12px" }}>White</div>
            <ChessClock.Display
              color="white"
              style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
            />
          </div>
          <div>
            <div style={{ marginBottom: "4px", fontSize: "12px" }}>Black</div>
            <ChessClock.Display
              color="black"
              style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
            />
          </div>
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const ImmediateStart = () => {
  return (
    <ChessClock.Root
      timeControl={{
        time: "5+3",
        clockStart: "immediate",
      }}
    >
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>Immediate Start (5|3)</div>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            textAlign: "center",
            color: "#666",
          }}
        >
          White's clock starts immediately on first switch
        </p>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const DelayedStart = () => {
  return (
    <ChessClock.Root
      timeControl={{
        time: "5+3",
        clockStart: "delayed",
      }}
    >
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>Delayed Start (5|3)</div>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            textAlign: "center",
            color: "#666",
          }}
        >
          Clock starts after Black's first move
        </p>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const CustomTimeFormat = () => {
  return (
    <ChessClock.Root timeControl={{ time: "5+3" }}>
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>
          Custom Time Formats (5|3)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px" }}>format="auto":</span>
            <ChessClock.Display
              color="white"
              format="auto"
              style={{
                ...clockStyles.display,
                ...clockStyles.whiteDisplay,
                padding: "8px 16px",
                fontSize: "18px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px" }}>format="mm:ss":</span>
            <ChessClock.Display
              color="white"
              format="mm:ss"
              style={{
                ...clockStyles.display,
                ...clockStyles.whiteDisplay,
                padding: "8px 16px",
                fontSize: "18px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px" }}>format="hh:mm:ss":</span>
            <ChessClock.Display
              color="white"
              format="hh:mm:ss"
              style={{
                ...clockStyles.display,
                ...clockStyles.whiteDisplay,
                padding: "8px 16px",
                fontSize: "18px",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12px" }}>Custom formatter:</span>
            <ChessClock.Display
              color="white"
              formatTime={(ms) => `${Math.ceil(ms / 1000)} seconds`}
              style={{
                ...clockStyles.display,
                ...clockStyles.whiteDisplay,
                padding: "8px 16px",
                fontSize: "18px",
              }}
            />
          </div>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const WithCallbacks = () => {
  const [logs, setLogs] = React.useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-4), msg]);
  };

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
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>With Callbacks (1|5)</div>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            format="ss.d"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            format="ss.d"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
          <ChessClock.Reset style={clockStyles.button}>Reset</ChessClock.Reset>
        </div>
        <div
          style={{
            marginTop: "8px",
            padding: "8px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            fontSize: "11px",
            fontFamily: "monospace",
            maxHeight: "80px",
            overflow: "auto",
          }}
        >
          {logs.length === 0 ? (
            <span style={{ color: "#999" }}>Callbacks will appear here...</span>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const ResetWithNewTimeControl = () => {
  return (
    <ChessClock.Root timeControl={{ time: "5+3" }}>
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>
          Reset with Different Time Controls
        </div>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
        </div>
        <div style={{ ...clockStyles.controls, flexWrap: "wrap" }}>
          <ChessClock.Reset style={clockStyles.button}>Reset</ChessClock.Reset>
          <ChessClock.Reset style={clockStyles.button} timeControl="1">
            1|0
          </ChessClock.Reset>
          <ChessClock.Reset style={clockStyles.button} timeControl="3+2">
            3|2
          </ChessClock.Reset>
          <ChessClock.Reset style={clockStyles.button} timeControl="5+3">
            5|3
          </ChessClock.Reset>
          <ChessClock.Reset style={clockStyles.button} timeControl="10">
            10|0
          </ChessClock.Reset>
        </div>
      </div>
    </ChessClock.Root>
  );
};

export const LowTimeDisplay = () => {
  return (
    <ChessClock.Root
      timeControl={{
        time: { baseTime: 10, increment: 0 },
        clockStart: "immediate",
      }}
    >
      <div style={clockStyles.container}>
        <div style={clockStyles.timeControlLabel}>Low Time (10 seconds)</div>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            textAlign: "center",
            color: "#666",
          }}
        >
          Shows decimal seconds when under 20 seconds
        </p>
        <div style={clockStyles.displayContainer}>
          <ChessClock.Display
            color="white"
            style={{ ...clockStyles.display, ...clockStyles.whiteDisplay }}
          />
          <ChessClock.Display
            color="black"
            style={{ ...clockStyles.display, ...clockStyles.blackDisplay }}
          />
        </div>
        <div style={clockStyles.controls}>
          <ChessClock.PlayPause
            style={clockStyles.button}
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
          />
          <ChessClock.Switch style={clockStyles.button}>
            Switch
          </ChessClock.Switch>
          <ChessClock.Reset style={clockStyles.button}>Reset</ChessClock.Reset>
        </div>
      </div>
    </ChessClock.Root>
  );
};
