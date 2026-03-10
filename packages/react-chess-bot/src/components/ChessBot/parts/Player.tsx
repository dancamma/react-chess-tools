import React from "react";
import type { Color } from "chess.js";
import {
  StockfishEngine,
  type AnalysisState,
  type StockfishConfig,
} from "@react-chess-tools/react-chess-stockfish";
import { useChessGameContext } from "@react-chess-tools/react-chess-game";

import type {
  BotMove,
  BotStateSnapshot,
  BotStatus,
  PlayerProps,
} from "../../../types";
import { createBotMove, parseUciMove } from "../../../utils/move";
import {
  resolveBotStrength,
  buildStockfishConfigKey,
} from "../../../utils/strength";
import { normalizeBotTiming, resolveBotDelay } from "../../../utils/timing";
import {
  normalizeBotVariability,
  selectVariationForBot,
} from "../../../utils/variability";

interface ActiveSearch {
  id: number;
  fen: string;
  configKey: string;
  active: boolean;
}

interface DelayedMove {
  searchId: number;
  fen: string;
  move: BotMove;
  timeoutId: ReturnType<typeof setTimeout>;
}

interface RuntimeContext {
  currentFen: string;
  isLatestMove: boolean;
  isGameOver: boolean;
  turn: Color;
  paused: boolean;
  autoPlay: boolean;
  moveDelayMin: number;
  moveDelayMax: number;
}

function getWorkerOptionsKey(props: PlayerProps["workerOptions"]): string {
  return [
    props.workerPath,
    props.engineType ?? "stockfish",
    props.throttleMs ?? "",
    props.timeout ?? "",
  ].join("|");
}

function buildBotState(
  previousState: BotStateSnapshot,
  patch: Partial<BotStateSnapshot>,
): BotStateSnapshot {
  return {
    ...previousState,
    ...patch,
  };
}

function areBotStatesEqual(
  left: BotStateSnapshot,
  right: BotStateSnapshot,
): boolean {
  return (
    left.color === right.color &&
    left.status === right.status &&
    left.isThinking === right.isThinking &&
    left.isReady === right.isReady &&
    left.currentFen === right.currentFen &&
    left.lastMove === right.lastMove &&
    left.error === right.error
  );
}

function resolveIdleStatus(paused: boolean): BotStatus {
  return paused ? "paused" : "idle";
}

export const Player: React.FC<PlayerProps> = ({
  color,
  workerOptions,
  strength,
  variability,
  moveDelay,
  paused = false,
  autoPlay = true,
  onStateChange,
  onThinkStart,
  onMoveSelected,
  onMove,
  onError,
}) => {
  const { game, currentFen, info, isLatestMove, methods } =
    useChessGameContext();

  const resolvedStrength = React.useMemo(
    () => resolveBotStrength(strength, workerOptions.engineType),
    [strength, workerOptions.engineType],
  );
  const resolvedVariability = React.useMemo(
    () => normalizeBotVariability(variability),
    [variability],
  );
  const resolvedTiming = React.useMemo(
    () => normalizeBotTiming(moveDelay),
    [moveDelay],
  );
  const stableWorkerOptions = React.useMemo(
    () => ({
      workerPath: workerOptions.workerPath,
      engineType: workerOptions.engineType,
      throttleMs: workerOptions.throttleMs,
      timeout: workerOptions.timeout,
      onError: workerOptions.onError,
    }),
    [
      workerOptions.engineType,
      workerOptions.onError,
      workerOptions.throttleMs,
      workerOptions.timeout,
      workerOptions.workerPath,
    ],
  );
  const workerOptionsKey = React.useMemo(
    () => getWorkerOptionsKey(workerOptions),
    [
      workerOptions.engineType,
      workerOptions.throttleMs,
      workerOptions.timeout,
      workerOptions.workerPath,
    ],
  );

  const callbacksRef = React.useRef({
    onStateChange,
    onThinkStart,
    onMoveSelected,
    onMove,
    onError,
  });
  callbacksRef.current = {
    onStateChange,
    onThinkStart,
    onMoveSelected,
    onMove,
    onError,
  };

  const runtimeContextRef = React.useRef<RuntimeContext>({
    currentFen,
    isLatestMove,
    isGameOver: info.isGameOver,
    turn: game.turn(),
    paused,
    autoPlay,
    moveDelayMin: resolvedTiming.min,
    moveDelayMax: resolvedTiming.max,
  });
  runtimeContextRef.current = {
    currentFen,
    isLatestMove,
    isGameOver: info.isGameOver,
    turn: game.turn(),
    paused,
    autoPlay,
    moveDelayMin: resolvedTiming.min,
    moveDelayMax: resolvedTiming.max,
  };

  const variabilityRef = React.useRef(resolvedVariability);
  variabilityRef.current = resolvedVariability;

  const botStateRef = React.useRef<BotStateSnapshot>({
    color,
    status: "initializing",
    isThinking: false,
    isReady: false,
    currentFen,
    lastMove: null,
    error: null,
  });
  const [botState, setBotState] = React.useState<BotStateSnapshot>(
    botStateRef.current,
  );
  const engineRef = React.useRef<StockfishEngine | null>(null);
  const engineReadyRef = React.useRef(false);
  const currentSearchRef = React.useRef<ActiveSearch | null>(null);
  const delayedMoveRef = React.useRef<DelayedMove | null>(null);
  const searchIdRef = React.useRef(0);
  const reportedErrorRef = React.useRef<Error | null>(null);
  const strengthErrorRef = React.useRef<Error | null>(resolvedStrength.error);
  strengthErrorRef.current = resolvedStrength.error;

  const updateBotState = React.useCallback(
    (patch: Partial<BotStateSnapshot>) => {
      setBotState((previousState) => {
        const nextState = buildBotState(previousState, {
          color,
          currentFen: runtimeContextRef.current.currentFen,
          ...patch,
        });

        if (areBotStatesEqual(previousState, nextState)) {
          return previousState;
        }

        botStateRef.current = nextState;
        return nextState;
      });
    },
    [color],
  );

  const cancelDelayedMove = React.useCallback(() => {
    if (!delayedMoveRef.current) {
      return;
    }

    clearTimeout(delayedMoveRef.current.timeoutId);
    delayedMoveRef.current = null;
  }, []);

  const cancelSearch = React.useCallback(() => {
    if (currentSearchRef.current) {
      currentSearchRef.current.active = false;
      currentSearchRef.current = null;
    }

    engineRef.current?.stopAnalysis();
  }, []);

  const cancelPendingWork = React.useCallback(() => {
    cancelDelayedMove();
    cancelSearch();
  }, [cancelDelayedMove, cancelSearch]);

  const reportError = React.useCallback(
    (error: Error) => {
      cancelPendingWork();
      updateBotState({
        status: "error",
        isThinking: false,
        isReady: engineReadyRef.current,
        error,
      });
    },
    [cancelPendingWork, updateBotState],
  );

  const applyBotMove = React.useCallback(
    (searchId: number, move: BotMove) => {
      const delayedMove = delayedMoveRef.current;

      if (delayedMove && delayedMove.searchId !== searchId) {
        return;
      }

      delayedMoveRef.current = null;

      const runtimeContext = runtimeContextRef.current;

      if (
        runtimeContext.paused ||
        !runtimeContext.autoPlay ||
        !runtimeContext.isLatestMove ||
        runtimeContext.isGameOver ||
        runtimeContext.currentFen !== move.fenBefore ||
        runtimeContext.turn !== color
      ) {
        updateBotState({
          status: resolveIdleStatus(runtimeContext.paused),
          isThinking: false,
          isReady: engineReadyRef.current,
          error: null,
        });
        return;
      }

      const didApplyMove = methods.makeMove(parseUciMove(move.uci));

      if (!didApplyMove) {
        reportError(
          new Error(
            `ChessBot.Player failed to apply move "${move.uci}" for color "${color}".`,
          ),
        );
        return;
      }

      updateBotState({
        status: resolveIdleStatus(runtimeContext.paused),
        isThinking: false,
        isReady: engineReadyRef.current,
        error: null,
        lastMove: move,
      });
      callbacksRef.current.onMove?.(move);
    },
    [color, methods, reportError, updateBotState],
  );

  const scheduleMoveApplication = React.useCallback(
    (search: ActiveSearch, move: BotMove) => {
      const delayMs = resolveBotDelay({
        min: runtimeContextRef.current.moveDelayMin,
        max: runtimeContextRef.current.moveDelayMax,
      });

      callbacksRef.current.onMoveSelected?.(move);

      if (delayMs <= 0) {
        applyBotMove(search.id, move);
        return;
      }

      updateBotState({
        status: "delaying",
        isThinking: false,
        isReady: engineReadyRef.current,
        error: null,
      });

      delayedMoveRef.current = {
        searchId: search.id,
        fen: search.fen,
        move,
        timeoutId: setTimeout(() => {
          applyBotMove(search.id, move);
        }, delayMs),
      };
    },
    [applyBotMove, updateBotState],
  );

  const handleEngineSnapshot = React.useCallback(
    (snapshot: AnalysisState) => {
      if (snapshot.error) {
        reportError(snapshot.error);
        return;
      }

      const activeSearch = currentSearchRef.current;

      if (
        !activeSearch ||
        !activeSearch.active ||
        snapshot.status !== "ready"
      ) {
        return;
      }

      const selectedVariation = selectVariationForBot(
        snapshot.principalVariations,
        color,
        variabilityRef.current,
      );

      if (!selectedVariation) {
        reportError(
          new Error(
            `ChessBot.Player did not receive a playable move for FEN "${activeSearch.fen}".`,
          ),
        );
        return;
      }

      const move = createBotMove(
        color,
        activeSearch.fen,
        snapshot.depth,
        selectedVariation,
      );

      currentSearchRef.current = null;

      if (!move) {
        reportError(
          new Error(
            `ChessBot.Player received an invalid best move for FEN "${activeSearch.fen}".`,
          ),
        );
        return;
      }

      scheduleMoveApplication(activeSearch, move);
    },
    [color, reportError, scheduleMoveApplication],
  );
  const handleEngineSnapshotRef = React.useRef(handleEngineSnapshot);
  handleEngineSnapshotRef.current = handleEngineSnapshot;

  const reportErrorRef = React.useRef(reportError);
  reportErrorRef.current = reportError;

  React.useEffect(() => {
    const nextState = buildBotState(botStateRef.current, {
      color,
      currentFen,
    });

    botStateRef.current = nextState;
    setBotState((previousState) =>
      areBotStatesEqual(previousState, nextState) ? previousState : nextState,
    );
  }, [color, currentFen]);

  React.useEffect(() => {
    callbacksRef.current.onStateChange?.(botState);
  }, [botState]);

  React.useEffect(() => {
    if (!botState.error) {
      reportedErrorRef.current = null;
      return;
    }

    if (reportedErrorRef.current === botState.error) {
      return;
    }

    reportedErrorRef.current = botState.error;
    callbacksRef.current.onError?.(botState.error);
  }, [botState.error]);

  React.useEffect(() => {
    engineReadyRef.current = false;
    cancelPendingWork();

    const engine = new StockfishEngine(stableWorkerOptions);
    const unsubscribe = engine.subscribe(() => {
      handleEngineSnapshotRef.current(engine.getSnapshot());
    });

    engineRef.current = engine;
    updateBotState({
      status: "initializing",
      isThinking: false,
      isReady: false,
      error: null,
    });

    engine
      .init()
      .then(() => {
        if (engineRef.current !== engine) {
          return;
        }

        engineReadyRef.current = true;

        if (strengthErrorRef.current) {
          updateBotState({
            status: "error",
            isThinking: false,
            isReady: true,
            error: strengthErrorRef.current,
          });
          return;
        }

        updateBotState({
          status: resolveIdleStatus(runtimeContextRef.current.paused),
          isThinking: false,
          isReady: true,
          error: null,
        });
      })
      .catch((error) => {
        if (engineRef.current !== engine) {
          return;
        }

        engineReadyRef.current = false;
        reportErrorRef.current(
          error instanceof Error ? error : new Error(String(error)),
        );
      });

    return () => {
      cancelPendingWork();
      unsubscribe();
      engine.destroy();

      if (engineRef.current === engine) {
        engineRef.current = null;
      }

      if (engineReadyRef.current) {
        engineReadyRef.current = false;
      }
    };
  }, [
    cancelPendingWork,
    stableWorkerOptions,
    updateBotState,
    workerOptionsKey,
  ]);

  const searchConfig = React.useMemo<StockfishConfig>(
    () => ({
      ...resolvedStrength.config,
      multiPV: resolvedVariability.multiPV,
    }),
    [resolvedStrength.config, resolvedVariability.multiPV],
  );
  const searchConfigKey = React.useMemo(
    () => buildStockfishConfigKey(searchConfig),
    [searchConfig],
  );
  const isBotTurn = game.turn() === color;

  React.useEffect(() => {
    if (!botState.isReady || !engineReadyRef.current) {
      return;
    }

    if (resolvedStrength.error) {
      cancelPendingWork();
      updateBotState({
        status: "error",
        isThinking: false,
        isReady: true,
        error: resolvedStrength.error,
      });
      return;
    }

    const canPlay =
      !paused && autoPlay && isLatestMove && !info.isGameOver && isBotTurn;

    if (!canPlay) {
      cancelPendingWork();
      updateBotState({
        status: resolveIdleStatus(paused),
        isThinking: false,
        isReady: true,
        error: null,
      });
      return;
    }

    if (delayedMoveRef.current?.fen === currentFen) {
      return;
    }

    if (
      currentSearchRef.current?.active &&
      currentSearchRef.current.fen === currentFen &&
      currentSearchRef.current.configKey === searchConfigKey
    ) {
      return;
    }

    cancelPendingWork();

    const searchId = searchIdRef.current + 1;
    searchIdRef.current = searchId;
    currentSearchRef.current = {
      id: searchId,
      fen: currentFen,
      configKey: searchConfigKey,
      active: true,
    };

    updateBotState({
      status: "thinking",
      isThinking: true,
      isReady: true,
      error: null,
    });
    callbacksRef.current.onThinkStart?.(currentFen, color);
    engineRef.current?.startAnalysis(currentFen, searchConfig);
  }, [
    autoPlay,
    cancelPendingWork,
    color,
    currentFen,
    info.isGameOver,
    isBotTurn,
    isLatestMove,
    paused,
    resolvedStrength.error,
    searchConfig,
    searchConfigKey,
    botState.isReady,
    updateBotState,
  ]);

  return null;
};

Player.displayName = "ChessBot.Player";
