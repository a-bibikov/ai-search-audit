import type { Finding, Level } from "./types.ts";

const PENALTY: Record<Level, number> = { error: 15, warn: 5, info: 0 };
/** A warning on at least half of the audited pages is a site-wide problem: it costs more than a single slip. */
const WIDE_WARN = 10;
const WIDE_SHARE = 0.5;
/** Below this share of checks that could run, the site is not fully audited and cannot get an A. */
const MIN_COVERAGE = 2 / 3;

export interface Score {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  counts: Record<Level, number>;
  /** Checks that ran on this site and all active checks: «14 of 20». */
  checked: number;
  total: number;
  /** The grade was lowered to B because too few checks could run. */
  capped: boolean;
}

export interface ScoreContext {
  /** Audited pages, to weigh how widespread a problem is. */
  pages?: number;
  checked?: number;
  total?: number;
}

const worstOf = (findings: Finding[]): Level =>
  findings.reduce<Level>((w, f) => (PENALTY[f.level] > PENALTY[w] ? f.level : w), "info");

/**
 * Pages a rule's worst findings are about: notes next to a warning do not make the warning wider,
 * and site-wide findings are not counted as pages.
 */
export const pagesOf = (findings: Finding[]) => {
  const worst = worstOf(findings);
  return new Set(findings.filter((f) => f.level === worst && f.where !== "site").map((f) => f.where)).size;
};

/** What one rule costs: its worst level, and a warning on most pages costs more than a warning on one. */
export function penaltyOf(findings: Finding[], pages = 0): number {
  if (!findings.length) return 0;
  const worst = worstOf(findings);
  if (worst === "warn" && pages > 0 && pagesOf(findings) / pages >= WIDE_SHARE) return WIDE_WARN;
  return PENALTY[worst];
}

/**
 * 100 minus a penalty per rule, not per page: a rule counts once, so a large site with one template bug is not
 * punished 500 times — but a warning that covers most pages counts double.
 */
export function scoreOf(findings: Finding[], ctx: ScoreContext = {}): Score {
  const byRule = new Map<string, Finding[]>();
  for (const f of findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);
  const penalty = [...byRule.values()].reduce((s, list) => s + penaltyOf(list, ctx.pages ?? 0), 0);
  const score = Math.max(0, 100 - penalty);
  let grade: Score["grade"] = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const checked = ctx.checked ?? 0;
  const total = ctx.total ?? 0;
  const capped = grade === "A" && total > 0 && checked / total < MIN_COVERAGE;
  if (capped) grade = "B";
  const counts = { error: 0, warn: 0, info: 0 };
  for (const f of findings) counts[f.level]++;
  return { score, grade, counts, checked, total, capped };
}
