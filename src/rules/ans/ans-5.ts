/** ANS-5: Facts are citable: an article full of numbers links to where they come from. */
import type { Rule } from "../../types.ts";
import { finder, isArticle } from "../util.ts";

/** Percentages, amounts and multipliers: 42%, $3.5 million, 10x, 1,5 млн. */
const FIGURE = /\d+(?:[.,]\d+)?\s?(?:%|percent|процент\p{L}*|x\b|×|million|billion|млн|млрд|тыс)/giu;
const MIN_FIGURES = 3;

export const ans5: Rule = {
  id: "ANS-5",
  group: "ANS",
  level: "info",
  applies: (site, t) => (site.pages.some(isArticle) ? null : t.skipNoArticles),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const own = (u: string) => u.startsWith(`${site.base}/`) || u.startsWith(`${site.target}/`);
    for (const page of site.pages) {
      if (!isArticle(page)) continue;
      const figures = page.text.match(FIGURE)?.length ?? 0;
      const sources = page.links.filter((u) => !own(u)).length;
      if (figures >= MIN_FIGURES && !sources) add(page.fetched.publicUrl, t.figuresNoSources(figures));
    }
    return out;
  },
};
