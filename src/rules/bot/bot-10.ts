/** BOT-10: Quoting is not forbidden: nosnippet and max-snippet also keep a page out of AI Overviews and AI Mode. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";
import { robotsDirectives } from "./shared.ts";

/** Below this many characters an AI answer gets little more than a title. */
const SHORT_SNIPPET = 50;

export const bot10: Rule = {
  id: "BOT-10",
  group: "BOT",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages)
      for (const { source, value } of robotsDirectives(page)) {
        const max = value.match(/max-snippet\s*:\s*(-?\d+)/i);
        if (/\bnosnippet\b/i.test(value) || max?.[1] === "0") add(page.fetched.publicUrl, t.nosnippet(source));
        else if (max && Number(max[1]) > 0 && Number(max[1]) < SHORT_SNIPPET) add(page.fetched.publicUrl, t.maxSnippet(Number(max[1]), source), "info");
      }
    return out;
  },
};
