import React, { useState, useEffect, useCallback, useRef } from "react";
import { useChessGameContext } from "../../hooks/useChessGameContext";
import type { ClockColor } from "@react-chess-tools/react-chess-clock";

// ============================================================================
// Server-Controlled Clock Helpers
// ============================================================================

export interface ServerState {
  whiteTime: number;
  blackTime: number;
  activePlayer: ClockColor;
  running: boolean;
  finished: boolean;
}

export interface SimulatedServerReturn {
  serverState: ServerState;
  clientView: ServerState;
  lagMs: number;
  setLagMs: (lag: number) => void;
  serverMove: () => void;
  serverReset: () => void;
  addTime: (player: ClockColor, ms: number) => void;
}

/**
 * Simulates a chess server that is authoritative over clock times.
 *
 * Storybook helper - not part of the public API.
 *
 * - The server ticks independently and pushes time updates to the client.
 * - `lagMs` simulates network delay: the client receives stale values, then
 *   snaps to the real server value once the "network response" arrives.
 * - `addTime` / `removeTime` let you manipulate server time directly,
 *   demonstrating that the client always follows the server.
 */
export function useSimulatedServer(
  initialTimeMs: number,
  incrementMs: number,
): SimulatedServerReturn {
  // True server state — this is the authority
  const serverRef = useRef<ServerState>({
    whiteTime: initialTimeMs,
    blackTime: initialTimeMs,
    activePlayer: "white",
    running: false,
    finished: false,
  });

  // What the client sees — may be delayed by simulated lag
  const [clientView, setClientView] = useState<ServerState>(serverRef.current);
  const [lagMs, setLagMs] = useState(0);

  // Push current server state to the client (with optional lag)
  const pushToClient = useCallback(() => {
    const snapshot = { ...serverRef.current };
    if (lagMs === 0) {
      setClientView(snapshot);
    } else {
      setTimeout(() => setClientView(snapshot), lagMs);
    }
  }, [lagMs]);

  // Server tick — decrements the active player's time every 100ms
  useEffect(() => {
    if (!serverRef.current.running || serverRef.current.finished) return;

    const id = setInterval(() => {
      const s = serverRef.current;
      if (!s.running || s.finished) return;

      const key = s.activePlayer === "white" ? "whiteTime" : "blackTime";
      const newTime = Math.max(0, s[key] - 100);
      serverRef.current = {
        ...s,
        [key]: newTime,
        running: newTime > 0,
        finished: newTime === 0,
      };
      pushToClient();
    }, 100);

    return () => clearInterval(id);
  }, [clientView.running, clientView.finished, pushToClient]);

  // Server receives a move — switches active player, applies increment
  const serverMove = useCallback(() => {
    const s = serverRef.current;
    if (s.finished) return;
    const key = s.activePlayer === "white" ? "whiteTime" : "blackTime";
    serverRef.current = {
      ...s,
      [key]: s[key] + incrementMs,
      activePlayer: s.activePlayer === "white" ? "black" : "white",
      running: true,
    };
    pushToClient();
  }, [incrementMs, pushToClient]);

  // Direct server-side time manipulation
  const addTime = useCallback(
    (player: ClockColor, ms: number) => {
      const s = serverRef.current;
      const key = player === "white" ? "whiteTime" : "blackTime";
      serverRef.current = { ...s, [key]: Math.max(0, s[key] + ms) };
      pushToClient();
    },
    [pushToClient],
  );

  const serverReset = useCallback(() => {
    serverRef.current = {
      whiteTime: initialTimeMs,
      blackTime: initialTimeMs,
      activePlayer: "white",
      running: false,
      finished: false,
    };
    pushToClient();
  }, [initialTimeMs, pushToClient]);

  return {
    serverState: serverRef.current,
    clientView,
    lagMs,
    setLagMs,
    serverMove,
    serverReset,
    addTime,
  };
}

/**
 * Child component that watches for new moves and notifies the simulated server.
 *
 * Storybook helper - not part of the public API.
 *
 * Must be rendered inside ChessGame.Root to access game context.
 */
export function ServerMoveDetector({ onMove }: { onMove: () => void }) {
  const { game } = useChessGameContext();
  const moveCount = game.history().length;
  const prevMoveCount = useRef(moveCount);

  useEffect(() => {
    if (moveCount > prevMoveCount.current) {
      onMove();
    }
    prevMoveCount.current = moveCount;
  }, [moveCount, onMove]);

  return null;
}

/**
 * Child component that syncs server times into the clock via setTime().
 *
 * Storybook helper - not part of the public API.
 */
export function ServerTimeSync({
  serverTimes,
}: {
  serverTimes: { white: number; black: number };
}) {
  const { clock } = useChessGameContext();
  const prevTimes = useRef(serverTimes);

  useEffect(() => {
    if (!clock) return;
    if (serverTimes.white !== prevTimes.current.white) {
      clock.methods.setTime("white", serverTimes.white);
    }
    if (serverTimes.black !== prevTimes.current.black) {
      clock.methods.setTime("black", serverTimes.black);
    }
    prevTimes.current = serverTimes;
  }, [serverTimes, clock]);

  return null;
}

export function GameStatus({ className }: { className?: string }) {
  const { info, clock } = useChessGameContext();

  const timeout = clock?.timeout;
  const status = clock?.status;

  let message: string | null = null;

  if (timeout) {
    const winner = timeout === "white" ? "Black" : "White";
    message = `${winner} wins on time`;
  } else if (info.isCheckmate) {
    const winner = info.turn === "w" ? "Black" : "White";
    message = `Checkmate! ${winner} wins`;
  } else if (info.isStalemate) {
    message = "Stalemate - Draw";
  } else if (info.isThreefoldRepetition) {
    message = "Draw by repetition";
  } else if (info.isInsufficientMaterial) {
    message = "Draw by insufficient material";
  } else if (info.isDraw) {
    message = "Draw";
  }

  if (!message && status !== "finished") return null;

  return (
    <div
      className={className}
      style={{
        padding: "8px 16px",
        background: message ? "#1a1a2e" : "#f5f5f5",
        borderRadius: "8px",
        fontWeight: 600,
        fontSize: "14px",
        color: message ? "#fff" : "#666",
        textAlign: "center",
      }}
    >
      {message || "Game in progress"}
    </div>
  );
}
