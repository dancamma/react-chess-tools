import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ChessGame,
  useChessGameContext,
} from "@react-chess-tools/react-chess-game";

import type { BotLevel, BotStateSnapshot, BotStatus } from "../../types";
import { BOT_LEVELS } from "../../levels";
import { ChessBot } from "./index";
import {
  BoardWrapper,
  Button,
  FAIRY_STOCKFISH_WORKER_PATH,
  FEN_POSITIONS,
  STOCKFISH_WORKER_PATH,
  StoryContainer,
  StoryHeader,
} from "@story-helpers";

const meta = {
  title: "Packages/react-chess-bot/ChessBot",
  component: ChessBot.Player,
  tags: ["components", "bot", "engine"],
  args: {
    color: "b",
    workerOptions: {
      workerPath: FAIRY_STOCKFISH_WORKER_PATH,
      engineType: "fairy-stockfish",
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ChessBot.Player>;

export default meta;
type Story = StoryObj<typeof meta>;

type BotConfig = Omit<React.ComponentProps<typeof ChessBot.Player>, "color">;

const STATUS_CLASSNAME: Record<BotStatus, string> = {
  initializing: "text-warn",
  idle: "text-text-muted",
  thinking: "text-success",
  delaying: "text-info",
  paused: "text-warn",
  error: "text-danger",
};

function BotStatusCard({
  label,
  state,
}: {
  label: string;
  state: BotStateSnapshot | null;
}) {
  const lastMove = state?.lastMove
    ? `${state.lastMove.san} (${state.lastMove.uci})`
    : "none";

  return (
    <div className="w-full rounded-md border border-border bg-surface-alt p-3 font-sans">
      <div className="flex items-center justify-between gap-3">
        <span className="text-size-xs font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </span>
        <span
          className={`text-size-xs font-semibold uppercase tracking-wide ${
            state ? STATUS_CLASSNAME[state.status] : "text-text-muted"
          }`}
        >
          {state?.status ?? "inactive"}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-size-xs text-text-secondary">
        <span>ready: {state?.isReady ? "yes" : "no"}</span>
        <span>thinking: {state?.isThinking ? "yes" : "no"}</span>
        <span className="col-span-2 break-all">last move: {lastMove}</span>
        {state?.error && (
          <span className="col-span-2 break-all text-danger">
            error: {state.error.message}
          </span>
        )}
      </div>
    </div>
  );
}

function MatchControls({ initialFen }: { initialFen: string }) {
  const { game, info, isLatestMove, orientation, currentMoveIndex, methods } =
    useChessGameContext();

  return (
    <div className="w-full rounded-md border border-border bg-surface-alt p-3 font-sans">
      <div className="flex items-center justify-between gap-3">
        <span className="text-size-xs font-semibold uppercase tracking-wide text-text-muted">
          Match
        </span>
        <span className="text-size-xs font-semibold uppercase tracking-wide text-text-secondary">
          {info.isGameOver ? "game over" : `${game.turn()} to move`}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-size-xs text-text-secondary">
        <span>plies: {game.history().length}</span>
        <span>
          view: {isLatestMove ? "live" : `history @ ${currentMoveIndex}`}
        </span>
        <span>orientation: {orientation}</span>
        <span>last move: {info.lastMove?.san ?? "none"}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => methods.setPosition(initialFen, orientation)}
        >
          Reset
        </Button>
        <Button variant="outline" onClick={() => methods.goToStart()}>
          Start
        </Button>
        <Button variant="outline" onClick={() => methods.goToEnd()}>
          Latest
        </Button>
        <Button variant="outline" onClick={() => methods.flipBoard()}>
          Flip
        </Button>
      </div>
    </div>
  );
}

const LEVEL_LABELS: Record<BotLevel, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Intermediate",
  4: "Casual",
  5: "Club",
  6: "Advanced",
  7: "Expert",
  8: "Master",
};

function LevelSelector({
  level,
  onChange,
}: {
  level: BotLevel;
  onChange: (level: BotLevel) => void;
}) {
  const resolved = BOT_LEVELS[level];
  const allLevels = Object.keys(BOT_LEVELS).map(Number) as BotLevel[];

  return (
    <div className="w-full rounded-md border border-border bg-surface-alt p-3 font-sans">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-size-xs font-semibold uppercase tracking-wide text-text-muted">
          Difficulty
        </span>
        <span className="text-size-xs text-text-secondary">
          {LEVEL_LABELS[level]} · ~{resolved.approximateElo} ELO
        </span>
      </div>
      <div className="flex gap-1">
        {allLevels.map((l) => (
          <button
            key={l}
            onClick={() => onChange(l)}
            className={`flex flex-1 items-center justify-center rounded py-1.5 text-size-xs font-semibold transition-colors ${
              level === l
                ? "bg-accent text-white"
                : "border border-border bg-surface text-text-secondary hover:bg-surface-alt"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <p className="mt-2 m-0 text-size-xs text-text-muted">
        {resolved.recommendedEngine === "fairy-stockfish"
          ? "Fairy-Stockfish"
          : "Stockfish"}{" "}
        · skill {resolved.skillLevel} · depth {resolved.maxDepth}
      </p>
    </div>
  );
}

function BotShowcase({
  title,
  subtitle,
  fen,
  whiteBot,
  blackBot,
  note,
  showLevelSelector = false,
  defaultLevel = 4,
}: {
  title: string;
  subtitle: string;
  fen: string;
  whiteBot?: BotConfig;
  blackBot?: BotConfig;
  note?: React.ReactNode;
  showLevelSelector?: boolean;
  defaultLevel?: BotLevel;
}) {
  const [whiteState, setWhiteState] = React.useState<BotStateSnapshot | null>(
    null,
  );
  const [blackState, setBlackState] = React.useState<BotStateSnapshot | null>(
    null,
  );
  const [selectedLevel, setSelectedLevel] =
    React.useState<BotLevel>(defaultLevel);

  const resolvedBlackBot = React.useMemo(() => {
    if (!showLevelSelector || !blackBot) return blackBot;
    return {
      ...blackBot,
      strength: { level: selectedLevel },
      workerOptions: {
        workerPath: FAIRY_STOCKFISH_WORKER_PATH,
        engineType: "fairy-stockfish" as const,
      },
    };
  }, [showLevelSelector, blackBot, selectedLevel]);

  const resolvedWhiteBot = React.useMemo(() => {
    if (!showLevelSelector || !whiteBot) return whiteBot;
    return {
      ...whiteBot,
      strength: { level: selectedLevel },
      workerOptions: {
        workerPath: FAIRY_STOCKFISH_WORKER_PATH,
        engineType: "fairy-stockfish" as const,
      },
    };
  }, [showLevelSelector, whiteBot, selectedLevel]);

  return (
    <ChessGame.Root fen={fen}>
      <StoryContainer className="w-full max-w-story-lg">
        <StoryHeader title={title} subtitle={subtitle} fen={fen} />
        <div className="grid w-full gap-4 lg:grid-cols-[480px_minmax(280px,1fr)] lg:items-start">
          <div className="flex flex-col items-center gap-3">
            <BoardWrapper>
              <ChessGame.Board style={{ width: 480 }} />
            </BoardWrapper>
            <p className="m-0 text-center text-size-xs leading-relaxed text-text-muted">
              Arrow keys browse history. Bots stop outside the live position and
              resume when you return to `Latest`.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <MatchControls initialFen={fen} />
            {showLevelSelector && (
              <LevelSelector
                level={selectedLevel}
                onChange={setSelectedLevel}
              />
            )}
            {resolvedWhiteBot && (
              <BotStatusCard label="White bot" state={whiteState} />
            )}
            {resolvedBlackBot && (
              <BotStatusCard label="Black bot" state={blackState} />
            )}
            {note && (
              <p className="m-0 rounded-md border border-border bg-surface-alt p-3 text-size-xs leading-relaxed text-text-secondary">
                {note}
              </p>
            )}
          </div>
        </div>

        <ChessGame.KeyboardControls />

        {resolvedWhiteBot && (
          <ChessBot.Player
            color="w"
            {...resolvedWhiteBot}
            onStateChange={(state) => {
              setWhiteState(state);
              resolvedWhiteBot.onStateChange?.(state);
            }}
          />
        )}

        {resolvedBlackBot && (
          <ChessBot.Player
            color="b"
            {...resolvedBlackBot}
            onStateChange={(state) => {
              setBlackState(state);
              resolvedBlackBot.onStateChange?.(state);
            }}
          />
        )}
      </StoryContainer>
    </ChessGame.Root>
  );
}

export const HumanVsBot: Story = {
  render: () => (
    <BotShowcase
      title="Human vs Fairy-Stockfish bot"
      subtitle="A logic-only black bot mounted inside ChessGame.Root"
      fen={FEN_POSITIONS.starting}
      blackBot={{
        strength: { level: 4 },
        variability: "medium",
        moveDelay: { min: 250, max: 600 },
        workerOptions: {
          workerPath: FAIRY_STOCKFISH_WORKER_PATH,
          engineType: "fairy-stockfish",
        },
      }}
      showLevelSelector
      defaultLevel={4}
      note="Play as White against the Fairy-Stockfish bot. Make your first move to start the game."
    />
  ),
};

export const BotVsBot: Story = {
  render: () => (
    <BotShowcase
      title="Bot vs bot"
      subtitle="Two independent Fairy-Stockfish workers alternate moves inside the same game root"
      fen={FEN_POSITIONS.starting}
      whiteBot={{
        strength: { level: 4 },
        variability: "low",
        moveDelay: 150,
        workerOptions: {
          workerPath: FAIRY_STOCKFISH_WORKER_PATH,
          engineType: "fairy-stockfish",
        },
      }}
      blackBot={{
        strength: { level: 5 },
        variability: "medium",
        moveDelay: 150,
        workerOptions: {
          workerPath: FAIRY_STOCKFISH_WORKER_PATH,
          engineType: "fairy-stockfish",
        },
      }}
      note="Two Fairy-Stockfish bots play a full game from the starting position. Use Reset to replay."
    />
  ),
};

export const PlainStockfish: Story = {
  render: () => (
    <BotShowcase
      title="Human vs plain Stockfish (exception)"
      subtitle="Standard Stockfish WASM — skill levels 0–20 only, no negative skill support"
      fen={FEN_POSITIONS.starting}
      blackBot={{
        strength: { level: 5 },
        variability: "low",
        moveDelay: { min: 200, max: 500 },
        workerOptions: {
          workerPath: STOCKFISH_WORKER_PATH,
          engineType: "stockfish",
        },
      }}
      note="This is the only story using plain Stockfish. All other stories use Fairy-Stockfish, which supports negative skill levels needed for low-difficulty presets."
    />
  ),
};

export const CustomWeakBot: Story = {
  render: () => (
    <BotShowcase
      title="Human vs ultra-weak custom bot"
      subtitle="Fairy-Stockfish with custom strength: skillLevel -5, depth 1, 100ms think time"
      fen={FEN_POSITIONS.starting}
      blackBot={{
        strength: {
          custom: {
            skillLevel: -20,
            depth: 1,
            moveTimeMs: 1,
          },
        },
        variability: "high",
        moveDelay: { min: 300, max: 800 },
        workerOptions: {
          workerPath: FAIRY_STOCKFISH_WORKER_PATH,
          engineType: "fairy-stockfish",
        },
      }}
      note={
        <>
          <strong>Custom strength parameters:</strong>
          <ul className="mt-1 ml-4 list-disc space-y-0.5">
            <li>
              <code className="rounded bg-surface px-1">skillLevel: -20</code> —
              negative skill level for very weak play
            </li>
            <li>
              <code className="rounded bg-surface px-1">depth: 1</code> —
              minimal search depth
            </li>
            <li>
              <code className="rounded bg-surface px-1">moveTimeMs: 1</code> —
              very short thinking time
            </li>
            <li>
              <code className="rounded bg-surface px-1">
                variability: "high"
              </code>{" "}
              — high randomness in move selection
            </li>
          </ul>
          <p className="mt-2">
            This bot makes frequent blunders and is suitable for beginners or
            children learning chess.
          </p>
        </>
      }
    />
  ),
};

// ============================================================================
// BotArena Story
// ============================================================================

function workerForLevel(_level: BotLevel) {
  return {
    workerPath: FAIRY_STOCKFISH_WORKER_PATH,
    engineType: "fairy-stockfish",
  } as const;
}

type MatchResult = { wins: number; draws: number; losses: number };
type MatchKey = `${number}v${number}`;

function mk(white: BotLevel, black: BotLevel): MatchKey {
  return `${white}v${black}` as MatchKey;
}

type SlotState = {
  id: number;
  pair: [BotLevel, BotLevel];
  gameKey: number;
};

type ArenaState = {
  running: boolean;
  looping: boolean;
  queue: [BotLevel, BotLevel][];
  nextQueueIndex: number;
  slots: SlotState[];
  results: Partial<Record<MatchKey, MatchResult>>;
  nextSlotId: number;
  nextGameKey: number;
};

type ArenaAction =
  | { type: "start"; levels: BotLevel[]; looping: boolean; concurrency: number }
  | { type: "stop" }
  | { type: "clear" }
  | {
      type: "gameOver";
      slotId: number;
      white: BotLevel;
      black: BotLevel;
      result: "white" | "black" | "draw";
    };

function generateRoundRobin(levels: BotLevel[]): [BotLevel, BotLevel][] {
  const pairs: [BotLevel, BotLevel][] = [];
  for (let i = 0; i < levels.length; i++)
    for (let j = 0; j < levels.length; j++)
      if (i !== j) pairs.push([levels[i], levels[j]]);
  return pairs;
}

function arenaReducer(state: ArenaState, action: ArenaAction): ArenaState {
  switch (action.type) {
    case "start": {
      const queue = generateRoundRobin(action.levels);
      if (queue.length === 0) return state;
      const count = Math.min(action.concurrency, queue.length);
      const slots: SlotState[] = Array.from({ length: count }, (_, i) => ({
        id: state.nextSlotId + i,
        pair: queue[i],
        gameKey: state.nextGameKey + i,
      }));
      return {
        ...state,
        running: true,
        looping: action.looping,
        queue,
        nextQueueIndex: count,
        slots,
        nextSlotId: state.nextSlotId + count,
        nextGameKey: state.nextGameKey + count,
      };
    }
    case "stop":
      return { ...state, running: false, slots: [] };
    case "clear":
      return { ...state, results: {} };
    case "gameOver": {
      if (!state.running) return state;

      const slotIdx = state.slots.findIndex((s) => s.id === action.slotId);
      if (slotIdx === -1) return state; // stale event, ignore

      const key = mk(action.white, action.black);
      const prev = state.results[key] ?? { wins: 0, draws: 0, losses: 0 };
      const updated: MatchResult = {
        wins: prev.wins + (action.result === "white" ? 1 : 0),
        draws: prev.draws + (action.result === "draw" ? 1 : 0),
        losses: prev.losses + (action.result === "black" ? 1 : 0),
      };
      const newResults = { ...state.results, [key]: updated };

      const queueLen = state.queue.length;
      const nextIdx = state.nextQueueIndex;
      const newNextGameKey = state.nextGameKey + 1;
      const newNextSlotId = state.nextSlotId + 1;

      let newSlots: SlotState[];
      let newNextIdx: number;

      if (nextIdx < queueLen) {
        const newSlot: SlotState = {
          id: state.nextSlotId,
          pair: state.queue[nextIdx],
          gameKey: newNextGameKey,
        };
        newNextIdx = nextIdx + 1;
        newSlots = state.slots.map((s, i) => (i === slotIdx ? newSlot : s));
      } else if (state.looping) {
        const newSlot: SlotState = {
          id: state.nextSlotId,
          pair: state.queue[0],
          gameKey: newNextGameKey,
        };
        newNextIdx = 1;
        newSlots = state.slots.map((s, i) => (i === slotIdx ? newSlot : s));
      } else {
        newSlots = state.slots.filter((_, i) => i !== slotIdx);
        newNextIdx = nextIdx;
      }

      return {
        ...state,
        running: newSlots.length > 0,
        slots: newSlots,
        results: newResults,
        nextQueueIndex: newNextIdx,
        nextGameKey: newNextGameKey,
        nextSlotId: newNextSlotId,
      };
    }
  }
}

const initialArenaState: ArenaState = {
  running: false,
  looping: true,
  queue: [],
  nextQueueIndex: 0,
  slots: [],
  results: {},
  nextSlotId: 0,
  nextGameKey: 0,
};

function ArenaWatcher({
  slotId,
  whiteLvl,
  blackLvl,
  onGameOver,
}: {
  slotId: number;
  whiteLvl: BotLevel;
  blackLvl: BotLevel;
  onGameOver: (
    slotId: number,
    white: BotLevel,
    black: BotLevel,
    result: "white" | "black" | "draw",
  ) => void;
}) {
  const { game, info } = useChessGameContext();
  const cbRef = React.useRef(onGameOver);
  cbRef.current = onGameOver;
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (!info.isGameOver || firedRef.current) return;
    firedRef.current = true;
    const result: "white" | "black" | "draw" = game.isCheckmate()
      ? game.turn() === "w"
        ? "black"
        : "white"
      : "draw";
    const t = setTimeout(
      () => cbRef.current(slotId, whiteLvl, blackLvl, result),
      300,
    );
    return () => clearTimeout(t);
  }, [info.isGameOver, game, slotId, whiteLvl, blackLvl]);

  return null;
}

function ResultCell({ result }: { result: MatchResult | undefined }) {
  if (!result)
    return (
      <div className="flex h-full items-center justify-center text-size-xs text-text-muted">
        —
      </div>
    );

  const total = result.wins + result.draws + result.losses;
  const winPct = total > 0 ? result.wins / total : 0;
  const bg =
    winPct > 0.62
      ? "bg-success/25"
      : winPct < 0.38
        ? "bg-danger/25"
        : "bg-warn/20";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded p-1 text-size-xs leading-tight ${bg}`}
    >
      <span className="font-semibold text-text">
        {result.wins}/{result.draws}/{result.losses}
      </span>
      <span className="text-text-muted">{Math.round(winPct * 100)}%</span>
    </div>
  );
}

function ArenaMatrix({
  levels,
  results,
}: {
  levels: BotLevel[];
  results: Partial<Record<MatchKey, MatchResult>>;
}) {
  if (levels.length < 2) return null;

  return (
    <div className="w-full overflow-x-auto font-sans">
      <div className="mb-2 text-size-xs font-semibold uppercase tracking-wide text-text-muted">
        Results Matrix · row = white · col = black · W/D/L · % white winrate
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `3rem repeat(${levels.length}, minmax(64px, 1fr))`,
        }}
      >
        <div />
        {levels.map((l) => (
          <div
            key={l}
            className="flex flex-col items-center justify-center py-1 text-size-xs font-semibold text-text-secondary"
          >
            <span>Lvl {l}</span>
            <span className="font-normal text-text-muted">
              ~{BOT_LEVELS[l].approximateElo}
            </span>
          </div>
        ))}

        {levels.map((white) => (
          <React.Fragment key={white}>
            <div className="flex flex-col items-center justify-center text-size-xs font-semibold text-text-secondary">
              <span>Lvl {white}</span>
              <span className="font-normal text-text-muted">
                ~{BOT_LEVELS[white].approximateElo}
              </span>
            </div>
            {levels.map((black) =>
              white === black ? (
                <div
                  key={black}
                  className="flex h-12 items-center justify-center rounded bg-surface-alt text-size-xs text-text-muted"
                >
                  ×
                </div>
              ) : (
                <div key={black} className="h-12">
                  <ResultCell result={results[mk(white, black)]} />
                </div>
              ),
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const BOARD_SIZE_BY_CONCURRENCY: Record<number, number> = {
  1: 300,
  2: 240,
  4: 180,
  8: 140,
  16: 110,
};

const GRID_COLS_BY_CONCURRENCY: Record<number, number> = {
  1: 1,
  2: 2,
  4: 2,
  8: 4,
  16: 4,
};

function BotArenaStory() {
  const [state, dispatch] = React.useReducer(arenaReducer, initialArenaState);
  const [selectedLevels, setSelectedLevels] = React.useState<Set<BotLevel>>(
    new Set([3, 4, 5, 6] as BotLevel[]),
  );
  const [looping, setLooping] = React.useState(true);
  const [concurrency, setConcurrency] = React.useState<1 | 2 | 4 | 8 | 16>(1);

  const sortedLevels = Array.from(selectedLevels).sort(
    (a, b) => a - b,
  ) as BotLevel[];

  const totalGames = Object.values(state.results).reduce(
    (sum, r) => sum + (r ? r.wins + r.draws + r.losses : 0),
    0,
  );

  const boardSize =
    BOARD_SIZE_BY_CONCURRENCY[concurrency] ?? BOARD_SIZE_BY_CONCURRENCY[1];

  function toggleLevel(level: BotLevel) {
    if (state.running) return;
    setSelectedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        if (next.size > 2) next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  }

  const handleGameOver = React.useCallback(
    (
      slotId: number,
      white: BotLevel,
      black: BotLevel,
      result: "white" | "black" | "draw",
    ) => {
      dispatch({ type: "gameOver", slotId, white, black, result });
    },
    [],
  );

  return (
    <StoryContainer className="w-full max-w-story-lg">
      <StoryHeader
        title="Bot Arena"
        subtitle="Round-robin tournament to verify level balance"
      />

      {/* Controls */}
      <div className="w-full rounded-md border border-border bg-surface-alt p-4 font-sans flex flex-col gap-4">
        <div>
          <div className="mb-2 text-size-xs font-semibold uppercase tracking-wide text-text-muted">
            Participating levels (min 2)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(BOT_LEVELS).map(Number) as BotLevel[]).map((l) => (
              <button
                key={l}
                onClick={() => toggleLevel(l)}
                disabled={state.running}
                className={`flex flex-col items-center rounded px-2.5 py-1.5 text-size-xs font-semibold transition-colors disabled:opacity-50 ${
                  selectedLevels.has(l)
                    ? "bg-accent text-white"
                    : "border border-border bg-surface text-text-secondary hover:bg-surface-alt"
                }`}
              >
                <span>{l}</span>
                <span className="font-normal opacity-75">
                  {BOT_LEVELS[l].approximateElo}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-size-xs font-semibold uppercase tracking-wide text-text-muted">
            Concurrent games
          </div>
          <div className="flex gap-1.5">
            {([1, 2, 4, 8, 16] as const).map((n) => (
              <button
                key={n}
                onClick={() => !state.running && setConcurrency(n)}
                disabled={state.running}
                className={`rounded px-3 py-1.5 text-size-xs font-semibold transition-colors disabled:opacity-50 ${
                  concurrency === n
                    ? "bg-accent text-white"
                    : "border border-border bg-surface text-text-secondary hover:bg-surface-alt"
                }`}
              >
                {n}×
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-size-xs text-text-secondary">
            <input
              type="checkbox"
              checked={looping}
              onChange={(e) => !state.running && setLooping(e.target.checked)}
              disabled={state.running}
            />
            Loop (repeat round-robin indefinitely)
          </label>

          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: "clear" })}
              disabled={state.running}
            >
              Clear results
            </Button>
            {state.running ? (
              <Button
                variant="outline"
                onClick={() => dispatch({ type: "stop" })}
              >
                Stop
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  dispatch({
                    type: "start",
                    levels: sortedLevels,
                    looping,
                    concurrency,
                  })
                }
                disabled={sortedLevels.length < 2}
              >
                Start Arena
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Active games */}
      {state.slots.length > 0 ? (
        <div className="w-full flex flex-col gap-4">
          <div
            className="grid gap-3 justify-center"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS_BY_CONCURRENCY[concurrency] ?? 2}, auto)`,
            }}
          >
            {state.slots.map((slot, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="text-size-xs font-semibold text-text-secondary">
                  Lvl {slot.pair[0]} (W) vs Lvl {slot.pair[1]} (B)
                </div>
                <ChessGame.Root key={slot.id} fen={FEN_POSITIONS.starting}>
                  <BoardWrapper>
                    <ChessGame.Board style={{ width: boardSize }} />
                  </BoardWrapper>
                  <ArenaWatcher
                    slotId={slot.id}
                    whiteLvl={slot.pair[0]}
                    blackLvl={slot.pair[1]}
                    onGameOver={handleGameOver}
                  />
                  <ChessBot.Player
                    color="w"
                    strength={{ level: slot.pair[0] }}
                    variability="none"
                    moveDelay={10}
                    workerOptions={workerForLevel(slot.pair[0])}
                  />
                  <ChessBot.Player
                    color="b"
                    strength={{ level: slot.pair[1] }}
                    variability="none"
                    moveDelay={10}
                    workerOptions={workerForLevel(slot.pair[1])}
                  />
                </ChessGame.Root>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-border bg-surface-alt p-3 font-sans">
            <div className="mb-2 text-size-xs font-semibold uppercase tracking-wide text-text-muted">
              Tournament progress
            </div>
            <div className="grid grid-cols-2 gap-2 text-size-xs text-text-secondary">
              <span>Games completed: {totalGames}</span>
              <span>
                Queue: {Math.min(state.nextQueueIndex, state.queue.length)} /{" "}
                {state.queue.length}
              </span>
              <span>
                Pairs: {sortedLevels.length * (sortedLevels.length - 1)}
              </span>
              <span>{looping ? "Looping" : "Single pass"}</span>
            </div>
          </div>
        </div>
      ) : (
        !state.running &&
        totalGames === 0 && (
          <p className="py-4 text-center text-size-sm text-text-muted">
            Select levels and click Start Arena to begin the tournament.
          </p>
        )
      )}

      {/* Results matrix */}
      <ArenaMatrix levels={sortedLevels} results={state.results} />
    </StoryContainer>
  );
}

export const BotArena: Story = {
  render: () => <BotArenaStory />,
};
