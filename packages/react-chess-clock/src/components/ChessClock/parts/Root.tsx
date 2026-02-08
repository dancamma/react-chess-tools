import React from "react";
import type { ReactNode } from "react";
import { ChessClockContext } from "../../../hooks/useChessClockContext";
import { useChessClock } from "../../../hooks/useChessClock";
import type { TimeControlConfig } from "../../../types";

export interface ChessClockRootProps {
  timeControl: TimeControlConfig;
  children: ReactNode;
}

/**
 * ChessClock.Root - Context provider for chess clock components
 * Manages clock state and provides it to child components
 *
 * @example
 * ```tsx
 * <ChessClock.Root timeControl={{ time: "5+3" }}>
 *   <ChessClock.Display color="white" />
 *   <ChessClock.Display color="black" />
 * </ChessClock.Root>
 * ```
 */
export const Root: React.FC<React.PropsWithChildren<ChessClockRootProps>> = ({
  timeControl,
  children,
}) => {
  const clockState = useChessClock(timeControl);

  return (
    <ChessClockContext.Provider value={clockState}>
      {children}
    </ChessClockContext.Provider>
  );
};

Root.displayName = "ChessClock.Root";
