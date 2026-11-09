/** ANS-4: A long article is easy to quote in parts: it has subheadings, and lists or tables. */
import type { Rule } from "../../types.ts";
import { finder, isArticle } from "../util.ts";

/** Shorter articles read fine as one block. */
const LONG = 600;
const MIN_H2 = 2;

export const ans4: Rule = {
  id: "ANS-4",
  group: "ANS",
  level: "info",
  applies: (site, t) => (site.pages.some(isArticle) ? null : t.skipNoArticles),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      if (!isArticle(page) || page.words < LONG) continue;
      const h2 = page.headingsAll.filter((h) => h.level === 2).length;
      const lists = /<(ul|ol|table|dl)\b/i.test(page.fetched.body.replace(/<(nav|header|footer)\b[\s\S]*?<\/\1>/gi, ""));
      if (h2 < MIN_H2) add(page.fetched.publicUrl, t.fewSubheadings(page.words, h2, MIN_H2));
      else if (!lists) add(page.fetched.publicUrl, t.noLists(page.words));
    }
    return out;
  },
};
