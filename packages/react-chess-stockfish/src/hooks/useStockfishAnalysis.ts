/**
 * Internal hook managing the StockfishEngine lifecycle within ChessStockfish.Root.
 *
 * This hook creates a StockfishEngine on mount, destroys it on unmount,
 * reads state via useSyncExternalStore, and auto-starts analysis on FEN/config changes.
 *
 * Not exported from the package — used only by ChessStockfish.Root.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import { StockfishEngine } from "../engine/stockfishEngine";
import type {
  AnalysisInfo,
  AnalysisMethods,
  AnalysisState,
  Evaluation,
  PVMove,
  StockfishConfig,
  WorkerOptions,
} from "../types";
import { getInitialState } from "../utils/config";

interface UseStockfishAnalysisProps {
  fen: string;
  config?: StockfishConfig;
  workerOptions: WorkerOptions;
  onEvaluationChange?: (evaluation: Evaluation | null) => void;
  onDepthChange?: (depth: number) => void;
  onError?: (error: Error) => void;
}

interface UseStockfishAnalysisReturn {
  info: AnalysisInfo;
  methods: AnalysisMethods;
}

/** Convert internal AnalysisState to public AnalysisInfo (drops fen/config). */
function toAnalysisInfo(state: AnalysisState): AnalysisInfo {
  return {
    analyzedFen: state.hasResults ? state.fen : "",
    evaluation: state.evaluation,
    normalizedEvaluation: state.normalizedEvaluation,
    bestLine: state.bestLine,
    principalVariations: state.principalVariations,
    depth: state.depth,
    status: state.status,
    isEngineThinking: state.isEngineThinking,
    hasResults: state.hasResults,
    error: state.error,
  };
}

/** Cached initial state for the fallback path in getSnapshot (avoids infinite loop). */
const INITIAL_STATE: AnalysisState = getInitialState();

export function useStockfishAnalysis({
  fen,
  config = {},
  workerOptions,
  onEvaluationChange,
  onDepthChange,
  onError,
}: UseStockfishAnalysisProps): UseStockfishAnalysisReturn {
  const engineRef = useRef<StockfishEngine | null>(null);

  // Store callbacks in refs to avoid triggering effects when they change
  const onEvaluationChangeRef = useRef(onEvaluationChange);
  const onDepthChangeRef = useRef(onDepthChange);
  const onErrorRef = useRef(onError);

  onEvaluationChangeRef.current = onEvaluationChange;
  onDepthChangeRef.current = onDepthChange;
  onErrorRef.current = onError;

  // Store workerOptions in a ref to use in the subscribe/getSnapshot callbacks
  // without causing re-subscriptions. The engine is created once on mount.
  const workerOptionsRef = useRef(workerOptions);
  workerOptionsRef.current = workerOptions;

  // Track previous values for callback invocation
  const prevEvaluationRef = useRef<Evaluation | null>(null);
  const prevDepthRef = useRef<number>(0);
  const prevErrorRef = useRef<Error | null>(null);

  // Initialize engine on mount, destroy on unmount
  useEffect(() => {
    const engine = new StockfishEngine(workerOptionsRef.current);
    engineRef.current = engine;
    let isMounted = true;

    engine.init().catch(() => {
      // Error is handled internally by the engine (sets error state).
      // We catch here to avoid unhandled promise rejection.
      // Only handle if component is still mounted.
      if (isMounted) {
        // Engine will update its state via subscriptions
      }
    });

    return () => {
      isMounted = false;
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Subscribe/getSnapshot for useSyncExternalStore
  const subscribe = useCallback((listener: () => void) => {
    const engine = engineRef.current;
    if (!engine) {
      // Return no-op unsubscribe function when engine not yet created
      return () => {};
    }
    return engine.subscribe(listener);
  }, []);

  const getSnapshot = useCallback((): AnalysisState => {
    const engine = engineRef.current;
    if (!engine) return INITIAL_STATE;
    return engine.getSnapshot();
  }, []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot);

  // Invoke callbacks when values change
  useEffect(() => {
    const { evaluation, depth, error } = snapshot;

    // Check if evaluation changed (using deep comparison for object equality)
    const evaluationChanged =
      prevEvaluationRef.current?.type !== evaluation?.type ||
      prevEvaluationRef.current?.value !== evaluation?.value;

    if (evaluationChanged && onEvaluationChangeRef.current) {
      onEvaluationChangeRef.current(evaluation);
    }
    prevEvaluationRef.current = evaluation;

    // Check if depth changed
    if (prevDepthRef.current !== depth && onDepthChangeRef.current) {
      onDepthChangeRef.current(depth);
    }
    prevDepthRef.current = depth;

    // Check if error changed (identity comparison preserves repeated same-message errors)
    const errorChanged = prevErrorRef.current !== error;
    if (errorChanged && error && onErrorRef.current) {
      onErrorRef.current(error);
    }
    prevErrorRef.current = error;
  }, [snapshot]);

  // Auto-start analysis on FEN/config change
  const configRef = useRef(config);
  configRef.current = config;

  // Track config changes for effect dependency (serialized for stable comparison)
  const configKey = useMemo(() => JSON.stringify(config ?? {}), [config]);

  useEffect(() => {
    engineRef.current?.startAnalysis(fen, configRef.current);
  }, [fen, configKey]);

  // Convert snapshot to AnalysisInfo
  const info = useMemo(() => toAnalysisInfo(snapshot), [snapshot]);

  // Stable methods that don't change on every render
  const methods = useMemo<AnalysisMethods>(
    () => ({
      startAnalysis: () => {
        engineRef.current?.startAnalysis(fen, configRef.current);
      },
      stopAnalysis: () => {
        engineRef.current?.stopAnalysis();
      },
      getBestMove: (): PVMove | null => {
        return engineRef.current?.getBestMove() ?? null;
      },
      setConfig: (newConfig: Partial<StockfishConfig>) => {
        engineRef.current?.setConfig(newConfig);
      },
    }),
    [fen],
  );

  return { info, methods };
}
