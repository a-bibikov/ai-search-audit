/** BOT-8: Blocking Google-Extended does not drop the site from Gemini answers by accident: it controls more than training. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

export const bot8: Rule = {
  id: "BOT-8",
  group: "BOT",
  level: "info",
  applies: (site, t) => (site.robots ? null : t.skipNoRobots),
  run(site, _config, t) {
    const { out, add } = finder(this);
    if (!site.robots!.parsed.allows("Google-Extended", "/")) add("site", t.geminiBlocked);
    return out;
  },
};
