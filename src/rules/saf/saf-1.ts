/** SAF-1: No instructions addressed to AI in the content. */
import type { Rule } from "../../types.ts";
import { finder, quote } from "../util.ts";
import { findToAi } from "./shared.ts";

export const saf1: Rule = {
  id: "SAF-1",
  group: "SAF",
  level: "warn",
  run(site) {
    const { out, add } = finder(this);
    const check = (where: string, text: string) => {
      const found = findToAi(text);
      if (found) add(where, quote(found));
    };
    if (site.llms) check(site.llms.publicUrl, site.llms.body);
    if (site.llmsFull) check(site.llmsFull.publicUrl, site.llmsFull.body);
    for (const page of site.pages) check(page.fetched.publicUrl, page.text);
    return out;
  },
};
