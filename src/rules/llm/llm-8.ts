/** LLM-8: Links in llms.txt say what is behind them: «- [Title](url): what the page is for». */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";
import { llmsSkip } from "./shared.ts";

export const llm8: Rule = {
  id: "LLM-8",
  group: "LLM",
  level: "info",
  applies: (site, t) => llmsSkip(site, t),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const items = site.llms!.body.split("\n").filter((l) => /^\s*[-*]\s*\[[^\]]+\]\([^)]+\)/.test(l));
    const bare = items.filter((l) => !/\]\([^)]+\)\s*[:—–-]\s*\S/.test(l));
    // Half the links with a note is a file a model can choose from; fewer is a bare list of titles.
    if (items.length && bare.length > items.length / 2) add(site.llms!.publicUrl, t.llmsNoNotes(bare.length, items.length));
    return out;
  },
};
