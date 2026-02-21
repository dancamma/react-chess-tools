import type { Meta } from "@storybook/react-vite";

import React from "react";
import { ChessGame } from "./index";
import {
  useSimulatedServer,
  ServerMoveDetector,
  ServerTimeSync,
  GameStatus,
} from "./ChessGame.stories.helpers";
import {
  StoryHeader,
  StoryContainer,
  BoardWrapper,
  Kbd,
  SecondaryBtn,
  PrimaryBtn,
  ClockDisplayWrapper,
  CLOCK_WHITE_CLASS,
  CLOCK_BLACK_CLASS,
} from "@story-helpers";

const meta = {
  title: "Packages/react-chess-game/ChessGame",
  component: ChessGame.Root,
  tags: ["components", "game", "board"],
  argTypes: {},
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ChessGame.Root>;

export default meta;

export const Default = () => (
  <StoryContainer>
    <StoryHeader
      title="Standard Game"
      subtitle="Interactive chess board with default settings"
    />
    <BoardWrapper>
      <ChessGame.Root>
        <ChessGame.KeyboardControls />
        <ChessGame.Board />
      </ChessGame.Root>
    </BoardWrapper>
    <p className="text-size-xs text-text-muted text-center m-0 leading-relaxed">
      Arrow keys to navigate moves · Press F to flip
    </p>
  </StoryContainer>
);

export const WithSounds = () => (
  <StoryContainer>
    <StoryHeader
      title="Sound Effects"
      subtitle="Audio feedback on every move"
    />
    <BoardWrapper>
      <ChessGame.Root>
        <ChessGame.Sounds />
        <ChessGame.Board />
      </ChessGame.Root>
    </BoardWrapper>
    <p className="text-size-xs text-text-muted text-center m-0 leading-relaxed">
      Move pieces to hear sounds for each piece type
    </p>
  </StoryContainer>
);

export const WithKeyboardControls = () => (
  <StoryContainer>
    <StoryHeader
      title="Keyboard Navigation"
      subtitle="Custom keyboard shortcuts for game control"
    />
    <BoardWrapper>
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
    </BoardWrapper>
    <div className="flex gap-1.5 justify-center flex-wrap">
      <span className="flex items-center gap-1 text-size-xs text-text-secondary">
        <Kbd>W</Kbd> Start
      </span>
      <span className="flex items-center gap-1 text-size-xs text-text-secondary">
        <Kbd>A</Kbd> Prev
      </span>
      <span className="flex items-center gap-1 text-size-xs text-text-secondary">
        <Kbd>D</Kbd> Next
      </span>
      <span className="flex items-center gap-1 text-size-xs text-text-secondary">
        <Kbd>S</Kbd> End
      </span>
      <span className="flex items-center gap-1 text-size-xs text-text-secondary">
        <Kbd>F</Kbd> Flip
      </span>
    </div>
  </StoryContainer>
);

type ClockDisplayProps = {
  label: string;
  color: "white" | "black";
} & Omit<
  React.ComponentProps<typeof ChessGame.Clock.Display>,
  "color" | "className"
>;

const ClockDisplay = ({ label, color: side, ...props }: ClockDisplayProps) => (
  <ClockDisplayWrapper label={label}>
    <ChessGame.Clock.Display
      color={side}
      className={side === "white" ? CLOCK_WHITE_CLASS : CLOCK_BLACK_CLASS}
      {...props}
    />
  </ClockDisplayWrapper>
);

export const WithClockBlitz = () => (
  <ChessGame.Root timeControl={{ time: "5+3", clockStart: "immediate" }}>
    <StoryContainer>
      <StoryHeader
        title="Blitz · 5+3"
        subtitle="5 minutes with 3-second increment"
      />
      <GameStatus />
      <div className="flex gap-3 justify-center items-center">
        <ClockDisplay label="White" color="white" />
        <ClockDisplay label="Black" color="black" />
      </div>
      <BoardWrapper>
        <ChessGame.Board />
      </BoardWrapper>
    </StoryContainer>
  </ChessGame.Root>
);

export const WithClockBullet = () => (
  <ChessGame.Root timeControl={{ time: "1+0", clockStart: "immediate" }}>
    <StoryContainer>
      <StoryHeader title="Bullet · 1+0" subtitle="1 minute, no increment" />
      <GameStatus />
      <div className="flex gap-3 justify-center items-center">
        <ClockDisplay label="White" color="white" format="ss.d" />
        <ClockDisplay label="Black" color="black" format="ss.d" />
      </div>
      <BoardWrapper>
        <ChessGame.Board />
      </BoardWrapper>
    </StoryContainer>
  </ChessGame.Root>
);

export const WithClockControls = () => (
  <ChessGame.Root
    timeControl={{ time: "3+2", clockStart: "immediate" }}
    autoSwitchOnMove={false}
  >
    <StoryContainer>
      <StoryHeader
        title="Rapid · 3+2"
        subtitle="Manual clock controls enabled"
      />
      <GameStatus />
      <div className="flex gap-3 justify-center items-center">
        <ClockDisplay label="White" color="white" />
        <ClockDisplay label="Black" color="black" />
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        <ChessGame.Clock.PlayPause asChild>
          <PrimaryBtn>Play / Pause</PrimaryBtn>
        </ChessGame.Clock.PlayPause>
        <ChessGame.Clock.Switch asChild>
          <SecondaryBtn>Switch</SecondaryBtn>
        </ChessGame.Clock.Switch>
        <ChessGame.Clock.Reset asChild>
          <SecondaryBtn>Reset</SecondaryBtn>
        </ChessGame.Clock.Reset>
      </div>
      <BoardWrapper>
        <ChessGame.Board />
      </BoardWrapper>
    </StoryContainer>
  </ChessGame.Root>
);

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
        onTimeout: () => {},
      }}
      autoSwitchOnMove={false}
    >
      <ServerTimeSync
        serverTimes={{
          white: clientView.whiteTime,
          black: clientView.blackTime,
        }}
      />
      <StoryContainer>
        <StoryHeader
          title="Server-Synced Clock"
          subtitle="Server-authoritative times synced via setTime()"
        />

        <div className="w-full p-3.5 px-4 bg-warn-light border border-warn-border rounded-md flex flex-col gap-2.5 font-sans">
          <p className="text-size-xs font-bold text-warn uppercase tracking-wide m-0">
            Server Controls
          </p>

          <div className="flex gap-2 items-center text-xs text-warn font-mono flex-wrap">
            <span>
              W: <b>{(clientView.whiteTime / 1000).toFixed(1)}s</b>
            </span>
            <span>
              B: <b>{(clientView.blackTime / 1000).toFixed(1)}s</b>
            </span>
            <span className="px-2 py-0.5 rounded bg-info-amber-bg font-semibold text-size-xs font-sans">
              {clientView.finished
                ? "finished"
                : clientView.running
                  ? `${clientView.activePlayer} to move`
                  : "waiting"}
            </span>
          </div>

          <div className="flex gap-2 items-center text-xs text-warn font-mono flex-wrap">
            <span className="font-semibold font-sans">W:</span>
            <button
              className="px-2 py-0.5 text-size-xs font-semibold border border-warn-border rounded bg-info-amber-bg text-warn font-sans"
              onClick={() => addTime("white", 15000)}
            >
              +15s
            </button>
            <button
              className="px-2 py-0.5 text-size-xs font-semibold border border-danger-border rounded bg-danger-bg text-danger font-sans"
              onClick={() => addTime("white", -15000)}
            >
              -15s
            </button>
            <span className="font-semibold font-sans ml-1">B:</span>
            <button
              className="px-2 py-0.5 text-size-xs font-semibold border border-warn-border rounded bg-info-amber-bg text-warn font-sans"
              onClick={() => addTime("black", 15000)}
            >
              +15s
            </button>
            <button
              className="px-2 py-0.5 text-size-xs font-semibold border border-danger-border rounded bg-danger-bg text-danger font-sans"
              onClick={() => addTime("black", -15000)}
            >
              -15s
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-warn font-sans">
            <span className="font-semibold">Lag</span>
            <input
              type="range"
              min={0}
              max={3000}
              step={100}
              value={lagMs}
              onChange={(e) => setLagMs(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-size-xs font-semibold min-w-[40px] text-right">
              {lagMs}ms
            </span>
          </div>
        </div>

        <GameStatus />

        <div className="flex gap-3 justify-center items-center">
          <ClockDisplay label="White" color="white" />
          <ClockDisplay label="Black" color="black" />
        </div>

        <ServerMoveDetector onMove={serverMove} />
        <BoardWrapper>
          <ChessGame.Board />
        </BoardWrapper>

        <div className="flex gap-2 justify-center flex-wrap">
          <SecondaryBtn onClick={serverReset}>Reset Server</SecondaryBtn>
        </div>

        <p className="text-size-xs text-text-muted text-center m-0 leading-relaxed">
          Use +/- to change server time. Set lag &gt; 0 and make moves to see
          client interpolation with delayed server corrections.
        </p>
      </StoryContainer>
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
    <StoryContainer>
      <StoryHeader
        title="Multi-Period Tournament"
        subtitle="2 min (5 moves) then 1 min sudden death"
      />
      <GameStatus />
      <div className="flex gap-3 justify-center items-center">
        <ClockDisplay label="White" color="white" format="mm:ss" />
        <ClockDisplay label="Black" color="black" format="mm:ss" />
      </div>
      <BoardWrapper>
        <ChessGame.Board />
      </BoardWrapper>
    </StoryContainer>
  </ChessGame.Root>
);
