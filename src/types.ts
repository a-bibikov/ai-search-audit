import type { Lang, Messages } from "./i18n/index.ts";

/** error: AI search cannot read the page or reads it wrong. warn: lowers the chance of a citation. info: a recommendation. */
export type Level = "error" | "warn" | "info";

/** A: access, B: text without JS, C: entities, D: answer first, E: machine-readable versions, F: freshness, G: content safety. */
export type Group = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface Finding {
  rule: string;
  level: Level;
  /** Public URL the finding is about (with --base, the production URL), or "site" for site-wide findings. */
  where: string;
  /** What we found, in one sentence. */
  message: string;
}

export interface Fetched {
  /** URL as requested (target origin). */
  url: string;
  /** Public URL (base origin): what reports and links show. */
  publicUrl: string;
  status: number;
  headers: Headers;
  body: string;
  /** Network error or timeout, if the request did not complete. */
  error?: string;
  /** Where the request ended after redirects, and whether there were any. */
  finalUrl?: string;
  redirected?: boolean;
}

export interface JsonLdNode {
  [key: string]: unknown;
}

export interface Page {
  fetched: Fetched;
  title: string;
  description: string;
  metaRobots: string;
  canonical: string;
  hreflang: { lang: string; href: string }[];
  /** H1 as a crawler reads it: text nodes joined without separators (textContent). */
  h1: string[];
  /** Inner HTML of each H1, for checks on markup boundaries. */
  h1Html: string[];
  /** Paragraph texts in document order. */
  paragraphs: string[];
  /** All visible text (no script, style, noscript, svg, template). */
  text: string;
  words: number;
  /** Every JSON-LD node, flattened out of @graph and nested objects. */
  jsonLd: JsonLdNode[];
  /** JSON-LD blocks that failed to parse. */
  jsonLdErrors: string[];
  rss: string[];
  /** og:* meta, keys without the prefix: title, description, image… */
  og: Record<string, string>;
  /** H2–H3 in order, for FAQ-like structure. */
  headings: { level: number; text: string }[];
  /** Number of <details> elements. */
  details: number;
  /** <html lang>, empty when missing. */
  htmlLang: string;
  /** <meta name="viewport"> content, empty when missing. */
  viewport: string;
  /** Every H1–H6 in document order. */
  headingsAll: { level: number; text: string }[];
  /** Absolute URLs of <a href> on the page (fragments dropped, mailto: and tel: left out). */
  links: string[];
  /** <img>: absolute src and alt (null when the attribute is missing, "" when empty). */
  images: { src: string; alt: string | null }[];
  /** Absolute URLs of resources the page loads: images, scripts, stylesheets, frames, media. */
  resources: string[];
}

export interface Sitemap {
  urls: { loc: string; lastmod?: string }[];
}

export interface Robots {
  /** Is `path` allowed for this user agent (most specific group, longest match wins)? */
  allows(userAgent: string, path: string): boolean;
  /** Does robots.txt name this user agent in its own group? */
  names(userAgent: string): boolean;
}

export interface Site {
  target: string;
  base: string;
  robots: { fetched: Fetched; parsed: Robots } | null;
  sitemap: Sitemap | null;
  pages: Page[];
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
  /** Sampled pages that did not answer 200 with HTML: errors, redirects to non-HTML, timeouts. */
  failed: Fetched[];
}

export interface Config {
  /** What to do with training crawlers (GPTBot, CCBot…): allow, block or any. */
  trainingBots: "allow" | "block" | "any";
  /** Rule ids to skip. */
  disable: string[];
  /** Pages to audit: a number sampled across templates (default 20), or "all" for every page in the sitemap. */
  maxPages: number | "all";
  /** Report language: en (default), ru. */
  lang: Lang;
}

/**
 * A check. Its title, fix and impact live in the rule set's texts per language; `run` writes messages through `t`.
 * `M` is the rule set's message dictionary and `C` its config: other packages bring their own (see runRules).
 */
export interface Rule<M = Messages["m"], C = Config> {
  id: string;
  group: string;
  level: Level;
  /**
   * Why the check cannot run on this site («no articles among the audited pages», «no llms.txt»), or null when it can.
   * A check that does not apply is shown as «not checked» instead of a green tick.
   */
  applies?(site: Site, t: M): string | null;
  run(site: Site, config: C, t: M): Finding[];
}
