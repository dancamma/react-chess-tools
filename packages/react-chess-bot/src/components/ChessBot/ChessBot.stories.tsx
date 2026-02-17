import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { ChessGame } from "@react-chess-tools/react-chess-game";
import { ChessClock } from "@react-chess-tools/react-chess-clock";
import { ChessBot } from "./index";
import { useChessBotContext, useBotTournament } from "../../hooks";
import type { GameResult, MatchupResult } from "../../hooks";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";
import { useStockfish } from "@react-chess-tools/react-chess-stockfish";
import { DIFFICULTY_PRESETS } from "../../utils/difficulty";
import type { DifficultyLevel, BotMove } from "../../types";
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

  const getResultText = () => {
    if (!isGameOver) return null;
    if (isDraw) return "½-½ Draw";
    if (isCheckmate) {
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
            Level {bot.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Skill Level:</span>
          <span className="font-semibold text-text">{preset.skillLevel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary">Move Time:</span>
          <span className="font-semibold text-text">{preset.moveTime}ms</span>
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

function ArenaGameInfo({
  whiteConfig,
  blackConfig,
  moveLog,
}: {
  whiteConfig: { difficulty: DifficultyLevel };
  blackConfig: { difficulty: DifficultyLevel };
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
            Skill: {whitePreset.skillLevel} | Time: {whitePreset.moveTime}ms
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
            Skill: {blackPreset.skillLevel} | Time: {blackPreset.moveTime}ms
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
              Level {level} (Skill {config.skillLevel})
            </option>
          );
        })}
      </select>
    </div>
  );
}

function BotConfigCard({
  difficulty,
  color,
}: {
  difficulty: DifficultyLevel;
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
        <div>Skill Level: {config.skillLevel}</div>
        <div>Depth: {config.depth}</div>
        <div>Move Time: {config.moveTime}ms</div>
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
- 8 difficulty levels (Lichess calibration)
- Skill Level 0 to 20
- Configurable move time (50ms to 1000ms)
- Event callbacks for monitoring bot behavior
- Works with \`ChessGame\` and \`ChessClock\` components

## Difficulty Levels (Lichess Calibration)
| Level | Skill | Depth | Move Time |
|-------|-------|-------|-----------|
| 1     | 0     | 1     | 50ms      |
| 2     | 3     | 1     | 100ms     |
| 3     | 6     | 2     | 150ms     |
| 4     | 10    | 3     | 200ms     |
| 5     | 14    | 5     | 300ms     |
| 6     | 16    | 8     | 400ms     |
| 7     | 18    | 13    | 500ms     |
| 8     | 20    | 22    | 1000ms    |

## Usage
\`\`\`tsx
<ChessGame.Root>
  <ChessBot.Root
    playAs="black"
    difficulty={5}
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
      description: "Difficulty level (1-8, Lichess calibration)",
    },
  },
  args: {
    playAs: "black",
    difficulty: 5,
    workerPath: WORKER_PATH,
  },
} satisfies Meta<typeof ChessBot.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// STORIES
// =============================================================================

export const Playground: Story = {
  args: {
    playAs: "black",
    difficulty: 5,
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
          Use the <strong>Controls</strong> panel below to adjust difficulty.
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
          <ChessBot.Root playAs="black" difficulty={5} workerPath={WORKER_PATH}>
            <ChessGame.Board />
            <BotInfoPanel />
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

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
          <ChessBot.Root playAs="white" difficulty={5} workerPath={WORKER_PATH}>
            <ChessGame.Board />
            <BotInfoPanel />
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

export const BotArena: Story = {
  render: () => {
    const [whiteDifficulty, setWhiteDifficulty] = useState<DifficultyLevel>(5);
    const [blackDifficulty, setBlackDifficulty] = useState<DifficultyLevel>(3);
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
              <DifficultySelector
                label="Difficulty"
                value={whiteDifficulty}
                onChange={(level) => {
                  setWhiteDifficulty(level);
                  resetGame();
                }}
              />
            </div>

            {/* Black Bot Config */}
            <div className="p-4 bg-surface-alt rounded-lg">
              <h4 className="text-size-sm font-semibold text-text mb-3 flex items-center gap-2">
                <span>⚫</span> Black Bot
              </h4>
              <DifficultySelector
                label="Difficulty"
                value={blackDifficulty}
                onChange={(level) => {
                  setBlackDifficulty(level);
                  resetGame();
                }}
              />
            </div>
          </div>

          {/* Config Cards */}
          <div className="flex gap-4 mb-4">
            <BotConfigCard difficulty={whiteDifficulty} color="white" />
            <BotConfigCard difficulty={blackDifficulty} color="black" />
          </div>

          {/* Board with nested bots */}
          <BoardWrapper>
            <ChessBot.Root
              playAs="white"
              difficulty={whiteDifficulty}
              workerPath={WORKER_PATH}
              onBotMoveComplete={(move: BotMove) => addMove(move.san)}
            >
              <ChessBot.Root
                playAs="black"
                difficulty={blackDifficulty}
                workerPath={WORKER_PATH}
                onBotMoveComplete={(move: BotMove) => addMove(move.san)}
              >
                <ChessGame.Board />
              </ChessBot.Root>
              <ArenaGameInfo
                whiteConfig={{ difficulty: whiteDifficulty }}
                blackConfig={{ difficulty: blackDifficulty }}
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
          <ChessBot.Root playAs="black" difficulty={4} workerPath={WORKER_PATH}>
            <ChessGame.Board />
            <BotInfoPanel />
          </ChessBot.Root>
        </BoardWrapper>
      </StoryContainer>
    </ChessGame.Root>
  ),
};

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

// =============================================================================
// BOT TOURNAMENT STORY
// =============================================================================

const LEVELS: DifficultyLevel[] = [1, 2, 3, 4, 5, 6, 7, 8];

function ResultCell({ result }: { result: MatchupResult | null }) {
  if (result === null) {
    return (
      <td className="px-2 py-1.5 text-center text-size-xs bg-surface-alt text-text-muted">
        —
      </td>
    );
  }

  if (result.total === 0) {
    return (
      <td className="px-2 py-1.5 text-center text-size-xs bg-surface-alt text-text-muted">
        0/0/0
      </td>
    );
  }

  const winRate =
    result.total > 0 ? (result.whiteWins / result.total) * 100 : 0;
  let bgColor = "bg-surface-alt";
  if (winRate >= 60) bgColor = "bg-success/20";
  else if (winRate >= 40) bgColor = "bg-warning/10";
  else if (winRate > 0) bgColor = "bg-danger/10";

  return (
    <td
      className={`px-2 py-1.5 text-center text-size-xs ${bgColor} text-text font-mono`}
    >
      <span className="text-success">{result.whiteWins}</span>
      <span className="text-text-muted">/</span>
      <span className="text-warning">{result.draws}</span>
      <span className="text-text-muted">/</span>
      <span className="text-danger">{result.blackWins}</span>
    </td>
  );
}

function TotalCell({ result }: { result: MatchupResult }) {
  if (result.total === 0) {
    return (
      <td className="px-2 py-1.5 text-center text-size-xs bg-surface text-text-muted font-semibold">
        0/0/0
      </td>
    );
  }

  const winRate =
    result.total > 0 ? (result.whiteWins / result.total) * 100 : 0;
  let bgColor = "bg-surface";
  if (winRate >= 60) bgColor = "bg-success/30";
  else if (winRate >= 40) bgColor = "bg-warning/20";
  else if (winRate > 0) bgColor = "bg-danger/20";

  return (
    <td
      className={`px-2 py-1.5 text-center text-size-xs ${bgColor} text-text font-mono font-semibold`}
    >
      <span className="text-success">{result.whiteWins}</span>
      <span className="text-text-muted">/</span>
      <span className="text-warning">{result.draws}</span>
      <span className="text-text-muted">/</span>
      <span className="text-danger">{result.blackWins}</span>
    </td>
  );
}

function TournamentMatrix({
  results,
  getTotalForRow,
}: {
  results: Map<string, MatchupResult>;
  getTotalForRow: (row: DifficultyLevel) => MatchupResult;
}) {
  const getResult = (white: DifficultyLevel, black: DifficultyLevel) => {
    const key = `${white}-${black}`;
    return results.get(key) || null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse border border-border text-text">
        <thead>
          <tr className="bg-surface-alt">
            <th className="px-2 py-2 text-size-xs font-semibold border border-border">
              Lvl \ vs
            </th>
            {LEVELS.map((level) => (
              <th
                key={level}
                className="px-2 py-2 text-size-xs font-semibold border border-border min-w-[60px]"
              >
                L{level}
              </th>
            ))}
            <th className="px-2 py-2 text-size-xs font-semibold border border-border bg-surface">
              TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
          {LEVELS.map((row) => (
            <tr key={row}>
              <td className="px-2 py-1.5 text-size-xs font-semibold border border-border bg-surface-alt">
                L{row}
              </td>
              {LEVELS.map((col) => (
                <ResultCell
                  key={`${row}-${col}`}
                  result={row === col ? null : getResult(row, col)}
                />
              ))}
              <TotalCell result={getTotalForRow(row)} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TournamentGameRunner({
  slotId,
  whiteLevel,
  blackLevel,
  onGameEnd,
  gameKey,
}: {
  slotId: number;
  whiteLevel: DifficultyLevel;
  blackLevel: DifficultyLevel;
  onGameEnd: (slotId: number, result: GameResult) => void;
  gameKey: number;
}) {
  const { info } = useChessGameContext();
  const hasReportedRef = useRef(false);
  const prevGameOverRef = useRef(false);

  useEffect(() => {
    hasReportedRef.current = false;
    prevGameOverRef.current = false;
  }, [gameKey]);

  useEffect(() => {
    if (
      info.isGameOver &&
      !prevGameOverRef.current &&
      !hasReportedRef.current
    ) {
      hasReportedRef.current = true;

      let result: GameResult;
      if (info.isDraw) {
        result = "draw";
      } else if (info.isCheckmate) {
        result = info.turn === "w" ? "black-wins" : "white-wins";
      } else {
        result = "draw";
      }

      setTimeout(() => onGameEnd(slotId, result), 100);
    }
    prevGameOverRef.current = info.isGameOver;
  }, [
    info.isGameOver,
    info.isDraw,
    info.isCheckmate,
    info.turn,
    onGameEnd,
    slotId,
  ]);

  return (
    <ChessBot.Root
      playAs="white"
      difficulty={whiteLevel}
      moveDelayMs={0}
      workerPath={WORKER_PATH}
    >
      <ChessBot.Root
        playAs="black"
        difficulty={blackLevel}
        moveDelayMs={0}
        workerPath={WORKER_PATH}
      >
        {null}
      </ChessBot.Root>
    </ChessBot.Root>
  );
}

export const BotTournament: Story = {
  render: () => {
    const {
      state,
      actions: { start, stop, reset, recordResult },
      helpers: { getResultsMatrix, getTotalForRow },
    } = useBotTournament({ concurrency: 4 });

    const handleGameEnd = useCallback(
      (slotId: number, result: GameResult) => {
        const slot = state.activeSlots.find((s) => s.slotId === slotId);
        if (slot) {
          recordResult(slotId, slot.matchup.white, slot.matchup.black, result);
        }
      },
      [state.activeSlots, recordResult],
    );

    const matrix = getResultsMatrix();

    return (
      <StoryContainer>
        <StoryHeader
          title="Bot Tournament"
          subtitle="Automatic difficulty calibration test — bots play each other continuously in parallel"
        />

        <InfoBox>
          Running <strong>4 games in parallel</strong>. Click{" "}
          <strong>Start</strong> to begin. Results show Wins/Draws/Losses from
          the row level's perspective (playing as white).
        </InfoBox>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-4">
          {!state.isRunning ? (
            <button
              onClick={start}
              className="px-4 py-2 bg-success text-white rounded-md font-semibold hover:bg-success/90 transition-colors"
            >
              ▶ Start
            </button>
          ) : (
            <button
              onClick={stop}
              className="px-4 py-2 bg-danger text-white rounded-md font-semibold hover:bg-danger/90 transition-colors"
            >
              ⏹ Stop
            </button>
          )}
          <button
            onClick={reset}
            className="px-4 py-2 bg-surface-alt border border-border rounded-md text-text hover:bg-surface transition-colors"
          >
            ↺ Reset
          </button>

          <div className="ml-auto flex items-center gap-4 text-size-sm text-text-secondary">
            <span>
              Games: <strong className="text-text">{state.totalGames}</strong>
            </span>
            <span>
              Active:{" "}
              <strong className="text-text">{state.activeSlots.length}</strong>
            </span>
            {state.lastResult && (
              <span>
                Last:{" "}
                <strong
                  className={
                    state.lastResult === "white-wins"
                      ? "text-success"
                      : state.lastResult === "black-wins"
                        ? "text-danger"
                        : "text-warning"
                  }
                >
                  {state.lastResult === "white-wins"
                    ? "1-0"
                    : state.lastResult === "black-wins"
                      ? "0-1"
                      : "½-½"}
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* Active Games */}
        {state.isRunning && state.activeSlots.length > 0 && (
          <div className="mb-4 p-3 bg-surface-alt rounded-lg">
            <div className="text-size-xs text-text-secondary mb-2">
              Now playing:
            </div>
            <div className="flex flex-wrap gap-2">
              {state.activeSlots.map((slot) => (
                <span
                  key={slot.slotId}
                  className="px-2 py-1 bg-surface rounded text-size-xs font-mono"
                >
                  L{slot.matchup.white} vs L{slot.matchup.black}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Matrix */}
        <div className="p-4 bg-surface-alt rounded-lg">
          <TournamentMatrix
            results={state.results}
            getTotalForRow={getTotalForRow}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-3 text-size-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-success/20 rounded-sm"></span>
            High win rate (≥60%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-warning/10 rounded-sm"></span>
            Balanced (40-60%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-danger/10 rounded-sm"></span>
            Low win rate (&lt;40%)
          </span>
          <span className="ml-auto font-mono">
            Format: <span className="text-success">W</span>/
            <span className="text-warning">D</span>/
            <span className="text-danger">L</span>
          </span>
        </div>

        {/* Parallel game runners */}
        {state.activeSlots.map((slot) => (
          <ChessGame.Root key={slot.gameKey}>
            <TournamentGameRunner
              slotId={slot.slotId}
              whiteLevel={slot.matchup.white}
              blackLevel={slot.matchup.black}
              onGameEnd={handleGameEnd}
              gameKey={slot.gameKey}
            />
          </ChessGame.Root>
        ))}
      </StoryContainer>
    );
  },
};
