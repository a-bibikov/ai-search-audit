/** ENT-3: Articles have complete Article / BlogPosting markup. */
import { jsonLdTypes as types } from "auditor-engine";
import type { Rule } from "../../types.ts";
import { articleNode, finder, isArticle } from "../util.ts";

export const ent3: Rule = {
  id: "ENT-3",
  group: "ENT",
  level: "error",
  applies(site, t) {
    return site.pages.some(isArticle) ? null : t.skipNoArticles;
  },
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      const art = articleNode(page);
      if (!art) continue;
      const missing = ["headline", "datePublished", "author"].filter((k) => !art[k]);
      const soft = ["dateModified", "image", "inLanguage"].filter((k) => !art[k]);
      if (missing.length) add(page.fetched.publicUrl, t.articleMissing(types(art)[0]!, missing.join(", ")));
      if (soft.length) add(page.fetched.publicUrl, t.articleMissing(types(art)[0]!, soft.join(", ")), "warn");
    }
    return out;
  },
};
