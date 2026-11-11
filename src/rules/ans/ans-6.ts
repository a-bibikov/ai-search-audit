/** ANS-6: Each section makes sense on its own: it does not open with «this» or «as mentioned above». */
import type { Rule } from "../../types.ts";
import { finder, isArticle, quote } from "../util.ts";
import { sections } from "./shared.ts";

/**
 * Openings that point back at the previous section: quoted alone, they point at nothing. The end of the word is «not a
 * letter or digit»: `\b` sees only Latin letters, so Russian openings would never match.
 */
const BACK = /^(this|that|these|those|it|they|as (mentioned|discussed|we saw|noted|said) (above|earlier|before)|as you can see|это|этот|эта|эти|он|она|они|оно|так(им образом)?|как (уже )?(говорилось|сказано|упоминалось|мы (видели|говорили)))(?![\p{L}\p{N}])/iu;

export const ans6: Rule = {
  id: "ANS-6",
  group: "ANS",
  level: "info",
  applies: (site, t) => (site.pages.some(isArticle) ? null : t.skipNoArticles),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      if (!isArticle(page)) continue;
      const back = sections(page.fetched.body).filter((s) => BACK.test(s.first.trim()));
      if (back.length) add(page.fetched.publicUrl, t.sectionsLeanBack(back.length, quote(back[0]!.heading, 40), quote(back[0]!.first, 50)));
    }
    return out;
  },
};
