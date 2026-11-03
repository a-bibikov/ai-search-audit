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
  llms: Fetched | null;
  llmsFull: Fetched | null;
  feeds: Fetched[];
  /** Same page fetched with each AI user agent (rule A-3). */
  asAgents: { agent: string; fetched: Fetched }[];
  /** Status of every same-site link listed in llms.txt (rule E-2). */
  llmsLinks: { href: string; status: number }[];
  /** A feed found at a common address while no page declares one in <head> (rule A-5). */
  undeclaredFeed: string | null;
}

export interface Config {
  /** What to do with training crawlers (GPTBot, CCBot…): allow, block or any. */
  trainingBots: "allow" | "block" | "any";
  /** Rule ids to skip. */
  disable: string[];
  maxPages: number;
}

export interface Rule {
  id: string;
  group: Group;
  level: Level;
  title: string;
  /** How to fix it, one or two sentences, shown in the report. */
  fix: string;
  run(site: Site, config: Config): Finding[];
}
