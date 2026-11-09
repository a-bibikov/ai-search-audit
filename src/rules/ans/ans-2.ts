/** ANS-2: The first paragraphs name what the article is about: the words of its H1 are there. */
import type { Rule } from "../../types.ts";
import { finder, isArticle, quote } from "../util.ts";
import { leadParagraphs } from "./shared.ts";

/** Words of a heading that carry no topic. Words shorter than four letters are dropped anyway. */
const STOP = new Set(
  "with that this from your what when which about into than have will does their there these those more most best guide über pour avec dans это этот эта эти который которая когда чтобы зачем почему нужен нужно нужна можно какой какая какие просто всего".split(" "),
);

/** A word's stem for matching across forms: «агентов» and «агенты», «writing» and «writes». */
const stem = (w: string) => w.slice(0, Math.max(4, Math.ceil(w.length * 0.7)));

export const ans2: Rule = {
  id: "ANS-2",
  group: "ANS",
  level: "warn",
  applies: (site, t) => (site.pages.some(isArticle) ? null : t.skipNoArticles),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      if (!isArticle(page)) continue;
      const heading = page.h1[0] || page.title;
      const words = [...new Set((heading.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((w) => w.length >= 4 && !STOP.has(w)))];
      if (words.length < 2) continue;
      const lead = leadParagraphs(page).join(" ").toLowerCase();
      const missing = words.filter((w) => !lead.includes(stem(w)));
      if (missing.length > words.length / 2) add(page.fetched.publicUrl, t.queryMissing(quote(heading, 60), missing.join(", ")));
    }
    return out;
  },
};
