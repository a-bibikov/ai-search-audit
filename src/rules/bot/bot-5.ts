/** BOT-5: The feed is declared in <head>. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

export const bot5: Rule = {
  id: "BOT-5",
  group: "BOT",
  level: "info",
  applies(site, t) {
    return site.feeds.length || site.undeclaredFeed ? null : t.skipNoFeed;
  },
  run(site, _config, t) {
    const { out, add } = finder(this);
    if (site.undeclaredFeed) add("site", t.undeclaredFeed(site.undeclaredFeed));
    return out;
  },
};
