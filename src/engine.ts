import type { Finding, Level, Rule, Site } from "./types.ts";

/** What a report says about a rule, in the report's language. */
export interface RuleTexts {
  title: string;
  /** How to fix it, one or two sentences. */
  fix: string;
  /** What it costs the business, one sentence: used in «What to do first». */
  impact: string;
}

export interface ReportRule extends RuleTexts {
  id: string;
  group: string;
  level: Level;
  /** Why the check did not run on this site; absent when it ran. */
  skipped?: string;
}

export interface RunResult {
  findings: Finding[];
  rules: ReportRule[];
  /** Checks that ran and all active checks. */
  checked: number;
  total: number;
}

/**
 * Runs a rule set on a crawled site: the engine behind `audit`, open to other rule sets (search-auditor runs its
 * SEO rules and these AI rules on one crawl). A rule that does not apply is returned with its reason, never as passed.
 */
export function runRules<M, C extends { disable?: string[] }>(site: Site, rules: Rule<M, C>[], config: C, t: M, texts: Record<string, RuleTexts>): RunResult {
  const active = rules.filter((r) => !(config.disable ?? []).includes(r.id));
  const skipped = new Map(active.map((r) => [r.id, r.applies?.(site, t) ?? null]));
  const findings = active.filter((r) => !skipped.get(r.id)).flatMap((r) => r.run(site, config, t));
  return {
    findings,
    rules: active.map(({ id, group, level }) => {
      const text = texts[id];
      if (!text) throw new Error(`No title, fix and impact for rule ${id}`);
      const reason = skipped.get(id);
      return { id, group, level, ...text, ...(reason ? { skipped: reason } : {}) };
    }),
    checked: active.filter((r) => !skipped.get(r.id)).length,
    total: active.length,
  };
}
