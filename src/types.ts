import type { Config as EngineConfig, Fetched, Rule as EngineRule, Site as CrawledSite } from "auditor-engine";
import type { Messages } from "./i18n/index.ts";

export type { Fetched, Finding, JsonLdNode, Level, Page, Robots, Sitemap } from "auditor-engine";

/** BOT: access for AI agents, TXT: text without JS, ENT: entities, ANS: answer first, LLM: llms.txt, UPD: freshness, SAF: content safety. */
export type Group = "BOT" | "TXT" | "ENT" | "ANS" | "LLM" | "UPD" | "SAF";

/** What the AI search checks request on top of the crawl. */
export interface AiExtras {
  /** /llms.txt when it answered 200, else null; llmsAttempt keeps the raw answer for the message (404, 403…). */
  llms: Fetched | null;
  llmsAttempt: Fetched;
  llmsFull: Fetched | null;
  feeds: Fetched[];
  /** Home page fetched as each AI search and user agent (rule BOT-3). */
  asAgents: { agent: string; fetched: Fetched }[];
  /** Status of every same-site link listed in llms.txt (rule LLM-2). */
  llmsLinks: { href: string; status: number }[];
  /** robots.txt as an AI search agent gets it: a CDN can answer bots differently (rule BOT-7). */
  robotsAsAgent: Fetched;
  /** An address that cannot exist, to see whether missing pages answer 404 (rule BOT-11). */
  missingPage: Fetched;
  /** Same-site PDFs linked from the audited pages: whether each has a text layer (rule TXT-7); null when unknown. */
  pdfs: { url: string; status: number; text: boolean | null }[];
  /** Markdown versions of a few audited pages: declared with rel="alternate" or found at the address plus «.md» (rule LLM-5). */
  markdown: { page: string; url: string; status: number; declared: boolean; ok: boolean }[];
  /** A feed found at a common address while no page declares one in <head> (rule BOT-5). */
  undeclaredFeed: string | null;
}

/** The crawled site with what the AI search checks collected. */
export type Site = CrawledSite & AiExtras;

export interface Config extends EngineConfig {
  /** What to do with training crawlers (GPTBot, CCBot…): allow, block or any. */
  trainingBots: "allow" | "block" | "any";
}

/** An AI search check. */
export type Rule = EngineRule<Messages["m"], Config, Site>;
