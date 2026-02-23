import type { Meta } from "@storybook/react-vite";
import React from "react";
import { ChessClock } from "./index";
import { useChessClockContext } from "../../hooks/useChessClockContext";
import {
  StoryHeader,
  StoryContainer,
  SecondaryBtn,
  PrimaryBtn,
  InfoBox,
  ClockDisplayWrapper,
  ClockPairContainer,
  ClockDisplay,
  PlayPauseButton,
} from "@story-helpers";

const meta = {
  title: "Packages/react-chess-clock/ChessClock",
  component: ChessClock.Root,
  tags: ["components", "clock", "timer"],
  argTypes: {},
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ChessClock.Root>;

export default meta;

const ClockPair = ({
  format,
}: {
  format?: "auto" | "mm:ss" | "ss.d" | "hh:mm:ss";
}) => (
  <ClockPairContainer>
    <ClockDisplayWrapper label="White">
      <ClockDisplay variant="white">
        <ChessClock.Display color="white" format={format} />
      </ClockDisplay>
    </ClockDisplayWrapper>
    <ClockDisplayWrapper label="Black">
      <ClockDisplay variant="black">
        <ChessClock.Display color="black" format={format} />
      </ClockDisplay>
    </ClockDisplayWrapper>
  </ClockPairContainer>
);

const PlayPauseBtn = () => {
  return (
    <ChessClock.PlayPause
      asChild
      startContent="Start"
      pauseContent="Pause"
      resumeContent="Resume"
      finishedContent="Game Over"
    >
      <PrimaryBtn />
    </ChessClock.PlayPause>
  );
};

const SwitchBtn = () => (
  <ChessClock.Switch asChild>
    <SecondaryBtn>Switch</SecondaryBtn>
  </ChessClock.Switch>
);

const ResetBtn = () => (
  <ChessClock.Reset asChild>
    <SecondaryBtn>Reset</SecondaryBtn>
  </ChessClock.Reset>
);

const Controls = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex gap-2 justify-center flex-wrap">
    <PlayPauseBtn />
    <SwitchBtn />
    {children}
  </div>
);

export const Default = () => (
  <ChessClock.Root timeControl={{ time: "5+3" }}>
    <StoryContainer>
      <StoryHeader
        title="Blitz · 5+3"
        subtitle="5 minutes with 3-second Fischer increment (delayed start)"
      />
      <ClockPair />
      <InfoBox>Clock starts after Black&apos;s first move</InfoBox>
      <Controls>
        <ResetBtn />
      </Controls>
    </StoryContainer>
  </ChessClock.Root>
);

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
      <StoryContainer>
        <StoryHeader
          title="Timing Methods"
          subtitle="Compare Fischer, Delay, and Bronstein"
        />
        <div className="flex gap-2 flex-wrap justify-center">
          {(["fischer", "delay", "bronstein"] as const).map((m) => (
            <label
              key={m}
              className="flex items-center gap-1 text-size-sm font-medium text-text"
            >
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
        <InfoBox>{descriptions[method]}</InfoBox>
        <Controls>
          <ResetBtn />
        </Controls>
      </StoryContainer>
    </ChessClock.Root>
  );
};

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
      <StoryContainer>
        <StoryHeader
          title="Clock Start Modes"
          subtitle="Controls when the clock begins counting down"
        />
        <div className="flex gap-2 flex-wrap justify-center">
          {(["delayed", "immediate", "manual"] as const).map((m) => (
            <label
              key={m}
              className="flex items-center gap-1 text-size-sm font-medium text-text"
            >
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
        <InfoBox>{descriptions[mode]}</InfoBox>
        <Controls>
          <ResetBtn />
        </Controls>
      </StoryContainer>
    </ChessClock.Root>
  );
};

export const TimeOdds = () => (
  <ChessClock.Root timeControl={{ time: "5", whiteTime: 300, blackTime: 180 }}>
    <StoryContainer>
      <StoryHeader title="Time Odds" subtitle="White 5 min vs Black 3 min" />
      <ClockPair />
      <Controls>
        <ResetBtn />
      </Controls>
    </StoryContainer>
  </ChessClock.Root>
);

export const DisplayFormats = () => (
  <ChessClock.Root
    timeControl={{
      time: { baseTime: 20, increment: 0 },
      clockStart: "immediate",
    }}
  >
    <StoryContainer>
      <StoryHeader
        title="Display Formats"
        subtitle="All built-in formats + custom formatTime (20s base to show auto decimals)"
      />
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex justify-between items-center p-1.5 px-2.5 bg-bg rounded">
          <span className="text-xs font-medium text-text-secondary font-mono">
            format=&quot;auto&quot;
          </span>
          <ClockDisplay variant="white" size="sm">
            <ChessClock.Display color="white" format="auto" />
          </ClockDisplay>
        </div>
        <div className="flex justify-between items-center p-1.5 px-2.5 bg-bg rounded">
          <span className="text-xs font-medium text-text-secondary font-mono">
            format=&quot;mm:ss&quot;
          </span>
          <ClockDisplay variant="white" size="sm">
            <ChessClock.Display color="white" format="mm:ss" />
          </ClockDisplay>
        </div>
        <div className="flex justify-between items-center p-1.5 px-2.5 bg-bg rounded">
          <span className="text-xs font-medium text-text-secondary font-mono">
            format=&quot;hh:mm:ss&quot;
          </span>
          <ClockDisplay variant="white" size="sm">
            <ChessClock.Display color="white" format="hh:mm:ss" />
          </ClockDisplay>
        </div>
        <div className="flex justify-between items-center p-1.5 px-2.5 bg-bg rounded">
          <span className="text-xs font-medium text-text-secondary font-mono">
            format=&quot;ss.d&quot;
          </span>
          <ClockDisplay variant="white" size="sm">
            <ChessClock.Display color="white" format="ss.d" />
          </ClockDisplay>
        </div>
        <div className="flex justify-between items-center p-1.5 px-2.5 bg-bg rounded">
          <span className="text-xs font-medium text-text-secondary font-mono">
            Custom fn
          </span>
          <ClockDisplay variant="white" size="sm">
            <ChessClock.Display
              color="white"
              formatTime={(ms) => `${Math.ceil(ms / 1000)}s`}
            />
          </ClockDisplay>
        </div>
      </div>
      <Controls>
        <ResetBtn />
      </Controls>
    </StoryContainer>
  </ChessClock.Root>
);

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
      <StoryContainer>
        <StoryHeader
          title="Callbacks · 1+5"
          subtitle="onTimeout, onSwitch, onTimeUpdate event logging"
        />
        <ClockPair format="ss.d" />
        <Controls>
          <ResetBtn />
        </Controls>
        <div className="w-full p-2.5 px-3 bg-bg border border-border rounded-sm text-size-xs font-mono max-h-[90px] overflow-auto text-text-secondary">
          {logs.length === 0 ? (
            <span className="text-text-muted italic">
              Events will appear here...
            </span>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </StoryContainer>
    </ChessClock.Root>
  );
};

export const DynamicReset = () => (
  <ChessClock.Root timeControl={{ time: "5+3" }}>
    <StoryContainer>
      <StoryHeader
        title="Dynamic Reset"
        subtitle="Reset with a different time control using the timeControl prop"
      />
      <ClockPair />
      <Controls />
      <div className="flex gap-2 justify-center flex-wrap">
        <ChessClock.Reset asChild>
          <SecondaryBtn>Reset</SecondaryBtn>
        </ChessClock.Reset>
        <ChessClock.Reset timeControl="1" asChild>
          <SecondaryBtn>1+0</SecondaryBtn>
        </ChessClock.Reset>
        <ChessClock.Reset timeControl="3+2" asChild>
          <SecondaryBtn>3+2</SecondaryBtn>
        </ChessClock.Reset>
        <ChessClock.Reset timeControl="5+3" asChild>
          <SecondaryBtn>5+3</SecondaryBtn>
        </ChessClock.Reset>
        <ChessClock.Reset timeControl="10" asChild>
          <SecondaryBtn>10+0</SecondaryBtn>
        </ChessClock.Reset>
      </div>
    </StoryContainer>
  </ChessClock.Root>
);

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
    <div className="w-full flex flex-col gap-1">
      {(["white", "black"] as const).map((c) => (
        <div
          key={c}
          className={`flex justify-between p-1.5 px-2.5 rounded text-xs font-mono ${c === "white" ? "bg-bg text-text" : "bg-dark text-dark-text"}`}
        >
          <span className="capitalize">{c}</span>
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
    <StoryContainer>
      <StoryHeader
        title="FIDE Classical"
        subtitle="90min/40 + 30min/20 + 15min SD"
      />
      <ClockPair />
      <PeriodInfo />
      <InfoBox>Each player advances independently through 3 periods</InfoBox>
      <Controls>
        <ResetBtn />
      </Controls>
    </StoryContainer>
  </ChessClock.Root>
);

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
      <StoryContainer>
        <StoryHeader
          title="Server Sync"
          subtitle="Times synced from server via setTime()"
        />
        <ClockPair format="mm:ss" />
        <Controls>
          <ResetBtn />
        </Controls>
        <div className="p-2.5 px-3.5 bg-warn-bg border border-warn-border rounded-sm text-xs text-warn text-center leading-relaxed">
          <span className="font-mono text-size-xs">
            Server: W={Math.ceil(serverTimes.white / 1000)}s B=
            {Math.ceil(serverTimes.black / 1000)}s
          </span>
        </div>
      </StoryContainer>
    </ChessClock.Root>
  );
};

function AsChildStatus() {
  const { status } = useChessClockContext();
  return (
    <div className="text-xs font-mono text-text-secondary">
      Status: {status}
    </div>
  );
}

export const AsChild = () => {
  return (
    <ChessClock.Root timeControl={{ time: "5+3", clockStart: "manual" }}>
      <StoryContainer>
        <StoryHeader
          title="asChild Pattern"
          subtitle="All controls rendered as custom elements via asChild"
        />
        <ClockPair />
        <div className="flex gap-2 justify-center flex-wrap">
          <ChessClock.PlayPause
            asChild
            startContent="Start"
            pauseContent="Pause"
            resumeContent="Resume"
            finishedContent="Game Over"
          >
            <PrimaryBtn>placeholder</PrimaryBtn>
          </ChessClock.PlayPause>

          <ChessClock.Switch asChild>
            <SecondaryBtn>Switch</SecondaryBtn>
          </ChessClock.Switch>

          <ChessClock.Reset asChild>
            <SecondaryBtn>Reset</SecondaryBtn>
          </ChessClock.Reset>
        </div>
        <AsChildStatus />
        <InfoBox>
          All 3 buttons use asChild with custom elements.
          <br />
          Disabled state propagates automatically (try when idle or finished).
        </InfoBox>
      </StoryContainer>
    </ChessClock.Root>
  );
};
