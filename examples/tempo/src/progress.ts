export const STORAGE_KEY = "tempo.progress.v1";

export interface Completion {
  id: string;
  clean: boolean;
  completedAt: string;
}

export interface Progress {
  version: 1;
  completions: Completion[];
  bestSprint: number;
}

export const EMPTY_PROGRESS: Progress = {
  version: 1,
  completions: [],
  bestSprint: 0,
};

export function parseProgress(
  raw: string | null,
  validIds: readonly string[],
): Progress {
  if (!raw) return { ...EMPTY_PROGRESS, completions: [] };
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.completions))
      return { ...EMPTY_PROGRESS, completions: [] };
    const completions: Completion[] = [];
    for (const entry of data.completions) {
      if (
        !entry ||
        !validIds.includes(entry.id) ||
        typeof entry.clean !== "boolean" ||
        typeof entry.completedAt !== "string" ||
        !Number.isFinite(Date.parse(entry.completedAt))
      )
        continue;
      if (!completions.some((item) => item.id === entry.id))
        completions.push({
          id: entry.id,
          clean: entry.clean,
          completedAt: entry.completedAt,
        });
    }
    return {
      version: 1,
      completions,
      bestSprint:
        Number.isInteger(data.bestSprint) &&
        data.bestSprint >= 0 &&
        data.bestSprint <= validIds.length
          ? data.bestSprint
          : 0,
    };
  } catch {
    return { ...EMPTY_PROGRESS, completions: [] };
  }
}

export function completeLesson(
  progress: Progress,
  id: string,
  clean: boolean,
  now = new Date(),
): Progress {
  const previous = progress.completions.find((entry) => entry.id === id);
  return {
    ...progress,
    completions: [
      ...progress.completions.filter((entry) => entry.id !== id),
      {
        id,
        clean: clean || previous?.clean === true,
        completedAt: now.toISOString(),
      },
    ],
  };
}
