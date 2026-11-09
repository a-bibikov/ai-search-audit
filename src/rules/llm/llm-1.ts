/** LLM-1: llms.txt follows llmstxt.org (optional). */
import type { Rule } from "../../types.ts";
import { finder, markdownLinks } from "../util.ts";
import { llmsSkip } from "./shared.ts";

export const llm1: Rule = {
  id: "LLM-1",
  group: "LLM",
  level: "warn",
  applies: (site, t) => llmsSkip(site, t),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const body = site.llms!.body;
    const where = site.llms!.publicUrl;
    if (!/^#\s+\S/m.test(body.trimStart().split("\n")[0] ?? "")) add(where, t.noH1);
    if (!/^>\s+\S/m.test(body)) add(where, t.noSummary);
    if (!/^##\s+\S/m.test(body)) add(where, t.noSections);
    if (!markdownLinks(body).length) add(where, t.noLinks);
    return out;
  },
};
