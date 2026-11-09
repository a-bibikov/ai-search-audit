import type { Config as EngineConfig, Fetched, Rule as EngineRule, Site as CrawledSite } from "auditor-engine";
import type { Messages } from "./i18n/index.ts";

export type { Fetched, Finding, JsonLdNode, Level, Page, Robots, Sitemap } from "auditor-engine";

/** A: access, B: text without JS, C: entities, D: answer first, E: machine-readable versions, F: freshness, G: content safety. */
export type Group = "A" | "B" | "C" | "D" | "E" | "F" | "G";

/** What the AI search checks request on top of the crawl. */
export interface AiExtras {
  /** /llms.txt when it answered 200, else null; llmsAttempt keeps the raw answer for the message (404, 403…). */
  llms: Fetched | null;
  llmsAttempt: Fetched;
  llmsFull: Fetched | null;
  feeds: Fetched[];
  /** Same page fetched with each AI user agent (rule A-3). */
  asAgents: { agent: string; fetched: Fetched }[];
  /** Status of every same-site link listed in llms.txt (rule E-2). */
  llmsLinks: { href: string; status: number }[];
  /** A feed found at a common address while no page declares one in <head> (rule A-5). */
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
