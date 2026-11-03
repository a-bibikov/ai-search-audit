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
    run(site, _config, t) {
      const { out, add } = finder(this);
      if (!site.robots) return out;
      const paths = ["/", ...site.pages.map((p) => pathOf(p.fetched.publicUrl))];
      for (const agent of SEARCH_AGENTS) {
        const blocked = paths.filter((p) => !site.robots!.parsed.allows(agent, p));
        if (blocked.length) add("site", blocked.length === paths.length ? t.blockedSite(agent) : t.blockedPages(agent, blocked.length, paths.length, blocked[0]!));
      }
      return out;
    },
  },
  {
    id: "A-2",
    group: "A",
    level: "info",
    run(site, config, t) {
      const { out, add } = finder(this);
      if (!site.robots) return out;
      const allowed = TRAINING_AGENTS.filter((a) => site.robots!.parsed.allows(a, "/"));
      const blocked = TRAINING_AGENTS.filter((a) => !allowed.includes(a));
      if (config.trainingBots === "block" && allowed.length) add("site", t.trainingBlockButAllowed(allowed.join(", ")), "warn");
      else if (config.trainingBots === "allow" && blocked.length) add("site", t.trainingAllowButBlocked(blocked.join(", ")), "warn");
      else if (config.trainingBots === "any") add("site", t.trainingStatus(allowed.join(", ") || t.none, blocked.join(", ") || t.none));
      return out;
    },
  },
  {
    id: "A-3",
    group: "A",
    level: "error",
    run(site, _config, t) {
      const { out, add } = finder(this);
      const normal = site.pages[0]?.fetched.body.length ?? 0;
      for (const { agent, fetched } of site.asAgents) {
        if (fetched.status !== 200) add(fetched.publicUrl, t.agentGets(agent, fetched.error ?? `HTTP ${fetched.status}`));
        else if (normal && fetched.body.length < normal * 0.5) add(fetched.publicUrl, t.agentSmallPage(agent, fetched.body.length, normal));
      }
      return out;
    },
  },
  {
    id: "A-4",
    group: "A",
    level: "error",
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
    run(site, _config, t) {
      const { out, add } = finder(this);
      if (site.undeclaredFeed) add("site", t.undeclaredFeed(site.undeclaredFeed));
      return out;
    },
  },
];
