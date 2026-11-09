/** UPD-1: Sitemap lastmod matches the page's dateModified. */
import type { Rule } from "../../types.ts";
import { articleNode, finder, isArticle, str } from "../util.ts";
import { datePart } from "./shared.ts";

export const upd1: Rule = {
  id: "UPD-1",
  group: "UPD",
  level: "warn",
  applies(site, t) {
    if (!site.sitemap) return t.skipNoSitemap;
    return site.pages.some(isArticle) ? null : t.skipNoArticles;
  },
  run(site, _config, t) {
    const { out, add } = finder(this);
    if (!site.sitemap) return out;
    const lastmod = new Map(site.sitemap.urls.map((u) => [u.loc.replace(/\/$/, ""), u.lastmod]));
    for (const page of site.pages) {
      const modified = str(articleNode(page)?.dateModified);
      const lm = lastmod.get(page.fetched.publicUrl.replace(/\/$/, ""));
      if (modified && lm && datePart(lm) !== datePart(modified)) add(page.fetched.publicUrl, t.lastmodMismatch(datePart(lm), datePart(modified)));
      if (modified && lastmod.has(page.fetched.publicUrl.replace(/\/$/, "")) && !lm) add(page.fetched.publicUrl, t.noLastmod, "info");
    }
    return out;
  },
};
