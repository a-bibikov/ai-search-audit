import { SEARCH_AGENTS, TRAINING_AGENTS } from "../agents.ts";
import type { Rule } from "../types.ts";
import { finder } from "./util.ts";

const pathOf = (url: string) => {
  const u = new URL(url);
  return u.pathname + u.search;
};

export const accessRules: Rule[] = [
  {
    id: "A-1",
    group: "A",
    level: "error",
    title: "robots.txt lets AI search agents in",
    fix: "Remove the Disallow for these agents (or add `Allow: /` in their group). They fetch pages to answer questions and cite them; training crawlers are a separate choice (A-2).",
    run(site) {
      const { out, add } = finder(this);
      if (!site.robots) return out;
      const paths = ["/", ...site.pages.map((p) => pathOf(p.fetched.publicUrl))];
      for (const agent of SEARCH_AGENTS) {
        const blocked = paths.filter((p) => !site.robots!.parsed.allows(agent, p));
        if (blocked.length) add("site", `${agent} is blocked on ${blocked.length === paths.length ? "the whole site" : `${blocked.length} of ${paths.length} pages, e.g. ${blocked[0]}`}`);
      }
      return out;
    },
  },
  {
    id: "A-2",
    group: "A",
    level: "info",
    title: "Training crawlers follow your policy",
    fix: "Decide whether future models may learn from the site and state it in robots.txt with a group per crawler. Blocking them does not remove you from AI search (A-1).",
    run(site, config) {
      const { out, add } = finder(this);
      if (!site.robots) return out;
      const allowed = TRAINING_AGENTS.filter((a) => site.robots!.parsed.allows(a, "/"));
      const blocked = TRAINING_AGENTS.filter((a) => !allowed.includes(a));
      if (config.trainingBots === "block" && allowed.length) add("site", `Policy is block, but allowed: ${allowed.join(", ")}`, "warn");
      else if (config.trainingBots === "allow" && blocked.length) add("site", `Policy is allow, but blocked: ${blocked.join(", ")}`, "warn");
      else if (config.trainingBots === "any") add("site", `Training crawlers — allowed: ${allowed.join(", ") || "none"}; blocked: ${blocked.join(", ") || "none"}`);
      return out;
    },
  },
  {
    id: "A-3",
    group: "A",
    level: "error",
    title: "The server answers AI agents like a browser",
    fix: "Check the CDN, WAF or bot protection: these agents get an error, a challenge or a different page. Allow them by user agent or verified IP ranges.",
    run(site) {
      const { out, add } = finder(this);
      const normal = site.pages[0]?.fetched.body.length ?? 0;
      for (const { agent, fetched } of site.asAgents) {
        if (fetched.status !== 200) add(fetched.publicUrl, `${agent} gets ${fetched.error ?? `HTTP ${fetched.status}`}`);
        else if (normal && fetched.body.length < normal * 0.5) add(fetched.publicUrl, `${agent} gets a page half the usual size (${fetched.body.length} vs ${normal} bytes): a challenge or a stub?`);
      }
      return out;
    },
  },
  {
    id: "A-4",
    group: "A",
    level: "error",
    title: "No noindex or noai on public pages",
    fix: "Remove `noindex`, `none`, `noai` from `<meta name=\"robots\">` and the `X-Robots-Tag` header on pages that should be cited (keep them on previews and staging).",
    run(site) {
      const { out, add } = finder(this);
      const bad = /\b(noindex|none|noai)\b/i;
      for (const page of site.pages) {
        const header = page.fetched.headers.get("x-robots-tag") ?? "";
        if (bad.test(page.metaRobots)) add(page.fetched.publicUrl, `<meta name="robots" content="${page.metaRobots}">`);
        if (bad.test(header)) add(page.fetched.publicUrl, `X-Robots-Tag: ${header}`);
      }
      const llmsHeader = site.llms?.headers.get("x-robots-tag") ?? "";
      if (site.llms && bad.test(llmsHeader)) add(site.llms.publicUrl, `X-Robots-Tag: ${llmsHeader}`);
      return out;
    },
  },
  {
    id: "A-5",
    group: "A",
    level: "info",
    title: "The feed is declared in <head>",
    fix: 'Add `<link rel="alternate" type="application/rss+xml" href="…">` to pages so crawlers find new content without guessing the address.',
    run(site) {
      const { out, add } = finder(this);
      if (site.undeclaredFeed) add("site", `A feed exists at ${site.undeclaredFeed}, but no page links to it in <head>`);
      return out;
    },
  },
];
