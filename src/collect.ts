import { fetchUrl, isSameSite, pool, toPublic, type Origins, type Page, type Site as CrawledSite } from "auditor-engine";
import { SEARCH_AGENTS, userAgentFor } from "./agents.ts";
import { markdownLinks } from "./rules/util.ts";
import type { AiExtras, Site } from "./types.ts";

export interface CollectOptions {
  concurrency?: number;
  log?: (line: string) => void;
}

const FEED_ACCEPT = "application/rss+xml,application/atom+xml,application/xml";

/** Requests what the AI search checks need on top of the crawl: llms.txt, feeds, the home page as each AI agent. */
export async function collect(site: CrawledSite, opts: CollectOptions = {}): Promise<Site> {
  const o: Origins = { target: site.target, base: site.base };
  const log = opts.log ?? (() => {});
  const conc = opts.concurrency ?? 4;
  const home = `${site.base}/`;

  log(`llms.txt, llms-full.txt`);
  const [llms, llmsFull] = await Promise.all([
    fetchUrl(`${site.target}/llms.txt`, o, { accept: "text/plain,text/markdown" }),
    fetchUrl(`${site.target}/llms-full.txt`, o, { accept: "text/plain,text/markdown" }),
  ]);

  const feedUrls = [...new Set(site.pages.flatMap((p) => p.rss).map((u) => new URL(u, firstUrl(site.pages, site.base)).href))].slice(0, 3);
  const feeds = await pool(feedUrls, conc, (u) => fetchUrl(u, o, { accept: FEED_ACCEPT }));

  log(`home page as ${SEARCH_AGENTS.length} AI agents`);
  const asAgents = await pool([...SEARCH_AGENTS], conc, async (agent) => ({ agent, fetched: await fetchUrl(home, o, { userAgent: userAgentFor(agent) }) }));

  const llmsLinks: AiExtras["llmsLinks"] = [];
  if (llms.status === 200) {
    const links = [...new Set(markdownLinks(llms.body).map((h) => h.replace(/#.*$/, "")).filter((h) => h && isSameSite(h, o)))];
    const results = await pool(links, conc, (href) => fetchUrl(href, o));
    links.forEach((href, i) => llmsLinks.push({ href: toPublic(href, o), status: results[i]!.status }));
  }

  let undeclaredFeed: string | null = null;
  if (!feedUrls.length) {
    const probes = await pool(["/rss.xml", "/feed.xml", "/feed", "/atom.xml", "/index.xml"], conc, (p) => fetchUrl(`${site.target}${p}`, o, { accept: FEED_ACCEPT }));
    undeclaredFeed = probes.find((f) => f.status === 200 && /<(rss|feed)\b/i.test(f.body.slice(0, 2000)))?.publicUrl ?? null;
  }

  const extras: AiExtras = { llms: llms.status === 200 ? llms : null, llmsAttempt: llms, llmsFull: llmsFull.status === 200 ? llmsFull : null, feeds, asAgents, llmsLinks, undeclaredFeed };
  return Object.assign(site, extras);
}

const firstUrl = (pages: Page[], base: string) => pages[0]?.fetched.publicUrl ?? base;
