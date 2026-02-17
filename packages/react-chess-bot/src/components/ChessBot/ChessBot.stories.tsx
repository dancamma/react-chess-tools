import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState, useCallback } from "react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { ChessClock } from "@react-chess-tools/react-chess-clock";
import { ChessBot } from "./index";
import { useChessBotContext } from "../../hooks";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";
import { useStockfish } from "@react-chess-tools/react-chess-stockfish";
import { DIFFICULTY_PRESETS } from "../../utils/difficulty";
import type { DifficultyLevel, RandomnessLevel, BotMove } from "../../types";
import {
  StoryHeader,
  StoryContainer,
  BoardWrapper,
  InfoBox,
  ClockDisplayWrapper,
  ClockPairContainer,
  CLOCK_WHITE_CLASS,
  CLOCK_BLACK_CLASS,
} from "@story-helpers";

const WORKER_PATH = "/stockfish.js";

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface MoveLogEntry {
  move: string;
  time: string;
}

function formatEvaluation(cp: number | null, mate: number | null): string {
  if (mate !== null) {
    return mate > 0 ? `M${mate}` : `-M${Math.abs(mate)}`;
  }
  if (cp !== null) {
    const pawns = cp / 100;
    return pawns >= 0 ? `+${pawns.toFixed(1)}` : pawns.toFixed(1);
  }
  return "—";
}

function BotInfoPanel({
  moveLog,
  customStatus,
}: {
  moveLog?: MoveLogEntry[];
  customStatus?: React.ReactNode;
}) {
  const bot = useChessBotContext();
  const game = useChessGameContext();
  const engine = useStockfish();
  const preset = DIFFICULTY_PRESETS[bot.difficulty];

  const evaluation = engine.info.evaluation;
  const { isGameOver, isCheckmate, isDraw, turn } = game.info;

  // Derive result from game state
  const getResultText = () => {
    if (!isGameOver) return null;
    if (isDraw) return "½-½ Draw";
    if (isCheckmate) {
      // The side that just moved (opposite of current turn) wins
      return turn === "w" ? "0-1 Black wins" : "1-0 White wins";
    }
    return "Game Over";
  };

  const resultText = getResultText();

  return (
    <div className="flex flex-col gap-3 mt-4 p-4 bg-surface-alt rounded-lg font-mono text-size-sm">
      {/* Game Status */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Game Status:</span>
          <span className="font-semibold text-text">
            {isGameOver ? (
              <span className="text-warning">{resultText}</span>
            ) : turn === "w" ? (
              "White to move"
            ) : (
              "Black to move"
            )}
          </span>
        </div>

        {/* Bot Status */}
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Bot ({bot.playAs}):</span>
          <span className="font-semibold">
            {bot.isThinking ? (
              <span className="text-warning flex items-center gap-1">
                <span className="animate-pulse">⏳</span> Thinking...
              </span>
            ) : isGameOver ? (
              <span className="text-text-muted">Game over</span>
            ) : (
              <span className="text-text-muted">Waiting</span>
            )}
          </span>
        </div>

        {/* Last Move */}
        {bot.lastMove && (
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Last Bot Move:</span>
            <span className="font-semibold text-text">{bot.lastMove.san}</span>
          </div>
        )}

        {/* Evaluation */}
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Evaluation:</span>
          <span
            className={`font-semibold ${
              (evaluation?.type === "cp" && evaluation.value > 50) ||
              (evaluation?.type === "mate" && evaluation.value > 0)
                ? "text-success"
                : (evaluation?.type === "cp" && evaluation.value < -50) ||
                    (evaluation?.type === "mate" && evaluation.value < 0)
                  ? "text-danger"
                  : "text-text"
            }`}
          >
            {formatEvaluation(
              evaluation?.type === "cp" ? evaluation.value : null,
              evaluation?.type === "mate" ? evaluation.value : null,
            )}
          </span>
        </div>
      </div>

      {/* Bot Config */}
      <div className="border-t border-border pt-3 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Difficulty:</span>
          <span className="font-semibold text-text">
            {bot.difficulty} ({preset.elo} ELO)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Randomness:</span>
          <span className="font-semibold text-text">{bot.randomness}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Depth:</span>
          <span className="font-semibold text-text">{preset.depth}</span>
        </div>
      </div>

      {/* Error */}
      {bot.error && (
        <div className="bg-danger-bg border border-danger rounded p-2 text-danger text-size-xs">
          Error: {bot.error.message}
        </div>
      )}

      {/* Custom Status */}
      {customStatus}

      {/* Move Log */}
      {moveLog && moveLog.length > 0 && (
        <div className="border-t border-border pt-3">
          <span className="text-text-secondary text-size-xs">
            Recent moves:
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {moveLog.slice(-12).map((entry, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 bg-surface rounded text-size-xs text-text"
              >
                {entry.move}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Info panel for BotArena - doesn't require ChessBotContext
 * Shows game state and move log only
 */
function ArenaGameInfo({
  whiteConfig,
  blackConfig,
  moveLog,
}: {
  whiteConfig: { difficulty: DifficultyLevel; randomness: RandomnessLevel };
  blackConfig: { difficulty: DifficultyLevel; randomness: RandomnessLevel };
  moveLog: MoveLogEntry[];
}) {
  const game = useChessGameContext();
  const engine = useStockfish();

  const evaluation = engine.info.evaluation;
  const { isGameOver, isCheckmate, isDraw, turn } = game.info;

  const getResultText = () => {
    if (!isGameOver) return null;
    if (isDraw) return "½-½ Draw";
    if (isCheckmate) {
      return turn === "w" ? "0-1 Black wins" : "1-0 White wins";
    }
    return "Game Over";
  };

  const resultText = getResultText();
  const whitePreset = DIFFICULTY_PRESETS[whiteConfig.difficulty];
  const blackPreset = DIFFICULTY_PRESETS[blackConfig.difficulty];

  return (
    <div className="flex flex-col gap-3 mt-4 p-4 bg-surface-alt rounded-lg font-mono text-size-sm">
      {/* Game Status */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Game Status:</span>
          <span className="font-semibold text-text">
            {isGameOver ? (
              <span className="text-warning">{resultText}</span>
            ) : turn === "w" ? (
              "White to move"
            ) : (
              "Black to move"
            )}
          </span>
        </div>

        {/* Evaluation */}
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Evaluation:</span>
          <span
            className={`font-semibold ${
              (evaluation?.type === "cp" && evaluation.value > 50) ||
              (evaluation?.type === "mate" && evaluation.value > 0)
                ? "text-success"
                : (evaluation?.type === "cp" && evaluation.value < -50) ||
                    (evaluation?.type === "mate" && evaluation.value < 0)
                  ? "text-danger"
                  : "text-text"
            }`}
          >
            {formatEvaluation(
              evaluation?.type === "cp" ? evaluation.value : null,
              evaluation?.type === "mate" ? evaluation.value : null,
            )}
          </span>
        </div>
      </div>

      {/* Bot Configs */}
      <div className="border-t border-border pt-3 grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span>⚪</span>
            <span className="font-semibold text-text">
              Level {whiteConfig.difficulty}
            </span>
          </div>
          <div className="text-size-xs text-text-secondary">
            ELO: {whitePreset.elo} | Depth: {whitePreset.depth} | Rand:{" "}
            {whiteConfig.randomness}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span>⚫</span>
            <span className="font-semibold text-text">
              Level {blackConfig.difficulty}
            </span>
          </div>
          <div className="text-size-xs text-text-secondary">
            ELO: {blackPreset.elo} | Depth: {blackPreset.depth} | Rand:{" "}
            {blackConfig.randomness}
          </div>
        </div>
      </div>

      {/* Move Log */}
      {moveLog.length > 0 && (
        <div className="border-t border-border pt-3">
          <span className="text-text-secondary text-size-xs">
            Recent moves ({moveLog.length} total):
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {moveLog.slice(-12).map((entry, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 bg-surface rounded text-size-xs text-text"
              >
                {entry.move}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Dropdown selector for difficulty level using exported DIFFICULTY_PRESETS
 */
function DifficultySelector({
  value,
  onChange,
  label,
}: {
  value: DifficultyLevel;
  onChange: (level: DifficultyLevel) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-size-sm font-medium text-text">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as DifficultyLevel)}
        className="px-3 py-2 bg-surface-alt border border-border rounded-md text-text text-size-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {([1, 2, 3, 4, 5, 6, 7, 8] as DifficultyLevel[]).map((level) => {
          const config = DIFFICULTY_PRESETS[level];
          return (
            <option key={level} value={level}>
              Level {level} (ELO {config.elo})
            </option>
          );
        })}
      </select>
    </div>
  );
}

/**
 * Dropdown selector for randomness level
 */
function RandomnessSelector({
  value,
  onChange,
  label,
}: {
  value: RandomnessLevel;
  onChange: (level: RandomnessLevel) => void;
  label: string;
}) {
  const randomnessLevels: RandomnessLevel[] = [0, 1, 2, 3, 4, 5];
  const descriptions: Record<RandomnessLevel, string> = {
    0: "Deterministic",
    1: "Slight variation",
    2: "Some variety",
    3: "Noticeable variety",
    4: "High variety",
    5: "Maximum variety",
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-size-sm font-medium text-text">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as RandomnessLevel)}
        className="px-3 py-2 bg-surface-alt border border-border rounded-md text-text text-size-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {randomnessLevels.map((level) => (
          <option key={level} value={level}>
            {level} - {descriptions[level]}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Card showing current bot configuration
 */
function BotConfigCard({
  difficulty,
  randomness,
  color,
}: {
  difficulty: DifficultyLevel;
  randomness: RandomnessLevel;
  color: "white" | "black";
}) {
  const config = DIFFICULTY_PRESETS[difficulty];
  return (
    <div className="p-3 rounded-lg border border-border bg-surface-alt">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{color === "white" ? "⚪" : "⚫"}</span>
        <span className="font-semibold text-text">Level {difficulty}</span>
      </div>
      <div className="text-size-xs text-text-secondary space-y-0.5">
        <div>ELO: {config.elo}</div>
        <div>Depth: {config.depth}</div>
        <div>Randomness: {randomness}</div>
        {config.description && (
          <div className="text-text-muted italic">{config.description}</div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// META
// =============================================================================

const meta = {
  title: "react-chess-bot/ChessBot",
  component: ChessBot.Root,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The \`ChessBot\` component provides a chess AI opponent using Stockfish.

## Features
- 8 difficulty levels (ELO 800-2900)
- Adjustable randomness for more human-like play
- Configurable move delay
- Event callbacks for monitoring bot behavior
- Works with \`ChessGame\` and \`ChessClock\` components

## Usage
\`\`\`tsx
<ChessGame.Root>
  <ChessBot.Root
    playAs="black"
    difficulty={5}
    randomness={0}
    workerPath="/stockfish.js"
  >
    <ChessGame.Board />
  </ChessBot.Root>
</ChessGame.Root>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    playAs: {
      control: { type: "radio" },
      options: ["white", "black"],
      description: "Which color the bot plays",
    },
    difficulty: {
      control: { type: "range", min: 1, max: 8, step: 1 },
      description: "Difficulty level (1-8)",
    },
    randomness: {
      control: { type: "range", min: 0, max: 5, step: 1 },
      description: "Randomness level (0=deterministic, 5=variable)",
    },
    minDelayMs: {
      control: { type: "number" },
      description: "Minimum delay before bot moves (ms)",
    },
    maxDelayMs: {
      control: { type: "number" },
      description: "Maximum delay before bot moves (ms)",
    },
  },
  args: {
    playAs: "black",
    difficulty: 5,
    randomness: 0,
    minDelayMs: 0,
    maxDelayMs: 1000,
    workerPath: WORKER_PATH,
  },
} satisfies Meta<typeof ChessBot.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// STORIES
// =============================================================================

/**
 * Quick experimentation with Storybook controls.
 * Adjust difficulty, randomness, and delay to see how the bot behaves.
 */
export const Playground: Story = {
  args: {
    playAs: "black",
    difficulty: 5,
    randomness: 0,
    minDelayMs: 0,
    maxDelayMs: 1000,
    workerPath: WORKER_PATH,
  },
  render: (args) => (
    <ChessGame.Root>
      <StoryContainer>
        <StoryHeader
          title="Playground"
          subtitle="Experiment with bot settings using Storybook controls"
        />
        <InfoBox>
          Use the <strong>Controls</strong> panel below to adjust difficulty,
          randomness, and move delay.
        </InfoBox>
        <BoardWrapper>
          <ChessBot.Root {...args}>
            <ChessGame.Board />
            <BotInfoPanel />
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

/**
 * Human plays white against a bot playing black.
 * Make your move and watch the bot respond.
 */
export const HumanVsBot: Story = {
  render: () => (
    <ChessGame.Root>
      <StoryContainer>
        <StoryHeader
          title="Human vs Bot"
          subtitle="You play white, bot plays black"
        />
        <InfoBox>Make your move as white and watch the bot respond!</InfoBox>
        <BoardWrapper>
          <ChessBot.Root
            playAs="black"
            difficulty={5}
            randomness={0}
            workerPath={WORKER_PATH}
          >
            <ChessGame.Board />
            <BotInfoPanel />
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

/**
 * Bot plays white against a human playing black.
 * The bot makes the first move, then it's your turn.
 */
export const BotVsHuman: Story = {
  render: () => (
    <ChessGame.Root orientation="b">
      <StoryContainer>
        <StoryHeader
          title="Bot vs Human"
          subtitle="Bot plays white, you play black"
        />
        <InfoBox>The bot will open. Then it's your turn to respond!</InfoBox>
        <BoardWrapper>
          <ChessBot.Root
            playAs="white"
            difficulty={5}
            randomness={0}
            workerPath={WORKER_PATH}
          >
            <ChessGame.Board />
            <BotInfoPanel />
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

/**
 * Two configurable bots play against each other.
 * Adjust difficulty (using exported DIFFICULTY_PRESETS) and randomness for each side.
 */
export const BotArena: Story = {
  render: () => {
    const [whiteDifficulty, setWhiteDifficulty] = useState<DifficultyLevel>(5);
    const [whiteRandomness, setWhiteRandomness] = useState<RandomnessLevel>(1);
    const [blackDifficulty, setBlackDifficulty] = useState<DifficultyLevel>(3);
    const [blackRandomness, setBlackRandomness] = useState<RandomnessLevel>(2);
    const [moveLog, setMoveLog] = useState<MoveLogEntry[]>([]);
    const [gameKey, setGameKey] = useState(0);

    const addMove = useCallback((move: string) => {
      const time = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setMoveLog((prev) => [...prev, { move, time }]);
    }, []);

    const resetGame = () => {
      setMoveLog([]);
      setGameKey((k) => k + 1);
    };

    return (
      <ChessGame.Root key={gameKey}>
        <StoryContainer>
          <StoryHeader
            title="Bot Arena"
            subtitle="Watch two bots battle each other"
          />

          {/* Config Selectors */}
          <div className="grid grid-cols-2 gap-6 mb-4">
            {/* White Bot Config */}
            <div className="p-4 bg-surface-alt rounded-lg">
              <h4 className="text-size-sm font-semibold text-text mb-3 flex items-center gap-2">
                <span>⚪</span> White Bot
              </h4>
              <div className="flex flex-col gap-3">
                <DifficultySelector
                  label="Difficulty"
                  value={whiteDifficulty}
                  onChange={(level) => {
                    setWhiteDifficulty(level);
                    resetGame();
                  }}
                />
                <RandomnessSelector
                  label="Randomness"
                  value={whiteRandomness}
                  onChange={(level) => {
                    setWhiteRandomness(level);
                    resetGame();
                  }}
                />
              </div>
            </div>

            {/* Black Bot Config */}
            <div className="p-4 bg-surface-alt rounded-lg">
              <h4 className="text-size-sm font-semibold text-text mb-3 flex items-center gap-2">
                <span>⚫</span> Black Bot
              </h4>
              <div className="flex flex-col gap-3">
                <DifficultySelector
                  label="Difficulty"
                  value={blackDifficulty}
                  onChange={(level) => {
                    setBlackDifficulty(level);
                    resetGame();
                  }}
                />
                <RandomnessSelector
                  label="Randomness"
                  value={blackRandomness}
                  onChange={(level) => {
                    setBlackRandomness(level);
                    resetGame();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Config Cards */}
          <div className="flex gap-4 mb-4">
            <BotConfigCard
              difficulty={whiteDifficulty}
              randomness={whiteRandomness}
              color="white"
            />
            <BotConfigCard
              difficulty={blackDifficulty}
              randomness={blackRandomness}
              color="black"
            />
          </div>

          {/* Board with nested bots */}
          <BoardWrapper>
            <ChessBot.Root
              playAs="white"
              difficulty={whiteDifficulty}
              randomness={whiteRandomness}
              minDelayMs={200}
              maxDelayMs={600}
              workerPath={WORKER_PATH}
              onBotMoveComplete={(move: BotMove) => addMove(move.san)}
            >
              <ChessBot.Root
                playAs="black"
                difficulty={blackDifficulty}
                randomness={blackRandomness}
                minDelayMs={200}
                maxDelayMs={600}
                workerPath={WORKER_PATH}
                onBotMoveComplete={(move: BotMove) => addMove(move.san)}
              >
                <ChessGame.Board />
              </ChessBot.Root>
              {/* Info Panel - inside ChessBot.Root to access Stockfish context */}
              <ArenaGameInfo
                whiteConfig={{
                  difficulty: whiteDifficulty,
                  randomness: whiteRandomness,
                }}
                blackConfig={{
                  difficulty: blackDifficulty,
                  randomness: blackRandomness,
                }}
                moveLog={moveLog}
              />
            </ChessBot.Root>
          </BoardWrapper>

          {/* Reset Button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-surface-alt border border-border rounded-md text-text hover:bg-surface transition-colors"
            >
              Reset Game
            </button>
          </div>
        </StoryContainer>
      </ChessGame.Root>
    );
  },
};

/**
 * Bot integrated with a chess clock.
 * Each side has limited time to make moves.
 */
export const WithClock: Story = {
  render: () => (
    <ChessGame.Root timeControl={{ time: "5+3" }}>
      <StoryContainer>
        <StoryHeader
          title="Bot with Clock"
          subtitle="Timed game against the bot"
        />
        <InfoBox>
          Each player has <strong>5 minutes + 3s increment</strong>. The clock
          starts automatically.
        </InfoBox>

        {/* Clock Display */}
        <ClockPairContainer>
          <ClockDisplayWrapper label="White">
            <ChessClock.Display color="white" className={CLOCK_WHITE_CLASS} />
          </ClockDisplayWrapper>
          <ClockDisplayWrapper label="Black">
            <ChessClock.Display color="black" className={CLOCK_BLACK_CLASS} />
          </ClockDisplayWrapper>
        </ClockPairContainer>

        <BoardWrapper>
          <ChessBot.Root
            playAs="black"
            difficulty={4}
            randomness={1}
            workerPath={WORKER_PATH}
          >
            <ChessGame.Board />
            <BotInfoPanel />
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

/**
 * Monitor all bot events in real-time.
 * Useful for debugging and understanding bot behavior.
 */
export const EventMonitor: Story = {
  render: () => {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
      setLogs((prev) => [...prev.slice(-19), `[${timestamp}] ${message}`]);
    };

    return (
      <ChessGame.Root>
        <StoryContainer>
          <StoryHeader
            title="Event Monitor"
            subtitle="Watch bot events in real-time"
          />

          {/* Board */}
          <BoardWrapper>
            <ChessBot.Root
              playAs="black"
              difficulty={5}
              randomness={0}
              workerPath={WORKER_PATH}
              onBotMoveStart={() => addLog("🤔 Bot started thinking...")}
              onBotMoveComplete={(move: BotMove) =>
                addLog(`✅ Bot played: ${move.san}`)
              }
              onBotError={(error) => addLog(`❌ Error: ${error.message}`)}
            >
              <ChessGame.Board />
            </ChessBot.Root>
          </BoardWrapper>

          {/* Event Log */}
          <div className="flex flex-col mt-4">
            <h4 className="text-size-sm font-semibold text-text mb-2">
              Event Log
            </h4>
            <div className="bg-dark-bg rounded-lg p-3 font-mono text-size-xs text-dark-text overflow-y-auto min-h-[120px] max-h-[200px]">
              {logs.length === 0 ? (
                <span className="text-dark-text-muted">
                  Waiting for events... Make a move to see bot events.
                </span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1 leading-relaxed">
                    {log}
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setLogs([])}
              className="mt-2 self-end px-3 py-1.5 text-size-xs bg-surface-alt border border-border rounded text-text hover:bg-surface transition-colors"
            >
              Clear Log
            </button>
          </div>
        </StoryContainer>
      </ChessGame.Root>
    );
  },
};
