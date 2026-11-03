import type { Finding, Level } from "./types.ts";

const PENALTY: Record<Level, number> = { error: 15, warn: 5, info: 0 };

export interface Score {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  counts: Record<Level, number>;
}

/**
 * 100 minus a penalty per rule, not per page: a rule counts once at its worst level, so a large site with one
 * template bug is not punished 500 times.
 */
export function scoreOf(findings: Finding[]): Score {
  const worst = new Map<string, Level>();
  for (const f of findings) {
    const prev = worst.get(f.rule);
    if (!prev || PENALTY[f.level] > PENALTY[prev]) worst.set(f.rule, f.level);
  }
  const score = Math.max(0, 100 - [...worst.values()].reduce((s, l) => s + PENALTY[l], 0));
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const counts = { error: 0, warn: 0, info: 0 };
  for (const f of findings) counts[f.level]++;
  return { score, grade, counts };
}
