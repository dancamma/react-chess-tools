import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Pause, Play, Timer } from "lucide-react";
import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";
import {
  formatClockTime,
  useChessClock,
} from "@react-chess-tools/react-chess-clock";

import { BOARD_THEME } from "./theme";
import type { Lesson } from "./catalog";
import { PuzzlePanel } from "./PuzzlePanel";

export interface SessionConfig {
  lessons: Lesson[];
  title: string;
  mode: "practice" | "sprint";
}
interface Result {
  lesson: Lesson;
  clean: boolean;
  solved: boolean;
}

export function Session({
  config,
  onExit,
  onComplete,
  onSprintEnd,
}: {
  config: SessionConfig;
  onExit: () => void;
  onComplete: (lesson: Lesson, clean: boolean) => void;
  onSprintEnd: (score: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [finished, setFinished] = useState(false);
  const assisted = useRef(false);
  const recorded = useRef(false);
  const sprintSaved = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const sprint = config.mode === "sprint";
  const clock = useChessClock({
    time: { baseTime: 180 },
    clockStart: "manual",
    onTimeout: () => setFinished(true),
  });
  const { start, pause, resume } = clock.methods;
  useEffect(() => {
    if (sprint) start();
  }, [sprint, start]);
  useEffect(() => {
    heading.current?.focus();
  }, [index, finished]);
  useEffect(() => {
    if (finished) {
      pause();
      if (sprint && !sprintSaved.current) {
        sprintSaved.current = true;
        onSprintEnd(results.filter((result) => result.solved).length);
      }
    }
  }, [finished, sprint, pause, results, onSprintEnd]);
  const paused = sprint && clock.status === "paused" && !finished;
  const lesson = config.lessons[index];
  const advance = () => {
    if (!recorded.current)
      setResults((previous) => [
        ...previous,
        { lesson, solved: false, clean: false },
      ]);
    if (index === config.lessons.length - 1) setFinished(true);
    else {
      assisted.current = false;
      recorded.current = false;
      setIndex(index + 1);
    }
  };
  const solve = () => {
    if (recorded.current || finished || (sprint && clock.times.white <= 0))
      return;
    recorded.current = true;
    const clean = !assisted.current;
    setResults((previous) => [...previous, { lesson, solved: true, clean }]);
    onComplete(lesson, clean);
  };
  if (finished) {
    const solved = results.filter((result) => result.solved).length;
    return (
      <main className="summary-page">
        <span className="summary-icon">
          <Check size={35} />
        </span>
        <span className="eyebrow">
          {sprint ? "SPRINT CONCLUSO" : "PERCORSO CONCLUSO"}
        </span>
        <h1 ref={heading} tabIndex={-1}>
          Una pausa ben spesa.
        </h1>
        <p>
          Hai risolto{" "}
          <strong>
            {solved} di {config.lessons.length}
          </strong>{" "}
          posizioni. {results.filter((result) => result.clean).length} senza
          errori né indizi.
        </p>
        <div className="summary-results">
          {config.lessons.map((item) => {
            const result = results.find((entry) => entry.lesson.id === item.id);
            return (
              <div key={item.id}>
                <span>{item.title}</span>
                <span>
                  {result?.solved
                    ? result.clean
                      ? "Risolta in autonomia"
                      : "Risolta con pratica"
                    : "Da riprendere"}
                </span>
              </div>
            );
          })}
        </div>
        <button className="button primary" onClick={onExit}>
          Torna al club <ArrowRight size={17} />
        </button>
        <p className="muted">
          Le idee migliori maturano anche lontano dalla scacchiera.
        </p>
      </main>
    );
  }
  return (
    <main className="session-page">
      <div className="session-heading">
        <button className="text-button" onClick={onExit}>
          <ArrowLeft size={16} /> Torna al club
        </button>
        <span>{config.title}</span>
        {sprint && (
          <div className="sprint-clock">
            <Timer size={17} />
            <span aria-label="Tempo rimanente">
              {formatClockTime(clock.times.white, "mm:ss")}
            </span>
            <button
              className="icon-button"
              onClick={paused ? resume : pause}
              aria-label={paused ? "Riprendi sprint" : "Pausa sprint"}
            >
              {paused ? <Play size={17} /> : <Pause size={17} />}
            </button>
          </div>
        )}
      </div>
      <div
        className="session-progress"
        aria-label={`Posizione ${index + 1} di ${config.lessons.length}`}
      >
        {config.lessons.map((item, position) => (
          <span
            className={
              position < index
                ? "complete"
                : position === index
                  ? "current"
                  : ""
            }
            key={item.id}
          />
        ))}
      </div>
      <ChessPuzzle.Root
        key={index}
        puzzle={lesson.puzzle}
        disabled={paused}
        onHint={() => {
          assisted.current = true;
        }}
        theme={BOARD_THEME}
        onSolve={solve}
        onFail={() => {
          assisted.current = true;
        }}
      >
        <PuzzlePanel
          lesson={lesson}
          index={index}
          total={config.lessons.length}
          paused={paused}
          sprint={sprint}
          advance={advance}
          onResume={resume}
          headingRef={heading}
        />
      </ChessPuzzle.Root>
    </main>
  );
}
