/** ENT-5: A visible FAQ is marked up as FAQPage. */
import type { Rule } from "../../types.ts";
import { finder, isA } from "../util.ts";

export const ent5: Rule = {
  id: "ENT-5",
  group: "ENT",
  level: "info",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      if (page.jsonLd.some((n) => isA(n, ["FAQPage"]))) continue;
      const questions = page.headings.filter((h) => /\?\s*$/.test(h.text)).length;
      if (page.details >= 3 || questions >= 3) add(page.fetched.publicUrl, page.details >= 3 ? t.faqDetails(page.details) : t.faqQuestions(questions));
    }
    return out;
  },
};
