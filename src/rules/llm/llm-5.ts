/** LLM-5: Pages are available as Markdown: declared with rel="alternate" type="text/markdown" or at the address plus «.md». */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";
import { llmsSkip } from "./shared.ts";

export const llm5: Rule = {
  id: "LLM-5",
  group: "LLM",
  level: "info",
  applies: (site, t) => llmsSkip(site, t) ?? (site.markdown.length ? null : t.skipNoPages),
  run(site, _config, t) {
    const { out, add } = finder(this);
    // A declared version that does not work is a broken promise; no version at all is only a missed chance.
    for (const m of site.markdown) if (m.declared && !m.ok) add(m.page, m.status === 200 ? t.markdownIsHtml(m.url) : t.markdownBroken(m.url, String(m.status || t.nothing)), "warn");
    if (!site.markdown.some((m) => m.ok) && !site.markdown.some((m) => m.declared)) add("site", t.noMarkdown(site.markdown.length));
    return out;
  },
};
