/** ENT-7: Blog, tag and category pages are marked up as collections of articles. */
import type { Rule } from "../../types.ts";
import { finder, isA } from "../util.ts";
import { isListing } from "./shared.ts";

const COLLECTIONS = ["CollectionPage", "Blog", "ItemList", "SearchResultsPage"];

export const ent7: Rule = {
  id: "ENT-7",
  group: "ENT",
  level: "info",
  applies: (site, t) => (site.pages.some(isListing) ? null : t.skipNoListings),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) if (isListing(page) && !page.jsonLd.some((n) => isA(n, COLLECTIONS))) add(page.fetched.publicUrl, t.noCollection);
    return out;
  },
};
