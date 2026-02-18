import { useState, useCallback, useRef, useEffect } from "react";
import type { DifficultyLevel } from "../types";

export type GameResult = "white-wins" | "black-wins" | "draw";

export interface MatchupResult {
  whiteWins: number;
  blackWins: number;
  draws: number;
  total: number;
}

export interface ActiveSlot {
  slotId: number;
  matchup: { white: DifficultyLevel; black: DifficultyLevel };
  gameKey: number;
}

export interface TournamentState {
  isRunning: boolean;
  totalGames: number;
  activeSlots: ActiveSlot[];
  lastResult: GameResult | null;
  results: Map<string, MatchupResult>;
}

export interface UseBotTournamentOptions {
  minLevel?: DifficultyLevel;
  maxLevel?: DifficultyLevel;
  concurrency?: number;
}

function getResultKey(white: DifficultyLevel, black: DifficultyLevel): string {
  return `${white}-${black}`;
}

function createEmptyResult(): MatchupResult {
  return { whiteWins: 0, blackWins: 0, draws: 0, total: 0 };
}

export function useBotTournament(options: UseBotTournamentOptions = {}) {
  const { minLevel = 1, maxLevel = 8, concurrency = 4 } = options;

  const [state, setState] = useState<TournamentState>({
    isRunning: false,
    totalGames: 0,
    activeSlots: [],
    lastResult: null,
    results: new Map(),
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const generateMatchups = useCallback((): Array<{
    white: DifficultyLevel;
    black: DifficultyLevel;
  }> => {
    const matchups: Array<{ white: DifficultyLevel; black: DifficultyLevel }> =
      [];
    for (let w = minLevel; w <= maxLevel; w++) {
      for (let b = minLevel; b <= maxLevel; b++) {
        if (w !== b) {
          matchups.push({
            white: w as DifficultyLevel,
            black: b as DifficultyLevel,
          });
        }
      }
    }
    return matchups;
  }, [minLevel, maxLevel]);

  const getNextMatchup = useCallback((): {
    white: DifficultyLevel;
    black: DifficultyLevel;
  } | null => {
    const matchups = generateMatchups();
    const current = stateRef.current;

    // Get matchups currently being played
    const activeKeys = new Set(
      current.activeSlots.map((slot) =>
        getResultKey(slot.matchup.white, slot.matchup.black),
      ),
    );

    // Find a matchup not currently being played
    for (const matchup of matchups) {
      const key = getResultKey(matchup.white, matchup.black);
      if (activeKeys.has(key)) continue;

      const result = current.results.get(key);
      if (!result || result.total === 0) {
        return matchup;
      }
    }

    // All matchups have been played at least once, pick random non-active
    const availableMatchups = matchups.filter((m) => {
      const key = getResultKey(m.white, m.black);
      return !activeKeys.has(key);
    });

    if (availableMatchups.length === 0) {
      return matchups[0]; // Fallback
    }

    const randomIndex = Math.floor(Math.random() * availableMatchups.length);
    return availableMatchups[randomIndex];
  }, [generateMatchups]);

  const recordResult = useCallback(
    (
      slotId: number,
      white: DifficultyLevel,
      black: DifficultyLevel,
      result: GameResult,
    ) => {
      setState((prev) => {
        const key = getResultKey(white, black);
        const current = prev.results.get(key) || createEmptyResult();

        const updated: MatchupResult = {
          ...current,
          total: current.total + 1,
          whiteWins: current.whiteWins + (result === "white-wins" ? 1 : 0),
          blackWins: current.blackWins + (result === "black-wins" ? 1 : 0),
          draws: current.draws + (result === "draw" ? 1 : 0),
        };

        const newResults = new Map(prev.results);
        newResults.set(key, updated);

        // Remove the completed slot and potentially add a new one
        let newActiveSlots = prev.activeSlots.filter(
          (s) => s.slotId !== slotId,
        );

        if (prev.isRunning && newActiveSlots.length < concurrency) {
          const nextMatchup = getNextMatchup();
          if (nextMatchup) {
            newActiveSlots = [
              ...newActiveSlots,
              {
                slotId,
                matchup: nextMatchup,
                gameKey: Date.now(),
              },
            ];
          }
        }

        return {
          ...prev,
          totalGames: prev.totalGames + 1,
          lastResult: result,
          activeSlots: newActiveSlots,
          results: newResults,
        };
      });
    },
    [concurrency, getNextMatchup],
  );

  const start = useCallback(() => {
    setState((prev) => {
      const initialSlots: ActiveSlot[] = [];
      for (let i = 0; i < concurrency; i++) {
        const matchup = getNextMatchup();
        if (matchup) {
          initialSlots.push({
            slotId: i,
            matchup,
            gameKey: Date.now() + i,
          });
        }
      }
      return {
        ...prev,
        isRunning: true,
        activeSlots: initialSlots,
      };
    });
  }, [concurrency, getNextMatchup]);

  const stop = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isRunning: false,
      activeSlots: [],
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      totalGames: 0,
      activeSlots: [],
      lastResult: null,
      results: new Map(),
    });
  }, []);

  const getResultsMatrix = useCallback(() => {
    const matrix: Record<number, Record<number, MatchupResult | null>> = {};

    for (let row = minLevel; row <= maxLevel; row++) {
      matrix[row] = {};
      for (let col = minLevel; col <= maxLevel; col++) {
        if (row === col) {
          matrix[row][col] = null;
        } else {
          const key = getResultKey(
            row as DifficultyLevel,
            col as DifficultyLevel,
          );
          matrix[row][col] = state.results.get(key) || createEmptyResult();
        }
      }
    }

    return matrix;
  }, [state.results, minLevel, maxLevel]);

  const getTotalForRow = useCallback(
    (row: DifficultyLevel): MatchupResult => {
      let total = createEmptyResult();
      for (let col = minLevel; col <= maxLevel; col++) {
        if (row !== col) {
          const key = getResultKey(row, col as DifficultyLevel);
          const result = state.results.get(key);
          if (result) {
            total = {
              whiteWins: total.whiteWins + result.whiteWins,
              blackWins: total.blackWins + result.blackWins,
              draws: total.draws + result.draws,
              total: total.total + result.total,
            };
          }
        }
      }
      return total;
    },
    [state.results, minLevel, maxLevel],
  );

  return {
    state,
    actions: {
      start,
      stop,
      reset,
      recordResult,
    },
    helpers: {
      getResultsMatrix,
      getTotalForRow,
    },
  };
}
