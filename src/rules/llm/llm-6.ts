/** LLM-6: robots.txt does not close llms.txt and llms-full.txt to the AI agents that read them. */
import { SEARCH_AGENTS, USER_AGENTS } from "../../agents.ts";
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";
import { llmsSkip } from "./shared.ts";

export const llm6: Rule = {
  id: "LLM-6",
  group: "LLM",
  level: "warn",
  applies: (site, t) => llmsSkip(site, t) ?? (site.robots ? null : t.skipNoRobots),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const file of [site.llms, site.llmsFull]) {
      if (!file) continue;
      const path = new URL(file.publicUrl).pathname;
      const blocked = [...SEARCH_AGENTS, ...USER_AGENTS].filter((a) => !site.robots!.parsed.allows(a, path));
      if (blocked.length) add(file.publicUrl, t.llmsBlocked(blocked.slice(0, 4).join(", "), blocked.length));
    }
    return out;
  },
};
