import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Flag,
  Leaf,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { ChessGame } from "@react-chess-tools/react-chess-game";

import { COLLECTIONS, LESSONS, getLessons, type Lesson } from "./catalog";
import {
  completeLesson,
  EMPTY_PROGRESS,
  parseProgress,
  STORAGE_KEY,
  type Progress,
} from "./progress";
import { Session, type SessionConfig } from "./Session";
import { Help } from "./Help";
import { BOARD_THEME } from "./theme";

function Rook({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="26"
      height="30"
      viewBox="0 0 32 36"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 29h22v5H5zm3-4 2-13h12l2 13zM6 8V1h5v4h3V1h4v4h3V1h5v7z" />
    </svg>
  );
}

export function App() {
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      return parseProgress(
        localStorage.getItem(STORAGE_KEY),
        LESSONS.map((lesson) => lesson.id),
      );
    } catch {
      return { ...EMPTY_PROGRESS, completions: [] };
    }
  });
  const [view, setView] = useState<"club" | "progress">("club");
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      setStorageAvailable(false);
    }
  }, [progress]);
  const completed = new Set(progress.completions.map((entry) => entry.id));
  const date = new Date();
  const day = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  );
  const daily = LESSONS[day % LESSONS.length];
  const start = (
    lessons: Lesson[],
    title: string,
    mode: "practice" | "sprint" = "practice",
  ) => setSession({ lessons, title, mode });
  return (
    <div className="app-shell">
      <header className="header">
        <button
          className="wordmark"
          aria-label="Tempo, torna al club"
          onClick={() => {
            setSession(null);
            setView("club");
          }}
        >
          <span className="logo">
            <Rook />
          </span>
          tempo<span className="wordmark-dot">.</span>
        </button>
        <nav aria-label="Navigazione principale">
          <button
            className={
              !session && view === "club" ? "nav-link active" : "nav-link"
            }
            onClick={() => {
              setSession(null);
              setView("club");
            }}
          >
            Il club
          </button>
          <button
            className={
              !session && view === "progress" ? "nav-link active" : "nav-link"
            }
            onClick={() => {
              setSession(null);
              setView("progress");
            }}
          >
            I tuoi progressi
          </button>
        </nav>
        <button
          className="icon-button help-button"
          aria-label="Come funziona"
          onClick={() => setHelp(true)}
        >
          <CircleHelp size={21} />
        </button>
      </header>
      {!storageAvailable && (
        <div className="storage-note" role="status">
          Il browser non permette il salvataggio: puoi allenarti, ma i progressi
          dureranno solo per questa visita.
        </div>
      )}
      {session ? (
        <Session
          config={session}
          onExit={() => setSession(null)}
          onComplete={(lesson, clean) =>
            setProgress((previous) =>
              completeLesson(previous, lesson.id, clean),
            )
          }
          onSprintEnd={(score) =>
            setProgress((previous) => ({
              ...previous,
              bestSprint: Math.max(previous.bestSprint, score),
            }))
          }
        />
      ) : view === "progress" ? (
        <main className="progress-page">
          <span className="eyebrow">IL TUO TACCUINO</span>
          <h1>Ogni idea resta.</h1>
          <p className="muted">
            Non serve correre. Serve tornare sulla scacchiera.
          </p>
          <div className="stats-grid">
            <Stat
              value={`${completed.size}/${LESSONS.length}`}
              label="Posizioni risolte"
              icon={<Target size={20} />}
            />
            <Stat
              value={String(
                progress.completions.filter((entry) => entry.clean).length,
              )}
              label="Senza errori né indizi"
              icon={<Check size={20} />}
            />
            <Stat
              value={String(progress.bestSprint)}
              label="Record nello sprint"
              icon={<Trophy size={20} />}
            />
          </div>
          <div className="progress-list">
            {LESSONS.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => start([lesson], lesson.title)}
              >
                <span
                  className={
                    completed.has(lesson.id) ? "completion done" : "completion"
                  }
                >
                  {completed.has(lesson.id) ? <Check size={18} /> : <span />}
                </span>
                <span>
                  <strong>{lesson.title}</strong>
                  <small>{lesson.motif}</small>
                </span>
                <span className="progress-status">
                  {completed.has(lesson.id) ? "Ripassa" : "Da esplorare"}
                  <ChevronRight size={17} />
                </span>
              </button>
            ))}
          </div>
          <p className="local-note">
            Salvato solo su questo dispositivo.{" "}
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Vuoi cancellare tutti i progressi di Tempo su questo dispositivo?",
                  )
                )
                  setProgress({ ...EMPTY_PROGRESS, completions: [] });
              }}
            >
              Azzera i progressi
            </button>
          </p>
        </main>
      ) : (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="live-dot" /> IL TUO PICCOLO CLUB DI SCACCHI
              </span>
              <h1>
                Una pausa.
                <br />
                Una scacchiera.
                <br />
                <em>Un'idea in più.</em>
              </h1>
              <p>
                Bastano pochi minuti per vedere qualcosa
                <br className="desktop-break" /> che prima ti sfuggiva. Il resto
                può aspettare.
              </p>
              <button
                className="button primary"
                onClick={() => start([daily], "La posizione del giorno")}
              >
                La posizione del giorno <ArrowRight size={18} />
              </button>
              <span className="hero-meta">
                <Leaf size={14} /> Senza fretta. Senza account.
              </span>
            </div>
            <div className="hero-art">
              <div className="board-caption">
                <span>LA MOSSA È LÌ. TROVALA.</span>
                <span>01 — 08</span>
              </div>
              <div className="preview-board" aria-hidden="true">
                <ChessGame.Root fen={LESSONS[0].puzzle.fen} theme={BOARD_THEME}>
                  <ChessGame.Board
                    tabIndex={-1}
                    options={{
                      canDragPiece: () => false,
                      onSquareClick: () => {},
                      allowDrawingArrows: false,
                      showNotation: false,
                    }}
                  />
                </ChessGame.Root>
              </div>
              <div className="art-sticker">
                <span>♘</span>
                <div>
                  Allena lo sguardo.<small>Il punteggio viene dopo.</small>
                </div>
              </div>
              <span className="art-footnote">MENO SCROLL. PIÙ SCACCHI.</span>
            </div>
          </section>
          <section className="club-bar" aria-label="I tuoi numeri">
            <div>
              <span className="club-bar-icon">
                <BookOpen size={20} />
              </span>
              <strong>Un piccolo rituale, ogni giorno.</strong>
            </div>
            <span>
              <b>{completed.size}</b> / {LESSONS.length} posizioni esplorate
            </span>
            <button onClick={() => setView("progress")}>
              Il tuo taccuino <ArrowRight size={15} />
            </button>
          </section>
          <section className="collections">
            <div className="section-heading">
              <div>
                <span className="eyebrow">SCEGLI IL TUO PERCORSO</span>
                <h2>Un tema. Un po' di pratica.</h2>
              </div>
              <span className="section-note">
                Posizioni curate, idee da portare con te.
              </span>
            </div>
            <div className="collection-grid">
              {COLLECTIONS.map((collection) => {
                const done = collection.ids.filter((id) =>
                  completed.has(id),
                ).length;
                return (
                  <button
                    className={`collection-card ${collection.color}`}
                    key={collection.id}
                    onClick={() =>
                      start(getLessons(collection.ids), collection.title)
                    }
                  >
                    <div className="card-art">
                      <span className="card-number">{collection.number}</span>
                      <span className="chess-art" aria-hidden="true">
                        {collection.id === "essentials"
                          ? "♜"
                          : collection.id === "forcing"
                            ? "♞"
                            : "♛"}
                      </span>
                      <span className="art-grid" />
                    </div>
                    <div className="card-content">
                      <span className="eyebrow">{collection.label}</span>
                      <h3>{collection.title}</h3>
                      <p>{collection.subtitle}</p>
                      <div className="card-bottom">
                        <span>
                          {collection.ids.length}{" "}
                          {collection.ids.length === 1
                            ? "posizione"
                            : "posizioni"}
                          <i />
                          {collection.minutes} min
                        </span>
                        <span className="card-arrow">
                          <ArrowRight size={19} />
                        </span>
                      </div>
                      {done > 0 && (
                        <span className="card-progress">
                          <Check size={12} /> {done}/{collection.ids.length}{" "}
                          completate
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
          <section className="sprint-banner">
            <div className="sprint-icon">
              <Timer size={30} />
            </div>
            <div>
              <span className="eyebrow">HAI TRE MINUTI?</span>
              <h2>Meno tempo. Più intuito.</h2>
              <p>
                Otto posizioni, un timer. Scopri quante idee riesci a vedere.
              </p>
            </div>
            <button
              className="button dark"
              onClick={() =>
                start([...LESSONS], "Sprint di tre minuti", "sprint")
              }
            >
              Inizia lo sprint <Flag size={17} />
            </button>
          </section>
        </main>
      )}
      <footer>
        <span>
          <Rook /> Una buona abitudine, una mossa alla volta.
        </span>
        <span>
          Fatto con react-chess-tools <span aria-hidden="true">↗</span>
        </span>
      </footer>
      {help && <Help close={() => setHelp(false)} />}
    </div>
  );
}

function Stat({
  value,
  label,
  icon,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="stat">
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
