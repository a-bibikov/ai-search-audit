/** Helpers shared by the A checks. */
import type { Robots, Site } from "../../types.ts";

export const pathOf = (url: string) => {
  const u = new URL(url);
  return u.pathname + u.search;
};

/** Audited paths an agent may not read: the home page and every audited page. */
export const blockedPaths = (site: Site, robots: Robots, agent: string) => {
  const paths = [...new Set(["/", ...site.pages.map((p) => pathOf(p.fetched.publicUrl))])];
  return { paths, blocked: paths.filter((p) => !robots.allows(agent, p)) };
};

/** Content-Signal lines of robots.txt (contentsignals.org): «search=yes, ai-input=no, ai-train=no». */
export const contentSignals = (robotsTxt: string) =>
  [...robotsTxt.matchAll(/^\s*content-signal\s*:\s*(.+?)\s*$/gim)].map((m) => ({
    line: m[1]!,
    values: Object.fromEntries(
      m[1]!
        .split(",")
        .map((pair) => pair.split("=").map((s) => s.trim().toLowerCase()))
        .filter((kv): kv is [string, string] => kv.length === 2 && Boolean(kv[0])),
    ),
  }));

/** Robots directives of a page, with where they come from: the meta tag and the X-Robots-Tag header. */
export const robotsDirectives = (page: Site["pages"][number]) =>
  [
    { source: `<meta name="robots" content="${page.metaRobots}">`, value: page.metaRobots },
    { source: `X-Robots-Tag: ${page.fetched.headers.get("x-robots-tag") ?? ""}`, value: page.fetched.headers.get("x-robots-tag") ?? "" },
  ].filter((d) => d.value);
