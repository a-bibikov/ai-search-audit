import { inflateSync } from "node:zlib";
import { DEFAULT_UA, fetchUrl, isSameSite, pool, toPublic, toTarget, type Origins, type Page, type Site as CrawledSite } from "auditor-engine";
import { SEARCH_AGENTS, USER_AGENTS, userAgentFor } from "./agents.ts";
import { isArticle, markdownLinks } from "./rules/util.ts";
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

  log(`llms.txt, llms-full.txt, robots.txt as an AI agent, a missing page`);
  const [llms, llmsFull, robotsAsAgent, missingPage] = await Promise.all([
    fetchUrl(`${site.target}/llms.txt`, o, { accept: "text/plain,text/markdown" }),
    fetchUrl(`${site.target}/llms-full.txt`, o, { accept: "text/plain,text/markdown" }),
    fetchUrl(`${site.target}/robots.txt`, o, { accept: "text/plain", userAgent: userAgentFor(SEARCH_AGENTS[0]) }),
    fetchUrl(`${site.target}/__ai-search-auditor-${Date.now().toString(36)}`, o),
  ]);

  const feedUrls = [...new Set(site.pages.flatMap((p) => p.rss).map((u) => new URL(u, firstUrl(site.pages, site.base)).href))].slice(0, 3);
  const feeds = await pool(feedUrls, conc, (u) => fetchUrl(u, o, { accept: FEED_ACCEPT }));

  const agents = [...SEARCH_AGENTS, ...USER_AGENTS];
  log(`home page as ${agents.length} AI agents`);
  const asAgents = await pool(agents, conc, async (agent) => ({ agent, fetched: await fetchUrl(home, o, { userAgent: userAgentFor(agent) }) }));

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

  const pdfUrls = [...new Set(site.pages.flatMap((p) => p.links).filter((u) => isSameSite(u, o) && /\.pdf($|\?)/i.test(u)))].slice(0, MAX_PDFS);
  if (pdfUrls.length) log(`${pdfUrls.length} linked PDFs`);
  const pdfs = await pool(pdfUrls, conc, (u) => pdfText(u, o));

  const sample = [...site.pages.filter(isArticle), ...site.pages.filter((p) => !isArticle(p))].slice(0, MARKDOWN_SAMPLE);
  const markdown = await pool(sample, conc, (p) => markdownOf(p, o));

  const extras: AiExtras = { llms: llms.status === 200 ? llms : null, llmsAttempt: llms, llmsFull: llmsFull.status === 200 ? llmsFull : null, feeds, asAgents, llmsLinks, undeclaredFeed, robotsAsAgent, missingPage, pdfs, markdown };
  return Object.assign(site, extras);
}

const MAX_PDFS = 5;
const MARKDOWN_SAMPLE = 3;

/** The Markdown version of a page: the one it declares in <head>, else the address plus «.md» (llmstxt.org). */
async function markdownOf(page: Page, o: Origins): Promise<AiExtras["markdown"][number]> {
  const pageUrl = page.fetched.publicUrl;
  const link = page.fetched.body.match(/<link\b[^>]*\btype\s*=\s*["']text\/markdown["'][^>]*>/i)?.[0];
  const declared = link?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
  const path = new URL(pageUrl).pathname.replace(/\/$/, "");
  const url = declared ? new URL(declared, pageUrl).href : `${new URL(pageUrl).origin}${path || "/index"}.md`;
  const f = await fetchUrl(url, o, { accept: "text/markdown,text/plain" });
  const ok = f.status === 200 && !/^\s*<(!doctype|html)/i.test(f.body) && f.body.trim().length > 0;
  return { page: pageUrl, url: f.publicUrl, status: f.status, declared: Boolean(declared), ok };
}
const MAX_PDF_BYTES = 20_000_000;

/**
 * Whether a PDF has a text layer: a scan has no fonts. Fonts can sit inside compressed object streams (PDF 1.5+), so
 * those streams are inflated before giving up; a file too large to read or not a PDF gives null, not a finding.
 */
async function pdfText(url: string, o: Origins): Promise<AiExtras["pdfs"][number]> {
  try {
    const res = await fetch(toTarget(url, o), { headers: { "user-agent": DEFAULT_UA }, signal: AbortSignal.timeout(20_000) });
    const size = Number(res.headers.get("content-length") ?? 0);
    if (res.status !== 200 || size > MAX_PDF_BYTES) return { url, status: res.status, text: null };
    const bytes = Buffer.from(await res.arrayBuffer());
    const raw = bytes.toString("latin1");
    if (!raw.startsWith("%PDF")) return { url, status: res.status, text: null };
    if (/\/Font\b/.test(raw)) return { url, status: res.status, text: true };
    for (const m of raw.matchAll(/stream\r?\n/g)) {
      const start = m.index! + m[0].length;
      const end = raw.indexOf("endstream", start);
      if (end < 0) break;
      try {
        if (/\/Font\b/.test(inflateSync(bytes.subarray(start, end)).toString("latin1"))) return { url, status: res.status, text: true };
      } catch {
        // Not a Flate stream (an image, a font program): nothing to look for in it.
      }
    }
    return { url, status: res.status, text: false };
  } catch {
    return { url, status: 0, text: null };
  }
}

const firstUrl = (pages: Page[], base: string) => pages[0]?.fetched.publicUrl ?? base;
