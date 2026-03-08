import type { EngineType, StockfishConfig, WorkerOptions } from "../types";

type NumericConfigKey =
  | "threads"
  | "hash"
  | "skillLevel"
  | "multiPV"
  | "moveOverhead"
  | "elo";

type BooleanConfigKey = "ponder" | "limitStrength";

type OptionDescriptor =
  | {
      type: "spin";
      key: NumericConfigKey;
      uciName: string;
      defaultValue: number;
      min: number;
      max: number;
    }
  | {
      type: "check";
      key: BooleanConfigKey;
      uciName: string;
      defaultValue: boolean;
    };

interface EngineBehaviorConfigContext {
  appliedConfig: StockfishConfig;
  config: StockfishConfig;
  postMessage: (message: string) => void;
}

export interface EngineBehavior {
  engineType: EngineType;
  applyConfig(context: EngineBehaviorConfigContext): void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function applySpinOption(
  appliedConfig: StockfishConfig,
  postMessage: (message: string) => void,
  descriptor: Extract<OptionDescriptor, { type: "spin" }>,
  value: number,
): void {
  const normalizedValue = clamp(value, descriptor.min, descriptor.max);

  if (appliedConfig[descriptor.key] === normalizedValue) {
    return;
  }

  postMessage(`setoption name ${descriptor.uciName} value ${normalizedValue}`);
  appliedConfig[descriptor.key] = normalizedValue;
}

function applyCheckOption(
  appliedConfig: StockfishConfig,
  postMessage: (message: string) => void,
  descriptor: Extract<OptionDescriptor, { type: "check" }>,
  value: boolean,
): void {
  if (appliedConfig[descriptor.key] === value) {
    return;
  }

  postMessage(`setoption name ${descriptor.uciName} value ${value}`);
  appliedConfig[descriptor.key] = value;
}

function createBehavior(
  engineType: EngineType,
  descriptors: OptionDescriptor[],
): EngineBehavior {
  return {
    engineType,
    applyConfig({
      appliedConfig,
      config,
      postMessage,
    }: EngineBehaviorConfigContext) {
      for (const descriptor of descriptors) {
        if (descriptor.type === "spin") {
          applySpinOption(
            appliedConfig,
            postMessage,
            descriptor,
            config[descriptor.key] ?? descriptor.defaultValue,
          );
          continue;
        }

        applyCheckOption(
          appliedConfig,
          postMessage,
          descriptor,
          config[descriptor.key] ?? descriptor.defaultValue,
        );
      }

      appliedConfig.depth = config.depth;
    },
  };
}

const COMMON_OPTIONS: OptionDescriptor[] = [
  {
    type: "spin",
    key: "threads",
    uciName: "Threads",
    defaultValue: 1,
    min: 1,
    max: 1024,
  },
  {
    type: "spin",
    key: "hash",
    uciName: "Hash",
    defaultValue: 16,
    min: 1,
    max: 33554432,
  },
  {
    type: "spin",
    key: "multiPV",
    uciName: "MultiPV",
    defaultValue: 1,
    min: 1,
    max: 500,
  },
  {
    type: "spin",
    key: "moveOverhead",
    uciName: "Move Overhead",
    defaultValue: 10,
    min: 0,
    max: 5000,
  },
  {
    type: "check",
    key: "ponder",
    uciName: "Ponder",
    defaultValue: false,
  },
  {
    type: "check",
    key: "limitStrength",
    uciName: "UCI_LimitStrength",
    defaultValue: false,
  },
  {
    type: "spin",
    key: "elo",
    uciName: "UCI_Elo",
    defaultValue: 1320,
    min: 1320,
    max: 3190,
  },
];

const STOCKFISH_BEHAVIOR = createBehavior("stockfish", [
  ...COMMON_OPTIONS,
  {
    type: "spin",
    key: "skillLevel",
    uciName: "Skill Level",
    defaultValue: 20,
    min: 0,
    max: 20,
  },
]);

const FAIRY_STOCKFISH_BEHAVIOR = createBehavior("fairy-stockfish", [
  {
    type: "spin",
    key: "threads",
    uciName: "Threads",
    defaultValue: 1,
    min: 1,
    max: 512,
  },
  ...COMMON_OPTIONS.filter((descriptor) => descriptor.key !== "threads"),
  {
    type: "spin",
    key: "skillLevel",
    uciName: "Skill Level",
    defaultValue: 20,
    min: -20,
    max: 20,
  },
]);

export function getEngineBehavior(
  workerOptions: Pick<WorkerOptions, "engineType">,
): EngineBehavior {
  if (workerOptions.engineType === "fairy-stockfish") {
    return FAIRY_STOCKFISH_BEHAVIOR;
  }

  return STOCKFISH_BEHAVIOR;
}
