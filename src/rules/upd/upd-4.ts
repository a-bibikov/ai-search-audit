/** UPD-4: Dates in the markup are plausible: an update is not older than the publication, and nothing is in the future. */
import type { Rule } from "../../types.ts";
import { articleNode, finder, isArticle, str } from "../util.ts";
import { dateOf } from "./shared.ts";

export const upd4: Rule = {
  id: "UPD-4",
  group: "UPD",
  level: "warn",
  applies: (site, t) => (site.pages.some(isArticle) ? null : t.skipNoArticles),
  run(site, _config, t) {
    const { out, add } = finder(this);
    // A day of slack for time zones: «tomorrow» in Tokyo is today in New York.
    const future = Date.now() + 86_400_000;
    for (const page of site.pages) {
      const art = articleNode(page);
      if (!art) continue;
      const published = str(art.datePublished);
      const modified = str(art.dateModified);
      const p = dateOf(published);
      const m = dateOf(modified);
      if (published && !p) add(page.fetched.publicUrl, t.badDate("datePublished", published));
      if (modified && !m) add(page.fetched.publicUrl, t.badDate("dateModified", modified));
      if (p && m && m.getTime() < p.getTime() - 86_400_000) add(page.fetched.publicUrl, t.modifiedBeforePublished(modified.slice(0, 10), published.slice(0, 10)));
      for (const [field, d, raw] of [["datePublished", p, published], ["dateModified", m, modified]] as const)
        if (d && d.getTime() > future) add(page.fetched.publicUrl, t.futureDate(field, raw.slice(0, 10)));
    }
    return out;
  },
};
