import {
  ChessGameContextType,
  useChessGameContext,
} from "../../../hooks/useChessGameContext";
import { useKeyboardEvents } from "../../../hooks/useKeyboardEvents";

export type KeyboardEvents = Record<
  string,
  (context: ChessGameContextType) => void
>;

export const defaultKeyboardEvents: KeyboardEvents = {
  ArrowLeft: (context) => context.methods.goToPreviousMove(),
  ArrowRight: (context) => context.methods.goToNextMove(),
  ArrowUp: (context) => context.methods.goToStart(),
  ArrowDown: (context) => context.methods.goToEnd(),
};

type KeyboardEventsProps = {
  events?: KeyboardEvents;
};

export const KeyboardEvents: React.FC<KeyboardEventsProps> = ({ events }) => {
  console.log("events", events);
  const gameContext = useChessGameContext();
  if (!gameContext) {
    throw new Error("ChessGameContext not found");
  }
  const keyboardEvents = { ...defaultKeyboardEvents, ...events };
  useKeyboardEvents(keyboardEvents);
  return null;
};
