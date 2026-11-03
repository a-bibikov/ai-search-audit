import { crawl, type CrawlOptions } from "./crawl.ts";
import { DEFAULT_LANG, messages, type Lang } from "./i18n/index.ts";
import { rules } from "./rules/index.ts";
import { scoreOf, type Score } from "./score.ts";
import type { Config, Finding, Group, Level } from "./types.ts";

export type { Config, Finding, Rule } from "./types.ts";
export { DEFAULT_LANG, LANGS, isLang, messages, type Lang, type Messages } from "./i18n/index.ts";
export { rules } from "./rules/index.ts";
export { toMarkdown } from "./report.ts";

export const defaultConfig: Config = { trainingBots: "any", disable: [], maxPages: 20, lang: DEFAULT_LANG };

export interface Report extends Score {
  site: string;
  /** Language of every text in the report: rule titles, fixes, messages. */
  lang: Lang;
  checkedAt: string;
  pages: string[];
  findings: Finding[];
  /** `skipped` is the reason a check did not run on this site. */
  rules: { id: string; group: Group; level: Level; title: string; fix: string; impact: string; skipped?: string }[];
}

export async function audit(target: string, opts: { base?: string; config?: Partial<Config>; urls?: string[]; log?: CrawlOptions["log"] } = {}): Promise<Report> {
  const config = { ...defaultConfig, ...opts.config };
  const t = messages(config.lang);
  const site = await crawl(target, opts.base, { maxPages: config.maxPages, urls: opts.urls, log: opts.log });
  const active = rules.filter((r) => !config.disable.includes(r.id));
  // A check that cannot run here is reported as «not checked» with the reason, never as passed.
  const skipped = new Map(active.map((r) => [r.id, r.applies?.(site, t.m) ?? null]));
  const findings = active.filter((r) => !skipped.get(r.id)).flatMap((r) => r.run(site, config, t.m));
  return {
    site: site.base,
    lang: config.lang,
    checkedAt: new Date().toISOString(),
    pages: site.pages.map((p) => p.fetched.publicUrl),
    ...scoreOf(findings, { pages: site.pages.length, checked: active.filter((r) => !skipped.get(r.id)).length, total: active.length }),
    findings,
    rules: active.map(({ id, group, level }) => ({ id, group, level, ...t.rules[id], ...(skipped.get(id) ? { skipped: skipped.get(id)! } : {}) })),
  };
}
