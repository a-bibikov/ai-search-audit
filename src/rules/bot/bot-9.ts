/** BOT-9: Content Signals in robots.txt do not forbid search or AI answers, and agree with the robots.txt rules. */
import { TRAINING_AGENTS } from "../../agents.ts";
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";
import { contentSignals } from "./shared.ts";

export const bot9: Rule = {
  id: "BOT-9",
  group: "BOT",
  level: "warn",
  applies: (site, t) => (site.robots && contentSignals(site.robots.fetched.body).length ? null : t.skipNoContentSignal),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const where = site.robots!.fetched.publicUrl;
    const signals = contentSignals(site.robots!.fetched.body);
    for (const { line, values } of signals) if (values.search === "no" || values["ai-input"] === "no") add(where, t.contentSignalNo(line));
    if (signals.some((s) => s.values["ai-train"] === "no")) {
      const allowed = TRAINING_AGENTS.filter((a) => site.robots!.parsed.allows(a, "/"));
      if (allowed.length) add(where, t.contentSignalTrain(allowed.join(", ")), "info");
    }
    return out;
  },
};
