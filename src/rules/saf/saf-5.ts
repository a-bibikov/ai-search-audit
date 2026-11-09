/** SAF-5: No smuggled characters: Unicode tag characters and direction overrides that hide or reverse text. */
import type { Rule } from "../../types.ts";
import { finder, quote, strings } from "../util.ts";

/** Tag characters (U+E0000–U+E007F) spell ASCII that no one sees: the known way to hide a prompt in plain text. */
const TAGS = /[\u{E0000}-\u{E007F}]+/u;
/** Direction overrides make text read differently from how it looks. */
const BIDI = /[‪-‮⁦-⁩]/;

export const saf5: Rule = {
  id: "SAF-5",
  group: "SAF",
  level: "error",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const check = (where: string, texts: string[]) => {
      for (const text of texts) {
        const tags = text.match(TAGS)?.[0];
        if (tags) {
          const hidden = [...tags].map((c) => String.fromCodePoint(c.codePointAt(0)! - 0xe0000)).join("");
          add(where, t.tagCharacters(quote(hidden, 60)));
          return;
        }
        if (BIDI.test(text)) {
          add(where, t.bidiOverride);
          return;
        }
      }
    };
    for (const page of site.pages) check(page.fetched.publicUrl, [page.title, page.description, page.text, ...page.jsonLd.flatMap((n) => strings(n))]);
    for (const f of [site.llms, site.llmsFull]) if (f) check(f.publicUrl, [f.body]);
    return out;
  },
};
