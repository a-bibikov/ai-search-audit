import { crawl, defaultConfig as engineDefaults, runRules, scoreOf, type CrawlOptions, type Report } from "auditor-engine";
import { collect } from "./collect.ts";
import { messages } from "./i18n/index.ts";
import { rules } from "./rules/index.ts";
import type { Config } from "./types.ts";

export type { AiExtras, Config, Fetched, Finding, Group, JsonLdNode, Level, Page, Robots, Rule, Site, Sitemap } from "./types.ts";
export type { Messages, RuleId } from "./i18n/index.ts";
export { LANGS, messages, isLang, DEFAULT_LANG, type Lang } from "./i18n/index.ts";
export { rules } from "./rules/index.ts";
export { collect, type CollectOptions } from "./collect.ts";
export { isArticle, articleNode, quote, markdownLinks } from "./rules/util.ts";
export { SEARCH_AGENTS, TRAINING_AGENTS } from "./agents.ts";
// The report comes from auditor-engine: re-exported, so `import { audit, toMarkdown } from "ai-search-auditor"` works.
export { toMarkdown, toJSON, parsePages, type Report, type MarkdownOptions, type JsonReport, type JsonFinding } from "auditor-engine";

export const TOOL = { name: "ai-search-auditor", url: "https://github.com/a-bibikov/ai-search-audit" };

export const defaultConfig: Config = { ...engineDefaults, trainingBots: "any" };

export interface AuditOptions {
  base?: string;
  config?: Partial<Config>;
  /** Explicit page list instead of the sitemap. */
  urls?: string[];
  log?: CrawlOptions["log"];
}

/** Crawls the site, collects what AI search reads besides the pages and runs the AI search checks. */
export async function audit(target: string, opts: AuditOptions = {}): Promise<Report> {
  const config: Config = { ...defaultConfig, ...opts.config };
  const t = messages(config.lang);
  const crawled = await crawl(target, opts.base, { maxPages: config.maxPages, urls: opts.urls, log: opts.log });
  const site = await collect(crawled, { log: opts.log });
  const run = runRules(site, rules, config, t.m, t.rules);
  const audited = site.pages.map((p) => p.fetched.publicUrl);
  return {
    site: site.base,
    lang: config.lang,
    checkedAt: new Date().toISOString(),
    pages: audited,
    ...scoreOf(run.findings, { pages: site.pages.length, audited, checked: run.checked, total: run.total }),
    findings: run.findings,
    rules: run.rules,
    groups: t.report.groups,
    chrome: { title: t.report.title, clean: t.report.clean, footer: t.report.footer },
    tool: TOOL,
  };
}
