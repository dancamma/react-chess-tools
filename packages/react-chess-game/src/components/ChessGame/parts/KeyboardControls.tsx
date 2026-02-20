import React from "react";
import { ChessGameContextType } from "../../../hooks/useChessGameContext";
import { useKeyboardControls } from "../../../hooks/useKeyboardControls";

export type KeyboardControls = Record<
  string,
  (context: ChessGameContextType) => void
>;

export const defaultKeyboardControls: KeyboardControls = {
  ArrowLeft: (context) => context.methods.goToPreviousMove(),
  ArrowRight: (context) => context.methods.goToNextMove(),
  ArrowUp: (context) => context.methods.goToStart(),
  ArrowDown: (context) => context.methods.goToEnd(),
  Home: (context) => context.methods.goToStart(),
  End: (context) => context.methods.goToEnd(),
  f: (context) => context.methods.flipBoard(),
  F: (context) => context.methods.flipBoard(),
};

/**
 * Props for the KeyboardControls component
 *
 * Note: This is a logic-only component that returns null and does not render
 * any DOM elements. It sets up keyboard controls via the useKeyboardControls hook.
 * Therefore, it does not accept HTML attributes like className, style, etc.
 */
type KeyboardControlsProps = {
  controls?: KeyboardControls;
};

export const KeyboardControls: React.FC<KeyboardControlsProps> = ({
  controls,
}) => {
  const keyboardControls = { ...defaultKeyboardControls, ...controls };
  useKeyboardControls(keyboardControls);
  return null;
};

KeyboardControls.displayName = "ChessGame.KeyboardControls";
