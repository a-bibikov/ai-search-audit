/** LLM-4: llms-full.txt carries the full text. */
import { countWords } from "auditor-engine";
import type { Rule } from "../../types.ts";
import { finder, isArticle } from "../util.ts";
import { llmsSkip } from "./shared.ts";

export const llm4: Rule = {
  id: "LLM-4",
  group: "LLM",
  level: "info",
  applies: (site, t) => llmsSkip(site, t),
  run(site, _config, t) {
    const { out, add } = finder(this);
    if (!site.llmsFull) {
      if (site.llms) add("site", t.notFound("/llms-full.txt"));
      return out;
    }
    const full = site.llmsFull.body.replace(/\s+/g, " ");
    const missing = site.pages.filter(isArticle).filter((p) => {
      const sample = p.paragraphs.find((x) => countWords(x) >= 12 && !x.includes(p.description));
      return sample && !full.includes(sample.slice(0, 60).replace(/\s+/g, " "));
    });
    if (missing.length) add(site.llmsFull.publicUrl, t.noArticleText(missing.length, site.pages.filter(isArticle).length, missing[0]!.fetched.publicUrl));
    return out;
  },
};
