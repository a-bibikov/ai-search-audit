/** ANS-7: A long article ends with a short conclusion, or opens with one: the takeaway a model can quote whole. */
import type { Rule } from "../../types.ts";
import { finder, isArticle } from "../util.ts";

const LONG = 800;
/** The end of a word in any script: `\b` sees only Latin letters, so «Главное» would never match. */
const SUMMARY = /^(conclusion|summary|takeaways?|key takeaways|in short|tl;?dr|bottom line|wrapping up|вывод|выводы|итог|итоги|коротко|главное|резюме|подведём итоги|что в итоге)(?![\p{L}\p{N}])/iu;

export const ans7: Rule = {
  id: "ANS-7",
  group: "ANS",
  level: "info",
  applies: (site, t) => (site.pages.some(isArticle) ? null : t.skipNoArticles),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      if (!isArticle(page) || page.words < LONG) continue;
      const summarized = page.headingsAll.some((h) => h.level >= 2 && SUMMARY.test(h.text.trim())) || page.paragraphs.slice(0, 3).some((p) => /^(tl;?dr|коротко|in short)(?![\p{L}\p{N}])/iu.test(p.trim()));
      if (!summarized) add(page.fetched.publicUrl, t.noConclusion(page.words));
    }
    return out;
  },
};
