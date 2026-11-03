import { crawl, type CrawlOptions } from "./crawl.ts";
import { rules } from "./rules/index.ts";
import { scoreOf, type Score } from "./score.ts";
import type { Config, Finding, Rule } from "./types.ts";

export type { Config, Finding, Rule } from "./types.ts";
export { rules } from "./rules/index.ts";
export { toMarkdown } from "./report.ts";

export const defaultConfig: Config = { trainingBots: "any", disable: [], maxPages: 20 };

export interface Report extends Score {
  site: string;
  checkedAt: string;
  pages: string[];
  findings: Finding[];
  rules: Pick<Rule, "id" | "group" | "level" | "title" | "fix">[];
}

export async function audit(target: string, opts: { base?: string; config?: Partial<Config>; urls?: string[]; log?: CrawlOptions["log"] } = {}): Promise<Report> {
  const config = { ...defaultConfig, ...opts.config };
  const site = await crawl(target, opts.base, { maxPages: config.maxPages, urls: opts.urls, log: opts.log });
  const active = rules.filter((r) => !config.disable.includes(r.id));
  const findings = active.flatMap((r) => r.run(site, config));
  return {
    site: site.base,
    checkedAt: new Date().toISOString(),
    pages: site.pages.map((p) => p.fetched.publicUrl),
    ...scoreOf(findings),
    findings,
    rules: active.map(({ id, group, level, title, fix }) => ({ id, group, level, title, fix })),
  };
}
