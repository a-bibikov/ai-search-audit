/** ENT-9: Product pages carry the price, the availability and, when there are any, ratings. */
import type { JsonLdNode, Rule } from "../../types.ts";
import { finder, str } from "../util.ts";
import { listOf, nodesOf } from "./shared.ts";

export const ent9: Rule = {
  id: "ENT-9",
  group: "ENT",
  level: "warn",
  applies: (site, t) => (nodesOf(site, ["Product"]).length ? null : t.skipNoProducts),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const { n, page } of nodesOf(site, ["Product"])) {
      const name = str(n.name);
      const offers = listOf(n.offers) as JsonLdNode[];
      if (!offers.length) {
        add(page.fetched.publicUrl, t.productMissing(name, "offers"));
        continue;
      }
      const offer = offers[0]!;
      const missing = [
        ...(offer.price || offer.lowPrice || offer.priceSpecification ? [] : ["price"]),
        ...(offer.priceCurrency || offer.priceSpecification ? [] : ["priceCurrency"]),
        ...(offer.availability ? [] : ["availability"]),
      ];
      if (missing.length) add(page.fetched.publicUrl, t.productMissing(name, missing.join(", ")));
      else if (!n.aggregateRating && !n.review) add(page.fetched.publicUrl, t.productNoRating(name), "info");
    }
    return out;
  },
};
