/** ENT-2: Articles point at the author entity by @id. */
import type { JsonLdNode, Rule } from "../../types.ts";
import { articleNode, finder, isArticle, str } from "../util.ts";
import { authors, definitions, idOf } from "./shared.ts";

export const ent2: Rule = {
  id: "ENT-2",
  group: "ENT",
  level: "warn",
  applies(site, t) {
    return site.pages.some(isArticle) ? null : t.skipNoArticles;
  },
  run(site, _config, t) {
    const { out, add } = finder(this);
    const ids = new Set(definitions(site).map(({ n }) => str(n["@id"])).filter(Boolean));
    for (const page of site.pages) {
      const art = articleNode(page);
      if (!art) continue;
      for (const a of authors(art)) {
        const id = idOf(a);
        if (!id) add(page.fetched.publicUrl, t.authorNoId(a && typeof a === "object" ? `«${str((a as JsonLdNode).name)}»` : JSON.stringify(a)));
        else if (ids.size && !ids.has(id)) add(page.fetched.publicUrl, t.authorUnknownId(id));
      }
    }
    return out;
  },
};
