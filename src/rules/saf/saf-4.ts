/** SAF-4: AI agents get the same page as people: the words they read are the words a browser shows. */
import { visibleText } from "auditor-engine";
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

/** Below this share of shared words the agent reads another page. Dates, counters and rotating blocks stay above it. */
const MIN_SIMILARITY = 0.6;

const wordSet = (text: string) => new Set(text.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);

export const saf4: Rule = {
  id: "SAF-4",
  group: "SAF",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const home = site.pages[0];
    if (!home) return out;
    const normal = wordSet(home.text);
    if (normal.size < 20) return out;
    for (const { agent, fetched } of site.asAgents) {
      // Errors and stripped pages are BOT-3's: here only a full page with other words.
      if (fetched.status !== 200 || fetched.body.length < home.fetched.body.length * 0.5) continue;
      const seen = wordSet(visibleText(fetched.body));
      const shared = [...seen].filter((w) => normal.has(w)).length;
      const similarity = shared / Math.max(seen.size, normal.size);
      if (similarity < MIN_SIMILARITY) add(fetched.publicUrl, t.cloaked(agent, Math.round(similarity * 100)));
    }
    return out;
  },
};
