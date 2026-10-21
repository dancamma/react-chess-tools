import React, { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Timer,
} from "lucide-react";
import { Chess } from "chess.js";
import {
  ChessGame,
  useChessGameContext,
} from "@react-chess-tools/react-chess-game";
import {
  ChessPuzzle,
  useChessPuzzleContext,
} from "@react-chess-tools/react-chess-puzzle";

import { BOARD_THEME } from "./theme";
import type { Lesson } from "./catalog";

export function PuzzlePanel({
  lesson,
  index,
  total,
  paused,
  sprint,
  advance,
  onResume,
  headingRef,
}: {
  lesson: Lesson;
  index: number;
  total: number;
  paused: boolean;
  sprint: boolean;
  advance: () => void;
  onResume: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const puzzle = useChessPuzzleContext();
  const game = useChessGameContext();
  const [move, setMove] = useState("");
  const [error, setError] = useState("");
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const solved = puzzle.status === "solved";
  const failed = puzzle.status === "failed";
  const playerColor = lesson.puzzle.fen.split(" ")[1];
  const locked = solved || failed || paused || !puzzle.isPlayerTurn;
  const solutionGame = new Chess(lesson.puzzle.fen);
  const solutionMoves = lesson.puzzle.moves.map(
    (item) => solutionGame.move(item).san,
  );
  const replay = () => {
    const copy = new Chess(lesson.puzzle.fen);
    for (const item of lesson.puzzle.moves.slice(0, reviewIndex ?? 0))
      copy.move(item);
    return copy.fen();
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (locked) return;
    if (!game.isLatestMove) game.methods.goToEnd();
    const notation = move.trim();
    try {
      // Validate against a copy so chess.js cannot mutate the context in place.
      const candidate = new Chess(game.game.fen()).move(notation);
      game.methods.makeMove({
        from: candidate.from,
        to: candidate.to,
        promotion: candidate.promotion,
      });
      setMove("");
      setError("");
    } catch {
      setError(
        "Mossa non legale. Usa e2e4 o la notazione inglese, per esempio Nf3.",
      );
    }
  };
  return (
    <div className="puzzle-layout">
      <section className="board-section" aria-label="Scacchiera e mosse">
        <div className="player-label">
          <span
            className={
              game.orientation === "w" ? "player-dot black" : "player-dot"
            }
          />
          {game.orientation === "w" ? "Nero" : "Bianco"}
          <span>
            {game.orientation === playerColor ? "L'AVVERSARIO" : "IL TUO LATO"}
          </span>
        </div>
        <div className="live-board">
          {reviewIndex === null ? (
            <ChessPuzzle.Board
              aria-label="Scacchiera del problema"
              promotionDialogLabel="Scegli il pezzo per la promozione"
              promotionLabels={{
                q: "Donna",
                r: "Torre",
                n: "Cavallo",
                b: "Alfiere",
              }}
            />
          ) : (
            <ChessGame.Root
              fen={replay()}
              orientation={game.orientation}
              theme={BOARD_THEME}
            >
              <ChessGame.Board
                aria-label="Rivedi la soluzione"
                options={{ canDragPiece: () => false, onSquareClick: () => {} }}
              />
            </ChessGame.Root>
          )}
          {paused && (
            <div className="paused-overlay">
              <Pause size={30} />
              <h3>Un momento di pausa.</h3>
              <button className="button primary" onClick={onResume}>
                Riprendi <Play size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="player-label">
          <span
            className={
              game.orientation === "w" ? "player-dot" : "player-dot black"
            }
          />
          {game.orientation === "w" ? "Bianco" : "Nero"}
          <span>
            {game.orientation === playerColor ? "IL TUO LATO" : "L'AVVERSARIO"}
          </span>
          <button
            className="icon-button"
            onClick={game.methods.flipBoard}
            aria-label="Ruota la scacchiera"
          >
            <RotateCw size={17} />
          </button>
        </div>
        <form className="move-form" onSubmit={submit}>
          <label htmlFor="move-input">La tua mossa</label>
          <div>
            <input
              id="move-input"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="es. e2e4 oppure Nf3"
              value={move}
              onChange={(event) => {
                setMove(event.target.value);
                setError("");
              }}
              disabled={locked}
              aria-describedby={error ? "move-error" : "move-help"}
              aria-invalid={!!error}
            />
            <button
              className="button primary"
              disabled={locked || !move.trim()}
              type="submit"
            >
              Gioca <ArrowRight size={16} />
            </button>
          </div>
          <small id="move-help">
            Puoi anche selezionare o trascinare i pezzi sulla scacchiera.
          </small>
          {error && (
            <p id="move-error" className="input-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <details className="position-description">
          <summary>Leggi la posizione</summary>
          <p>
            Giochi con il {playerColor === "w" ? "Bianco" : "Nero"}.{" "}
            {game.game.turn() === "w" ? "Muove il Bianco." : "Muove il Nero."}
          </p>
          <ul>
            {game.game
              .board()
              .flat()
              .filter((piece) => piece !== null)
              .map((piece) => (
                <li key={piece.square}>
                  {
                    {
                      k: "Re",
                      q: "Donna",
                      r: "Torre",
                      b: "Alfiere",
                      n: "Cavallo",
                      p: "Pedone",
                    }[piece.type]
                  }{" "}
                  {piece.color === "w" ? "bianco" : "nero"} in {piece.square}
                </li>
              ))}
          </ul>
        </details>
      </section>
      <section className="lesson-panel">
        <span className="eyebrow">
          POSIZIONE {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>
        <h1 ref={headingRef} tabIndex={-1}>
          {lesson.title}
        </h1>
        <div className="lesson-tags">
          <span>{lesson.motif}</span>
          <span>{lesson.difficulty}</span>
        </div>
        <p className="lesson-prompt">{lesson.prompt}</p>
        <div
          className={`feedback ${solved ? "success" : failed ? "failure" : "neutral"}`}
          aria-live="polite"
          role="status"
        >
          <span className="feedback-icon">
            {solved ? (
              <Check size={20} />
            ) : failed ? (
              <RotateCcw size={20} />
            ) : (
              <TargetIcon />
            )}
          </span>
          <div>
            <strong>
              {solved
                ? "Hai visto l'idea."
                : failed
                  ? "Un'idea da rivedere."
                  : paused
                    ? "Sprint in pausa."
                    : puzzle.status === "in-progress"
                      ? "Bene. Continua il piano."
                      : "Prenditi il tuo tempo."}
            </strong>
            <p>
              {solved
                ? "Ora fai tua la logica della posizione."
                : failed
                  ? "La mossa è legale, ma non segue la combinazione. Riparti e prova un'altra strada."
                  : "Cerca scacchi, catture e minacce. In quest'ordine."}
            </p>
          </div>
        </div>
        {solved ? (
          <>
            <div className="explanation">
              <span className="eyebrow">L'IDEA DA PORTARE VIA</span>
              <p>{lesson.explanation}</p>
            </div>
            <div className="solution-line">
              <span>Una linea possibile</span>
              <strong>{solutionMoves.join(" · ")}</strong>
            </div>
            <div className="replay-controls">
              <button
                className="button secondary"
                onClick={() => setReviewIndex(0)}
              >
                <BookIcon /> Rivedi la linea
              </button>
              {reviewIndex !== null && (
                <>
                  <button
                    className="icon-button"
                    disabled={reviewIndex === 0}
                    onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))}
                    aria-label="Mossa precedente"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span>
                    {reviewIndex}/{solutionMoves.length}
                  </span>
                  <button
                    className="icon-button"
                    disabled={reviewIndex === solutionMoves.length}
                    onClick={() =>
                      setReviewIndex(
                        Math.min(solutionMoves.length, reviewIndex + 1),
                      )
                    }
                    aria-label="Mossa successiva"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>
            <button className="button primary next-button" onClick={advance}>
              {index === total - 1 ? "Concludi" : "La prossima idea"}
              <ArrowRight size={18} />
            </button>
          </>
        ) : (
          <>
            <div className="lesson-actions">
              {failed ? (
                <button
                  className="button primary"
                  disabled={paused}
                  onClick={() => {
                    puzzle.resetPuzzle();
                    setError("");
                    setMove("");
                  }}
                >
                  <RotateCcw size={17} /> Riprova
                </button>
              ) : (
                <button
                  className="button secondary"
                  disabled={paused || !puzzle.isPlayerTurn}
                  onClick={() => {
                    puzzle.onHint();
                  }}
                >
                  <Lightbulb size={17} />
                  {puzzle.hint === "none"
                    ? "Un piccolo indizio"
                    : "Mostra la destinazione"}
                </button>
              )}
              <button
                className="text-button"
                disabled={paused}
                onClick={advance}
              >
                Salta <ArrowRight size={16} />
              </button>
            </div>
            <div className="coach-note">
              <span>↳</span>
              <p>
                {sprint
                  ? "Il timer continua tra una posizione e l'altra. La velocità è un gioco: capire è il vero obiettivo."
                  : "Un errore non è tempo perso. È un dettaglio che la prossima volta vedrai prima."}
              </p>
            </div>
          </>
        )}
        {sprint && (
          <span className="sprint-mode-label">
            <Flag size={14} /> MODALITÀ SPRINT · 3 MINUTI
          </span>
        )}
      </section>
    </div>
  );
}

function TargetIcon() {
  return <Timer size={20} />;
}
function BookIcon() {
  return <Play size={15} />;
}
