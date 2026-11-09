/** BOT-1: robots.txt lets AI search bots in: the crawlers that build the index AI answers draw on. */
import { SEARCH_AGENTS } from "../../agents.ts";
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";
import { blockedPaths } from "./shared.ts";

export const bot1: Rule = {
  id: "BOT-1",
  group: "BOT",
  level: "error",
  run(site, _config, t) {
    const { out, add } = finder(this);
    if (!site.robots) return out;
    for (const agent of SEARCH_AGENTS) {
      const { paths, blocked } = blockedPaths(site, site.robots.parsed, agent);
      if (blocked.length) add("site", blocked.length === paths.length ? t.blockedSite(agent) : t.blockedPages(agent, blocked.length, paths.length, blocked[0]!));
    }
    return out;
  },
};
