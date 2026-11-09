/** LLM-3: Each language has its own llms.txt. */
import type { Rule } from "../../types.ts";
import { finder, markdownLinks } from "../util.ts";
import { llmsSkip } from "./shared.ts";

export const llm3: Rule = {
  id: "LLM-3",
  group: "LLM",
  level: "info",
  applies(site, t) {
    const skip = llmsSkip(site, t);
    if (skip) return skip;
    const langs = new Set(site.pages.flatMap((p) => p.hreflang.map((h) => h.lang)).filter((l) => l !== "x-default"));
    return langs.size > 1 ? null : t.skipOneLanguage;
  },
  run(site, _config, t) {
    const { out, add } = finder(this);
    const langs = new Set(site.pages.flatMap((p) => p.hreflang.map((h) => h.lang)).filter((l) => l !== "x-default"));
    if (site.llms && langs.size > 1 && !markdownLinks(site.llms.body).some((h) => /llms(-full)?\.txt$/.test(h))) add(site.llms.publicUrl, t.noOtherLlms(langs.size, [...langs].join(", ")));
    return out;
  },
};
