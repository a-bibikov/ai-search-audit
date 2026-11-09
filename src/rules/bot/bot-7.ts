/** BOT-7: robots.txt answers AI agents without errors: on a server error many crawlers treat the whole site as closed. */
import { SEARCH_AGENTS } from "../../agents.ts";
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

export const bot7: Rule = {
  id: "BOT-7",
  group: "BOT",
  level: "error",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const r = site.robotsAsAgent;
    const agent = SEARCH_AGENTS[0];
    const status = r.error ?? String(r.status);
    if (r.status === 0 || r.status === 429 || r.status >= 500) add(r.publicUrl, t.robotsAgentFails(agent, status));
    else if (r.status === 200 && /^\s*<(!doctype|html)/i.test(r.body)) add(r.publicUrl, t.robotsAgentHtml(agent), "warn");
    else if (site.robots && r.status !== 200) add(r.publicUrl, t.robotsAgentDiffers(agent, status), "warn");
    return out;
  },
};
