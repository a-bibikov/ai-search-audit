import { crawl, type CrawlOptions } from "./crawl.ts";
import { runRules, type ReportRule } from "./engine.ts";
import { DEFAULT_LANG, messages, type Lang, type Messages } from "./i18n/index.ts";
import { rules } from "./rules/index.ts";
import { scoreOf, type Score } from "./score.ts";
import type { Config, Finding } from "./types.ts";

export type { Config, Fetched, Finding, Group, JsonLdNode, Level, Page, Robots, Rule, Site, Sitemap } from "./types.ts";
export { DEFAULT_LANG, LANGS, isLang, messages, type Lang, type Messages } from "./i18n/index.ts";
export { rules } from "./rules/index.ts";
export { toMarkdown } from "./report.ts";

// The engine, for other rule sets: crawl once, run rules, score and render the same report.
export { crawl, parsePages, pickPages, type CrawlOptions } from "./crawl.ts";
export { runRules, type ReportRule, type RuleTexts, type RunResult } from "./engine.ts";
export { scoreOf, penaltyOf, pagesOf, type Score, type ScoreContext } from "./score.ts";
export { fetchUrl, pool, toPublic, toTarget, isSameSite, DEFAULT_UA, type Origins, type FetchOptions } from "./fetch.ts";
export { parsePage, textContent, visibleText, countWords, decode, types as jsonLdTypes } from "./html.ts";
export { parseRobots } from "./robots.ts";
export { parseSitemap, markdownLinks } from "./sitemap.ts";
export { isArticle, articleNode, finder, quote } from "./rules/util.ts";

export const defaultConfig: Config = { trainingBots: "any", disable: [], maxPages: 20, lang: DEFAULT_LANG };

/** A score for one part of a combined report: «Classic search 82/100 (B)». */
export interface ReportSection extends Pick<Score, "score" | "grade" | "checked" | "total"> {
  name: string;
}

export interface Report extends Score {
  site: string;
  /** Language of every text in the report: rule titles, fixes, messages. */
  lang: Lang;
  checkedAt: string;
  pages: string[];
  findings: Finding[];
  rules: ReportRule[];
  /** Group letters and names in checklist order; the AI search groups A–G when absent. */
  groups?: Record<string, string>;
  /** Scores of the parts of a combined report, shown under the summary. */
  sections?: ReportSection[];
  /** Report texts to replace: the title, the «nothing to fix» line, the footer. */
  chrome?: Partial<Pick<Messages["report"], "title" | "clean" | "footer">>;
  /** The tool linked at the end of the report. */
  tool?: { name: string; url: string };
}

export async function audit(target: string, opts: { base?: string; config?: Partial<Config>; urls?: string[]; log?: CrawlOptions["log"] } = {}): Promise<Report> {
  const config = { ...defaultConfig, ...opts.config };
  const t = messages(config.lang);
  const site = await crawl(target, opts.base, { maxPages: config.maxPages, urls: opts.urls, log: opts.log });
  const run = runRules(site, rules, config, t.m, t.rules);
  return {
    site: site.base,
    lang: config.lang,
    checkedAt: new Date().toISOString(),
    pages: site.pages.map((p) => p.fetched.publicUrl),
    ...scoreOf(run.findings, { pages: site.pages.length, checked: run.checked, total: run.total }),
    findings: run.findings,
    rules: run.rules,
  };
}
