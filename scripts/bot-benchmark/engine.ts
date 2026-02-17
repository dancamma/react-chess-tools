import { spawn, ChildProcess } from "child_process";
import { resolve } from "path";
import type { BotConfig, DifficultyPreset } from "./types";
import { DIFFICULTY_PRESETS } from "./types";

interface AnalysisResult {
  bestMove: string;
  evaluation: number;
  depth: number;
}

interface PendingCommand {
  resolve: (value: string) => void;
  timeout: ReturnType<typeof setTimeout>;
}

export class StockfishEngine {
  private process: ChildProcess | null = null;
  private buffer: string = "";
  private pendingCommands: Map<string, PendingCommand> = new Map();
  private currentAnalysis: {
    resolve: ((result: AnalysisResult) => void) | null;
    timeout: ReturnType<typeof setTimeout> | null;
    bestMove: string | null;
    evaluation: number;
    depth: number;
  } | null = null;
  private isReady: boolean = false;
  private initResolve: (() => void) | null = null;
  private lastEval: number = 0;
  private lastBestMove: string | null = null;
  private currentPreset: DifficultyPreset = { depth: 10, uciElo: 2000 };

  async init(): Promise<void> {
    const stockfishPath = resolve(
      __dirname,
      "../../node_modules/stockfish/bin/stockfish.js",
    );

    this.process = spawn(process.execPath, [stockfishPath], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    this.process.stdout?.on("data", (data: Buffer) => {
      this.handleData(data.toString());
    });

    this.process.stderr?.on("data", (data: Buffer) => {
      console.error("[Stockfish stderr]", data.toString());
    });

    this.process.on("error", (err) => {
      console.error("[Stockfish error]", err);
    });

    await new Promise<void>((resolve) => {
      this.initResolve = resolve;
      this.sendCommand("uci");
    });

    await this.sendCommandAndWait("isready");
    this.isReady = true;
  }

  private handleData(data: string): void {
    this.buffer += data;
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() || "";

    for (const line of lines) {
      this.handleLine(line.trim());
    }
  }

  private handleLine(line: string): void {
    if (line === "uciok" && this.initResolve) {
      this.initResolve();
      this.initResolve = null;
      return;
    }

    if (line === "readyok") {
      const pending = this.pendingCommands.get("isready");
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve("readyok");
        this.pendingCommands.delete("isready");
      }
      return;
    }

    if (line.startsWith("bestmove")) {
      const parts = line.split(" ");
      const bestMove = parts[1];

      if (this.currentAnalysis) {
        if (this.currentAnalysis.timeout) {
          clearTimeout(this.currentAnalysis.timeout);
        }
        this.currentAnalysis.bestMove = bestMove;
        this.currentAnalysis.resolve?.({
          bestMove: bestMove === "(none)" ? "" : bestMove,
          evaluation: this.currentAnalysis.evaluation,
          depth: this.currentAnalysis.depth,
        });
        this.currentAnalysis = null;
      }
      return;
    }

    if (line.startsWith("info") && this.currentAnalysis) {
      const depthMatch = line.match(/depth\s+(\d+)/);
      const scoreMatch = line.match(/score\s+(cp|mate)\s+(-?\d+)/);
      const pvMatch = line.match(/pv\s+([a-h][1-8][a-h][1-8][qrbn]?)/);

      if (depthMatch) {
        this.currentAnalysis.depth = parseInt(depthMatch[1], 10);
      }

      if (pvMatch) {
        this.lastBestMove = pvMatch[1];
      }

      if (scoreMatch) {
        const type = scoreMatch[1];
        const value = parseInt(scoreMatch[2], 10);

        if (type === "cp") {
          this.currentAnalysis.evaluation = value;
          this.lastEval = value;
        } else if (type === "mate") {
          this.currentAnalysis.evaluation = value > 0 ? 10000 : -10000;
          this.lastEval = this.currentAnalysis.evaluation;
        }
      }
    }
  }

  private sendCommand(command: string): void {
    if (this.process?.stdin) {
      this.process.stdin.write(command + "\n");
    }
  }

  private async sendCommandAndWait(
    command: string,
    timeoutMs = 5000,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingCommands.delete(command);
        reject(new Error(`Timeout waiting for response to: ${command}`));
      }, timeoutMs);

      this.pendingCommands.set(command, { resolve, timeout });
      this.sendCommand(command);
    });
  }

  async configureBot(config: BotConfig): Promise<void> {
    const preset = DIFFICULTY_PRESETS[config.difficulty];
    this.currentPreset = preset;

    this.sendCommand(`setoption name UCI_LimitStrength value true`);
    this.sendCommand(`setoption name UCI_Elo value ${preset.uciElo}`);
  }

  async getBestMove(
    fen: string,
    config: BotConfig,
    timeoutMs = 5000,
  ): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error("Engine not initialized"));
        return;
      }

      const preset = DIFFICULTY_PRESETS[config.difficulty];
      this.lastBestMove = null;

      const timeout = setTimeout(() => {
        if (this.lastBestMove) {
          this.currentAnalysis = null;
          resolve({
            bestMove: this.lastBestMove,
            evaluation: this.lastEval,
            depth: 0,
          });
        } else {
          this.sendCommand("stop");
          setTimeout(() => {
            if (this.currentAnalysis) {
              this.currentAnalysis = null;
              reject(new Error(`Analysis timeout after ${timeoutMs}ms`));
            }
          }, 500);
        }
      }, timeoutMs);

      this.currentAnalysis = {
        resolve,
        timeout,
        bestMove: null,
        evaluation: this.lastEval,
        depth: 0,
      };

      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${this.currentPreset.depth}`);
    });
  }

  getLastEvaluation(): number {
    return this.lastEval;
  }

  destroy(): void {
    if (this.currentAnalysis?.timeout) {
      clearTimeout(this.currentAnalysis.timeout);
    }

    this.pendingCommands.forEach((cmd) => {
      clearTimeout(cmd.timeout);
    });
    this.pendingCommands.clear();

    if (this.process) {
      this.sendCommand("quit");
      this.process.kill();
      this.process = null;
    }
  }
}
