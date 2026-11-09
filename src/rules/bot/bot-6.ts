/** BOT-6: robots.txt lets in the agents that open a page when a person asks an assistant about it. */
import { USER_AGENTS } from "../../agents.ts";
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";
import { blockedPaths } from "./shared.ts";

export const bot6: Rule = {
  id: "BOT-6",
  group: "BOT",
  level: "warn",
  applies: (site, t) => (site.robots ? null : t.skipNoRobots),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const agent of USER_AGENTS) {
      const { paths, blocked } = blockedPaths(site, site.robots!.parsed, agent);
      if (blocked.length) add("site", blocked.length === paths.length ? t.blockedSite(agent) : t.blockedPages(agent, blocked.length, paths.length, blocked[0]!));
    }
    return out;
  },
};
