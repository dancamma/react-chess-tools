/**
 * StockfishEngine - Core class managing Stockfish Web Worker and UCI protocol.
 *
 * This class acts as an external store compatible with React's useSyncExternalStore.
 * It manages the complete lifecycle of a Stockfish worker including initialization,
 * position analysis, info message parsing, and cleanup.
 *
 * Key behaviors:
 * - Worker-scoped: Each instance owns its own Web Worker
 * - Throttled updates: Emits snapshots at ~10/sec with trailing edge emission
 * - Generation counter: Discards stale analysis when FEN changes rapidly
 * - White-normalized: All scores normalized to white's perspective
 *
 */

import type {
  AnalysisState,
  Evaluation,
  PrincipalVariation,
  PVMove,
  StockfishConfig,
  WorkerOptions,
} from "../types";
import {
  validateFen,
  uciToPvMoves,
  parseUciInfoLine,
  buildUciGoCommand,
} from "../utils/uci";
import { InvalidFenError, normalizeEvaluation } from "../utils/evaluation";
import { validateWorkerPath } from "../utils/workerPath";
import {
  configCompareEqual,
  getInitialState,
  DEFAULT_THROTTLE_MS,
  DEFAULT_TIMEOUT_MS,
} from "../utils/config";

/**
 * Analysis request that is pending to be started.
 */
interface PendingAnalysis {
  fen: string;
  config: StockfishConfig;
  generation: number;
}

/**
 * Internal engine state using a discriminated union.
 * Each state represents a distinct phase in the engine lifecycle.
 */
type InternalEngineState =
  | { type: "idle" }
  | {
      type: "initializing";
      pendingAnalysis: PendingAnalysis | null;
      resolveInit?: () => void;
      rejectInit?: (error: Error) => void;
    }
  | { type: "ready" }
  | {
      type: "analyzing";
      fen: string;
      config: StockfishConfig;
      generation: number;
    }
  | {
      type: "stopping";
      pendingAnalysis: PendingAnalysis | null;
      generation: number;
    }
  | { type: "error"; error: Error }
  | { type: "destroyed" };

/**
 * StockfishEngine class manages the Stockfish Web Worker and UCI protocol.
 *
 * @example
 * ```ts
 * const engine = new StockfishEngine({
 *   workerPath: "/stockfish/stockfish.js",
 *   throttleMs: 100,
 * });
 *
 * await engine.init();
 * engine.startAnalysis("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", { multiPV: 3 });
 *
 * // Subscribe for updates (useSyncExternalStore-compatible)
 * const unsubscribe = engine.subscribe(() => {
 *   const state = engine.getSnapshot();
 *   console.log(state.evaluation, state.principalVariations);
 * });
 *
 * // Cleanup
 * engine.destroy();
 * ```
 */
export class StockfishEngine {
  /** The Stockfish Web Worker instance. */
  private worker: Worker | null = null;
  /** Mutable internal state that is updated during analysis. */
  private mutableState: AnalysisState;
  /** Set of subscriber callbacks for useSyncExternalStore integration. */
  private listeners = new Set<() => void>();
  /** Cached immutable snapshot returned by getSnapshot(). */
  private cachedSnapshot: AnalysisState | null = null;
  /** Generation counter incremented on each startAnalysis to discard stale results. */
  private generation = 0;
  /** Timestamp of the last emitted update for throttling. */
  private lastUpdate = 0;
  /** Timeout ID for trailing edge throttling. */
  private trailingTimeout: ReturnType<typeof setTimeout> | null = null;
  /** UCI config options currently applied to the engine. */
  private appliedConfig: StockfishConfig = {};
  /** The FEN string currently being analyzed. */
  private currentFen: string = "";
  /** UCI config options pending application (will be applied on next analysis). */
  private pendingConfig: StockfishConfig = {};
  /** Number of incoming bestmove responses to skip (due to stop commands). */
  private skipBestMoveCount = 0;
  /**
   * True when we've sent `position`/`isready` and are waiting for `readyok`
   * before issuing `go`.
   */
  private waitingForAnalysisReadyOk = false;
  /** Generation associated with the pending analysis-ready handshake. */
  private pendingReadyOkGeneration: number | null = null;
  /** Timeout ID for initialization timeout. */
  private initTimeoutId: ReturnType<typeof setTimeout> | null = null;
  /**
   * Single initialization promise that is returned for all duplicate init() calls.
   * This prevents creating deeply nested promise chains when init() is called multiple times.
   */
  private initPromise: Promise<void> | null = null;

  /** Internal state machine */
  private engineState: InternalEngineState;

  private workerOptions: WorkerOptions;
  private throttleMs: number;
  private timeoutMs: number;

  constructor(workerOptions: WorkerOptions) {
    this.mutableState = getInitialState();
    this.engineState = { type: "idle" };
    this.workerOptions = workerOptions;
    this.throttleMs = workerOptions.throttleMs ?? DEFAULT_THROTTLE_MS;
    this.timeoutMs = workerOptions.timeout ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Helper to transition to a new state.
   * No-op if already in destroyed state (terminal state).
   */
  private transition(newState: InternalEngineState): void {
    if (this.engineState.type === "destroyed") return;
    this.engineState = newState;
  }

  /**
   * Map internal state to public status.
   */
  private getPublicStatus(): AnalysisState["status"] {
    switch (this.engineState.type) {
      case "idle":
      case "initializing":
        return "initializing";
      case "ready":
        return "ready";
      case "analyzing":
        return "analyzing";
      case "stopping":
        // If we have pending analysis, from user's perspective we're still analyzing
        return this.engineState.pendingAnalysis ? "analyzing" : "ready";
      case "error":
        return "error";
      case "destroyed":
        // Return last status (destroyed engines aren't queried)
        return this.mutableState.status;
    }
  }

  /**
   * Check if engine is currently analyzing (for deduplication logic).
   */
  private get isAnalyzing(): boolean {
    return (
      this.engineState.type === "analyzing" ||
      this.engineState.type === "stopping"
    );
  }

  /**
   * Check if engine is ready (for init guard).
   */
  private get isReady(): boolean {
    return (
      this.engineState.type === "ready" ||
      this.engineState.type === "analyzing" ||
      this.engineState.type === "stopping"
    );
  }

  /**
   * Initialize the Stockfish worker and perform UCI handshake.
   *
   * UCI protocol sequence:
   * 1. Create Web Worker
   * 2. Send `uci` command
   * 3. Wait for `uciok` response
   * 4. Send `isready` command
   * 5. Wait for `readyok` response
   * 6. Status becomes "ready"
   *
   * @throws {Error} If workerPath is invalid or worker fails to initialize
   * @throws {Error} If initialization times out after `timeout` ms
   * @throws {Error} If init() is called while already initializing or ready
   */
  async init(): Promise<void> {
    if (this.engineState.type === "destroyed") {
      throw new Error("Cannot initialize destroyed engine");
    }
    if (this.engineState.type === "error") {
      throw new Error(
        "Cannot recover an engine in error state. Remount the provider to retry.",
      );
    }

    // Guard against double initialization (React strict mode)
    // If already ready, resolve immediately
    if (this.isReady) {
      return;
    }

    // If currently initializing, return the existing promise
    if (this.initPromise) {
      return this.initPromise;
    }

    // Create and store the initialization promise
    this.initPromise = new Promise((resolve, reject) => {
      try {
        validateWorkerPath(this.workerOptions.workerPath);

        // Create Web Worker
        this.worker = new Worker(this.workerOptions.workerPath, {
          type: "classic",
        });

        // Set up message handler
        this.worker.addEventListener("message", this.handleMessage);
        this.worker.addEventListener("error", this.handleWorkerError);

        // Transition to initializing state with resolve/reject stored
        this.transition({
          type: "initializing",
          pendingAnalysis: null,
          resolveInit: resolve,
          rejectInit: reject,
        });

        // Set initialization timeout
        this.initTimeoutId = setTimeout(() => {
          this.handleError(
            new Error(
              `Stockfish initialization timeout after ${this.timeoutMs}ms`,
            ),
          );
        }, this.timeoutMs);

        // Start UCI handshake — sends "uci", the rest of the sequence
        // (uciok → isready → readyok) is handled in handleMessage()
        this.postMessage("uci");
      } catch (error) {
        this.handleError(error as Error);
        reject(error);
      }
    });

    return this.initPromise;
  }

  /**
   * Start analyzing a position.
   *
   * If already analyzing, the current analysis is stopped first.
   * The generation counter is incremented to discard any pending results
   * from the previous position.
   *
   * @param fen - FEN string of the position to analyze
   * @param config - UCI configuration options (skillLevel, depth, multiPV)
   */
  startAnalysis(fen: string, config: StockfishConfig = {}): void {
    if (this.engineState.type === "destroyed") return;
    if (this.engineState.type === "error") return;

    // Deduplicate: skip if FEN and config are the same
    if (
      this.currentFen === fen &&
      this.engineState.type === "analyzing" &&
      configCompareEqual(this.appliedConfig, config)
    ) {
      return;
    }

    // Validate FEN
    try {
      validateFen(fen);
    } catch (error) {
      if (error instanceof InvalidFenError) {
        // Set error in state but don't enter permanent error state
        this.mutableState.error = error;
        this.mutableState.status = "ready";
        this.mutableState.isEngineThinking = false;
        this.emitUpdate();
        return;
      }
      throw error;
    }

    // Increment generation to discard stale results
    this.generation++;
    const currentGeneration = this.generation;

    this.currentFen = fen;
    this.pendingConfig = { ...config };

    // Update state and clear stale analysis data
    this.mutableState.fen = fen;
    this.mutableState.config = { ...config };
    this.mutableState.error = null;
    this.mutableState.evaluation = null;
    this.mutableState.normalizedEvaluation = 0;
    this.mutableState.bestLine = null;
    this.mutableState.principalVariations = [];
    this.mutableState.depth = 0;
    this.mutableState.hasResults = false;

    // Emit update so subscribers see the cleared state immediately
    this.emitUpdate();
    this.lastUpdate = Date.now(); // Reset throttle timer on FEN change

    // Handle based on current state
    const currentState = this.engineState;

    if (currentState.type === "analyzing") {
      if (this.waitingForAnalysisReadyOk) {
        // We haven't started `go` yet; replace the pending start immediately.
        this.waitingForAnalysisReadyOk = false;
        this.pendingReadyOkGeneration = null;
        this.sendPositionAndGo(currentGeneration);
        return;
      }

      // Already analyzing - stop and restart
      this.postMessage("stop");
      // Transition to stopping with pending analysis
      this.transition({
        type: "stopping",
        pendingAnalysis: { fen, config, generation: currentGeneration },
        generation: currentState.generation,
      });
      return;
    }

    if (currentState.type === "stopping") {
      // Already stopping - just update the pending analysis
      this.transition({
        ...currentState,
        pendingAnalysis: { fen, config, generation: currentGeneration },
      });
      return;
    }

    if (currentState.type === "initializing") {
      // Queue the analysis to start after readyok
      this.transition({
        ...currentState,
        pendingAnalysis: { fen, config, generation: currentGeneration },
      });
      return;
    }

    // Start new analysis immediately (ready or idle state)
    this.sendPositionAndGo(currentGeneration);
  }

  /**
   * Stop the current analysis.
   *
   * Sends `stop` command to Stockfish. The engine will respond with `bestmove`
   * and then stop analyzing.
   */
  stopAnalysis(): void {
    if (this.engineState.type === "destroyed") return;

    const currentState = this.engineState;

    // Only act if we're analyzing or stopping with pending analysis
    if (
      currentState.type === "analyzing" ||
      (currentState.type === "stopping" && currentState.pendingAnalysis)
    ) {
      if (currentState.type === "analyzing") {
        if (!this.waitingForAnalysisReadyOk) {
          this.postMessage("stop");
          // Skip the next bestmove since it will be from the stopped analysis
          this.skipBestMoveCount++;
        }
        // If waitingForAnalysisReadyOk, we haven't sent go yet, so no need to send stop.
      }
      this.waitingForAnalysisReadyOk = false;
      this.pendingReadyOkGeneration = null;

      // Clear current FEN and transition to ready immediately
      // This matches the original behavior where isAnalyzing is set to false right away
      this.currentFen = "";
      this.transition({ type: "ready" });
      this.mutableState.status = "ready";
      this.mutableState.isEngineThinking = false;
      this.emitUpdate();
    }
  }

  /**
   * Get the best move from the current analysis.
   *
   * @returns The first move of the best PV line, or null if no results yet
   */
  getBestMove(): PVMove | null {
    return this.mutableState.bestLine?.moves[0] ?? null;
  }

  /**
   * Update the engine configuration.
   *
   * Changes will take effect on the next analysis start.
   *
   * @param config - Partial config options to update
   */
  setConfig(config: Partial<StockfishConfig>): void {
    if (this.engineState.type === "destroyed") return;
    if (this.engineState.type === "error") return;

    this.pendingConfig = { ...this.pendingConfig, ...config };

    // If in stopping state with pending analysis, update the pending config
    if (
      this.engineState.type === "stopping" &&
      this.engineState.pendingAnalysis
    ) {
      this.transition({
        ...this.engineState,
        pendingAnalysis: {
          ...this.engineState.pendingAnalysis,
          config: { ...this.engineState.pendingAnalysis.config, ...config },
        },
      });
      return;
    }

    // If currently analyzing, restart with new config
    if (this.engineState.type === "analyzing" && this.currentFen) {
      this.startAnalysis(this.currentFen, this.pendingConfig);
    }
  }

  /**
   * Subscribe to state updates.
   *
   * Compatible with React's useSyncExternalStore: the listener is a
   * zero-argument callback that signals "something changed", and
   * React will call getSnapshot() to read the new state.
   *
   * @param listener - Callback function called when state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get the current immutable state snapshot.
   *
   * This is used by React's useSyncExternalStore to read the current state.
   * Returns a deeply immutable snapshot to prevent external mutations from
   * affecting internal state.
   *
   * @returns Current state snapshot
   */
  getSnapshot(): AnalysisState {
    if (!this.cachedSnapshot) {
      this.cachedSnapshot = {
        ...this.mutableState,
        config: { ...this.mutableState.config },
        evaluation: this.cloneEvaluation(this.mutableState.evaluation),
        bestLine: this.mutableState.bestLine
          ? this.clonePV(this.mutableState.bestLine)
          : null,
        principalVariations: this.mutableState.principalVariations.map((pv) =>
          this.clonePV(pv),
        ),
        status: this.getPublicStatus(),
      };
    }
    return this.cachedSnapshot;
  }

  private cloneEvaluation(evaluation: Evaluation | null): Evaluation | null {
    return evaluation ? { ...evaluation } : null;
  }

  private clonePV(pv: PrincipalVariation): PrincipalVariation {
    return {
      ...pv,
      evaluation: this.cloneEvaluation(pv.evaluation),
      moves: [...pv.moves],
    };
  }

  /**
   * Normalize engine score to white's perspective.
   * Stockfish scores are from the side-to-move perspective.
   */
  private normalizeScoreToWhitePerspective(score: Evaluation): Evaluation {
    const sideToMove = this.currentFen.split(" ")[1];
    if (sideToMove === "b") {
      return { type: score.type, value: -score.value };
    }
    return score;
  }

  /**
   * Destroy the engine and clean up resources.
   *
   * Sends `quit` command to Stockfish, terminates the worker,
   * clears all listeners, and prevents further operations.
   */
  destroy(): void {
    if (this.engineState.type === "destroyed") return;

    // Reject init promise if pending (prevents hanging promises)
    if (
      this.engineState.type === "initializing" &&
      this.engineState.rejectInit
    ) {
      this.engineState.rejectInit(
        new Error("Engine was destroyed during initialization"),
      );
    }

    // Clear the stored init promise
    this.initPromise = null;
    this.waitingForAnalysisReadyOk = false;
    this.pendingReadyOkGeneration = null;

    // Clear trailing timeout
    if (this.trailingTimeout) {
      clearTimeout(this.trailingTimeout);
      this.trailingTimeout = null;
    }

    // Clear init timeout
    if (this.initTimeoutId) {
      clearTimeout(this.initTimeoutId);
      this.initTimeoutId = null;
    }

    // Send quit and terminate worker (before transitioning to destroyed)
    if (this.worker) {
      this.worker.postMessage("quit");
      this.worker.removeEventListener("message", this.handleMessage);
      this.worker.removeEventListener("error", this.handleWorkerError);
      this.worker.terminate();
      this.worker = null;
    }

    // Clear listeners
    this.listeners.clear();

    // Transition to destroyed state
    this.transition({ type: "destroyed" });
  }

  /**
   * Handle a message from the Stockfish worker.
   */
  private handleMessage = (event: MessageEvent): void => {
    if (this.engineState.type === "destroyed") return;

    const message = event.data?.toString();
    if (!message) return;

    // Handle UCI protocol messages
    for (const line of message.split("\n")) {
      if (!line) continue;

      if (line === "uciok") {
        // UCI initialization complete
        this.postMessage("isready");
        continue;
      }

      if (line === "readyok") {
        // Engine is ready
        this.handleReady();
        continue;
      }

      if (line.startsWith("info")) {
        // Analysis info line
        this.handleInfoLine(line);
        continue;
      }

      if (line.startsWith("bestmove")) {
        // Best move response (after stop or depth limit)
        this.handleBestMove(line);
        continue;
      }
    }
  };

  /**
   * Handle worker error event.
   */
  private handleWorkerError = (event: ErrorEvent): void => {
    if (this.engineState.type === "destroyed") return;

    this.handleError(new Error(`Stockfish worker error: ${event.message}`));
  };

  /**
   * Handle the readyok response.
   */
  private handleReady(): void {
    if (this.engineState.type !== "initializing") {
      if (!this.waitingForAnalysisReadyOk) return;

      const generation = this.pendingReadyOkGeneration;
      this.waitingForAnalysisReadyOk = false;
      this.pendingReadyOkGeneration = null;

      // Stale readyok for an outdated generation: ignore.
      if (generation === null || generation !== this.generation) {
        return;
      }

      this.postMessage(`go ${buildUciGoCommand(this.pendingConfig)}`);
      return;
    }

    // Clear init timeout
    if (this.initTimeoutId) {
      clearTimeout(this.initTimeoutId);
      this.initTimeoutId = null;
    }

    const currentState = this.engineState;
    const pendingAnalysis = currentState.pendingAnalysis;

    // Resolve init promise
    if (currentState.resolveInit) {
      currentState.resolveInit();
    }

    // Clear init promise
    this.initPromise = null;

    // Transition based on whether we have pending analysis
    if (pendingAnalysis) {
      // Start the pending analysis
      this.currentFen = pendingAnalysis.fen;
      this.pendingConfig = { ...pendingAnalysis.config };
      this.transition({
        type: "analyzing",
        fen: pendingAnalysis.fen,
        config: pendingAnalysis.config,
        generation: pendingAnalysis.generation,
      });
      this.sendPositionAndGo(pendingAnalysis.generation);
    } else {
      // Just ready
      this.transition({ type: "ready" });
      this.mutableState.status = "ready";
      this.emitUpdate();
    }
  }

  /**
   * Handle an info line from Stockfish.
   *
   * Info lines contain the analysis results including score, depth, and PV.
   * Multiple info lines are received as analysis progresses.
   */
  private handleInfoLine(line: string): void {
    if (this.engineState.type === "destroyed") return;
    if (
      this.engineState.type !== "analyzing" &&
      this.engineState.type !== "stopping"
    ) {
      return;
    }

    // Discard info lines from a previous generation (stale analysis after FEN change)
    if (this.engineState.generation !== this.generation) {
      return;
    }

    let info;
    try {
      info = parseUciInfoLine(line);
    } catch (error) {
      // Log malformed UCI info line and continue - don't crash the engine
      console.warn("Failed to parse UCI info line:", line, error);
      return;
    }
    if (!info) return;

    // Update depth
    if (info.depth !== undefined) {
      this.mutableState.depth = info.depth;
    }

    const whiteScore = info.score
      ? this.normalizeScoreToWhitePerspective(info.score)
      : undefined;
    const pvRank = info.multipv ?? 1;

    // Keep top-level evaluation aligned with PV1 (best line).
    if (whiteScore && pvRank === 1) {
      this.mutableState.evaluation = whiteScore;
      // Normalize using the utility function which handles mate scores correctly
      this.mutableState.normalizedEvaluation = normalizeEvaluation(whiteScore);
      this.mutableState.hasResults = true;
    }

    // Update principal variations if we have a PV
    if (info.pv && info.pv.length > 0) {
      const pvMoves = uciToPvMoves(info.pv, this.currentFen);

      const pv: PrincipalVariation = {
        rank: pvRank,
        evaluation: whiteScore ?? null,
        moves: pvMoves,
      };

      // Update or add PV
      const existingIndex = this.mutableState.principalVariations.findIndex(
        (p) => p.rank === pvRank,
      );

      if (existingIndex >= 0) {
        this.mutableState.principalVariations[existingIndex] = pv;
      } else {
        this.mutableState.principalVariations.push(pv);
      }

      // Sort by rank and update best line
      this.mutableState.principalVariations.sort((a, b) => a.rank - b.rank);
      this.mutableState.bestLine = this.mutableState.principalVariations[0];
    }

    // Emit throttled update
    this.emitThrottledUpdate();
  }

  /**
   * Handle a bestmove response.
   *
   * This is received after `stop` command or when depth limit is reached.
   *
   * The state machine handles race conditions by checking the current state:
   * - If in "stopping" with pending analysis, start the pending analysis
   * - If in "stopping" without pending analysis, transition to ready
   * - If in "ready", do nothing (already ready)
   */
  private handleBestMove(line: string): void {
    if (this.engineState.type === "destroyed") return;

    const currentState = this.engineState;

    // Parse bestmove
    // Format: "bestmove e2e4 ponder e7e5" or "bestmove (none)"
    const parts = line.split(" ");
    const bestMove = parts[1];

    if (bestMove && bestMove !== "(none)") {
      // We have a best move, update state
      this.mutableState.hasResults = true;
    }

    if (currentState.type === "stopping") {
      const pendingAnalysis = currentState.pendingAnalysis;

      if (pendingAnalysis) {
        // Start the pending analysis
        this.currentFen = pendingAnalysis.fen;
        this.pendingConfig = { ...pendingAnalysis.config };
        this.transition({
          type: "analyzing",
          fen: pendingAnalysis.fen,
          config: pendingAnalysis.config,
          generation: pendingAnalysis.generation,
        });
        this.sendPositionAndGo(pendingAnalysis.generation);
      } else {
        // No pending analysis, transition to ready
        this.transition({ type: "ready" });
        this.mutableState.status = "ready";
        this.mutableState.isEngineThinking = false;
        this.emitUpdate();
      }
    } else if (currentState.type === "analyzing") {
      // Natural completion (e.g., depth limit reached)
      // Skip this bestmove if we're expecting to skip stale responses
      if (this.skipBestMoveCount > 0) {
        this.skipBestMoveCount--;
        return;
      }
      this.transition({ type: "ready" });
      this.mutableState.status = "ready";
      this.mutableState.isEngineThinking = false;
      this.emitUpdate();
    }
    // If already in ready state, nothing to do
  }

  /**
   * Send position/config updates and request readyok before issuing `go`.
   */
  private sendPositionAndGo(generation: number): void {
    if (this.engineState.type === "destroyed") return;

    // Check if this generation is still current
    if (generation !== this.generation) return;

    // Apply config changes
    this.applyConfig();

    // Send position command
    this.postMessage(`position fen ${this.currentFen}`);

    // Wait for readyok before sending go so config/position updates are applied.
    this.waitingForAnalysisReadyOk = true;
    this.pendingReadyOkGeneration = generation;
    this.postMessage("isready");

    // Transition to analyzing state
    this.transition({
      type: "analyzing",
      fen: this.currentFen,
      config: this.pendingConfig,
      generation,
    });
    this.mutableState.status = "analyzing";
    this.mutableState.isEngineThinking = true;
    this.emitUpdate();
  }

  /**
   * Apply pending config changes to the engine.
   */
  private applyConfig(): void {
    if (this.engineState.type === "destroyed" || !this.worker) return;

    const config = this.pendingConfig;

    // Skill Level (UCI option name contains a space)
    this.applyUciOption("Skill Level", "skillLevel", config.skillLevel, 0, 20);

    // Multi PV
    this.applyUciOption("MultiPV", "multiPV", config.multiPV, 1, 500);

    // Note: depth is handled in the go command, not as a setoption
    this.appliedConfig.depth = config.depth;
  }

  private applyUciOption(
    uciName: string,
    key: keyof StockfishConfig,
    value: number | undefined,
    min: number,
    max: number,
  ): void {
    if (value !== undefined && value !== this.appliedConfig[key]) {
      const clamped = Math.max(min, Math.min(max, value));
      this.postMessage(`setoption name ${uciName} value ${clamped}`);
      this.appliedConfig[key] = clamped;
    }
  }

  /**
   * Emit an update immediately.
   */
  private emitUpdate(): void {
    if (this.engineState.type === "destroyed") return;

    // Invalidate cached snapshot so next getSnapshot() returns fresh data
    this.cachedSnapshot = null;

    this.listeners.forEach((listener) => listener());
  }

  /**
   * Emit a throttled update with trailing edge.
   *
   * This prevents overwhelming React with too many updates while ensuring
   * the final state is always emitted.
   */
  private emitThrottledUpdate(): void {
    if (this.engineState.type === "destroyed") return;

    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdate;

    if (timeSinceLastUpdate >= this.throttleMs) {
      // Leading edge: emit immediately
      this.emitUpdate();
      this.lastUpdate = now;

      // Cancel any pending trailing emission
      if (this.trailingTimeout) {
        clearTimeout(this.trailingTimeout);
        this.trailingTimeout = null;
      }
    } else if (!this.trailingTimeout) {
      // Schedule trailing edge emission
      const remainingTime = this.throttleMs - timeSinceLastUpdate;
      this.trailingTimeout = setTimeout(() => {
        if (this.engineState.type !== "destroyed") {
          this.emitUpdate();
          this.lastUpdate = Date.now();
        }
        this.trailingTimeout = null;
      }, remainingTime);
    }
  }

  /**
   * Handle an error.
   *
   * Sets the engine to error state and calls the error handler.
   */
  private handleError(error: Error): void {
    if (this.engineState.type === "destroyed") return;

    // Clear trailing timeout to prevent updates after error state
    if (this.trailingTimeout) {
      clearTimeout(this.trailingTimeout);
      this.trailingTimeout = null;
    }
    this.waitingForAnalysisReadyOk = false;
    this.pendingReadyOkGeneration = null;

    this.mutableState.status = "error";
    this.mutableState.error = error;
    this.mutableState.isEngineThinking = false;

    this.emitUpdate();

    // Reject init promise if pending - must do this before transitioning state
    const currentState = this.engineState;
    if (currentState.type === "initializing" && currentState.rejectInit) {
      currentState.rejectInit(error);
    }
    // Clear the stored promise after error
    this.initPromise = null;

    // Transition to error state
    this.transition({ type: "error", error });

    // Call error handler
    if (this.workerOptions.onError) {
      this.workerOptions.onError(error);
    }
  }

  /**
   * Send a message to the worker.
   */
  private postMessage(message: string): void {
    if (this.worker && this.engineState.type !== "destroyed") {
      this.worker.postMessage(message);
    }
  }
}
