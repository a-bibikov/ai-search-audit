/** ENT-10: Structured data says the same as the visible text: FAQ questions and prices are on the page. */
import type { JsonLdNode, Rule } from "../../types.ts";
import { finder, quote, str } from "../util.ts";
import { listOf, nodesOf, squash } from "./shared.ts";

export const ent10: Rule = {
  id: "ENT-10",
  group: "ENT",
  level: "warn",
  applies: (site, t) => (nodesOf(site, ["FAQPage", "Product"]).length ? null : t.skipNoFaqOrProducts),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const { n, page } of nodesOf(site, ["FAQPage"])) {
      const text = squash(page.text);
      const hidden = (listOf(n.mainEntity) as JsonLdNode[]).map((q) => str(q.name)).filter((q) => q && !text.includes(squash(q)));
      if (hidden.length) add(page.fetched.publicUrl, t.faqHidden(hidden.length, quote(hidden[0]!, 60)));
    }
    for (const { n, page } of nodesOf(site, ["Product"])) {
      const price = String((listOf(n.offers)[0] as JsonLdNode | undefined)?.price ?? "");
      // 1990, 1 990, 1,990 and 1990.00 are one price.
      const digits = squash(price.replace(/[.,]0+$/, ""));
      if (digits && !squash(page.text).includes(digits)) add(page.fetched.publicUrl, t.priceHidden(price));
    }
    return out;
  },
};
