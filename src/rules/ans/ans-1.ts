/** ANS-1: Articles answer in the first two paragraphs. */
import { countWords } from "auditor-engine";
import type { Rule } from "../../types.ts";
import { finder, isArticle, quote } from "../util.ts";
import { FILLER, leadParagraphs } from "./shared.ts";

export const ans1: Rule = {
  id: "ANS-1",
  group: "ANS",
  level: "warn",
  applies(site, t) {
    return site.pages.some(isArticle) ? null : t.skipNoArticles;
  },
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      if (!isArticle(page)) continue;
      const first = leadParagraphs(page);
      if (first.some((p) => FILLER.test(p.trim()))) add(page.fetched.publicUrl, t.introFirst(quote(first.find((p) => FILLER.test(p.trim()))!)));
      else if (!first.some((p) => countWords(p) >= 25)) add(page.fetched.publicUrl, t.noLongParagraph);
    }
    return out;
  },
};
