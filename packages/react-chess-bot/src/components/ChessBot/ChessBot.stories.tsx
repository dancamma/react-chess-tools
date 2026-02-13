import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { ChessBot } from "./index";
import { useChessBotContext } from "../../hooks";
import {
  StoryHeader,
  StoryContainer,
  BoardWrapper,
  InfoBox,
} from "@story-helpers";

const WORKER_PATH = "/stockfish.js";

const meta = {
  title: "React-Chess-Bot/Components/ChessBot",
  component: ChessBot.Root,
  tags: ["components", "bot", "cpu"],
  parameters: { layout: "centered" },
  args: {
    playAs: "black",
    workerPath: WORKER_PATH,
    children: null,
  },
} satisfies Meta<typeof ChessBot.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to display bot status
const BotStatus = () => {
  const { playAs, isThinking, lastMove, error } = useChessBotContext();

  return (
    <div className="font-mono text-size-xs text-text-secondary flex flex-col gap-1 mt-3">
      <div className="flex gap-3">
        <span>
          plays: <span className="font-semibold text-text">{playAs}</span>
        </span>
        <span>
          thinking:{" "}
          {isThinking ? (
            <span className="text-warning">yes</span>
          ) : (
            <span className="text-text-muted">no</span>
          )}
        </span>
      </div>
      {lastMove && (
        <span>
          last move:{" "}
          <span className="text-text font-semibold">{lastMove.san}</span>
        </span>
      )}
      {error && <span className="text-error">error: {error.message}</span>}
    </div>
  );
};

export const HumanVsCpuWhite: Story = {
  render: () => (
    <ChessGame.Root>
      <StoryContainer>
        <StoryHeader
          title="Human vs CPU (White)"
          subtitle="Human plays white, bot plays black"
        />
        <InfoBox>Make a move as white and watch the bot respond!</InfoBox>
        <BoardWrapper>
          <ChessBot.Root
            playAs="black"
            skillLevel={10}
            workerPath={WORKER_PATH}
          >
            <ChessGame.Board />
            <BotStatus />
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

export const HumanVsCpuBlack: Story = {
  render: () => (
    <ChessGame.Root orientation="b">
      <StoryContainer>
        <StoryHeader
          title="Human vs CPU (Black)"
          subtitle="Human plays black, bot plays white"
        />
        <InfoBox>
          The bot will make the first move. Then it&apos;s your turn!
        </InfoBox>
        <BoardWrapper>
          <ChessBot.Root
            playAs="white"
            skillLevel={10}
            workerPath={WORKER_PATH}
          >
            <ChessGame.Board />
            <BotStatus />
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

export const CpuVsCpu: Story = {
  render: () => (
    <ChessGame.Root>
      <StoryContainer>
        <StoryHeader
          title="CPU vs CPU"
          subtitle="Watch two bots play each other"
        />
        <InfoBox>White bot (skill 10) vs Black bot (skill 8)</InfoBox>
        <BoardWrapper>
          {/* White bot */}
          <ChessBot.Root
            playAs="white"
            skillLevel={10}
            minDelayMs={200}
            maxDelayMs={500}
            workerPath={WORKER_PATH}
          >
            {/* Black bot */}
            <ChessBot.Root
              playAs="black"
              skillLevel={8}
              minDelayMs={200}
              maxDelayMs={500}
              workerPath={WORKER_PATH}
            >
              <ChessGame.Board />
              <BotStatus />
            </ChessBot.Root>
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

export const ConfigurableBot: Story = {
  render: () => {
    const [skillLevel, setSkillLevel] = useState(10);
    const [minDelay, setMinDelay] = useState(0);
    const [maxDelay, setMaxDelay] = useState(1000);

    return (
      <ChessGame.Root>
        <StoryContainer>
          <StoryHeader
            title="Configurable Bot"
            subtitle="Adjust bot settings in real-time"
          />
          <div className="flex flex-col gap-3 mb-4 p-4 bg-surface-alt rounded">
            <div className="flex items-center gap-3">
              <label className="text-size-sm font-medium w-32">
                Skill Level:
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={skillLevel}
                onChange={(e) => setSkillLevel(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-size-sm w-8">{skillLevel}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-size-sm font-medium w-32">
                Min Delay (ms):
              </label>
              <input
                type="number"
                min="0"
                max="5000"
                value={minDelay}
                onChange={(e) => setMinDelay(Number(e.target.value))}
                className="flex-1 px-2 py-1 border rounded font-mono text-size-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-size-sm font-medium w-32">
                Max Delay (ms):
              </label>
              <input
                type="number"
                min="0"
                max="5000"
                value={maxDelay}
                onChange={(e) => setMaxDelay(Number(e.target.value))}
                className="flex-1 px-2 py-1 border rounded font-mono text-size-sm"
              />
            </div>
          </div>
          <BoardWrapper>
            <ChessBot.Root
              playAs="black"
              skillLevel={skillLevel}
              minDelayMs={minDelay}
              maxDelayMs={maxDelay}
              workerPath={WORKER_PATH}
            >
              <ChessGame.Board />
              <BotStatus />
            </ChessBot.Root>
          </BoardWrapper>
        </StoryContainer>
      </ChessGame.Root>
    );
  },
};

export const WithEventCallbacks: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
      setLogs((prev) => [
        ...prev.slice(-9),
        `${new Date().toLocaleTimeString()}: ${message}`,
      ]);
    };

    return (
      <ChessGame.Root>
        <StoryContainer>
          <StoryHeader
            title="With Event Callbacks"
            subtitle="Monitor bot events in real-time"
          />
          <div className="flex gap-6">
            <BoardWrapper>
              <ChessBot.Root
                playAs="black"
                skillLevel={10}
                workerPath={WORKER_PATH}
                onBotMoveStart={() => addLog("Bot started thinking...")}
                onBotMoveComplete={(move) => addLog(`Bot played ${move.san}`)}
                onBotError={(error) => addLog(`Error: ${error.message}`)}
              >
                <ChessGame.Board />
              </ChessBot.Root>
            </BoardWrapper>
            <div className="flex flex-col gap-2 min-w-[280px]">
              <h4 className="text-size-sm font-semibold text-text">
                Event Log
              </h4>
              <div className="flex-1 bg-dark-bg rounded p-3 font-mono text-size-xs text-dark-text overflow-y-auto max-h-[300px]">
                {logs.length === 0 ? (
                  <span className="text-dark-text-muted">
                    Waiting for events...
                  </span>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </StoryContainer>
      </ChessGame.Root>
    );
  },
};
