/** TXT-3: Headings do not glue words together. */
import type { Rule } from "../../types.ts";
import { finder, quote } from "../util.ts";

export const txt3: Rule = {
  id: "TXT-3",
  group: "TXT",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    // A letter, then closing tag(s), then opening tag(s) of a sibling element, then a letter: no whitespace anywhere.
    const glue = /([\p{L}\p{N}])((?:<\/[a-z0-9]+>)+)((?:<[a-z0-9][^>]*>)+)([\p{L}\p{N}])/iu;
    for (const page of site.pages) {
      page.h1Html.forEach((html, i) => {
        if (glue.test(html)) add(page.fetched.publicUrl, t.h1Reads(quote(page.h1[i] ?? "")));
      });
    }
    return out;
  },
};
