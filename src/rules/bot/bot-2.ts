/** BOT-2: Training crawlers follow your policy. */
import { TRAINING_AGENTS } from "../../agents.ts";
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

export const bot2: Rule = {
  id: "BOT-2",
  group: "BOT",
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
};
