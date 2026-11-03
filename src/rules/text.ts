import type { Rule } from "../types.ts";
import { INVISIBLE, INVISIBLE_G, finder, isArticle, quote, strings } from "./util.ts";

const countInvisible = (text: string) => (text.match(INVISIBLE_G) ?? []).length;

export const textRules: Rule[] = [
  {
    id: "B-1",
    group: "B",
    level: "error",
    run(site, _config, t) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        const article = isArticle(page);
        const min = article ? 300 : 150;
        if (page.words < min) add(page.fetched.publicUrl, t.fewWords(page.words, article, min), article ? "error" : "warn");
      }
      return out;
    },
  },
  {
    id: "B-2",
    group: "B",
    level: "warn",
    run(site, _config, t) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        const where = page.fetched.publicUrl;
        if (INVISIBLE.test(page.title)) add(where, `<title> ${quote(page.title)}`);
        if (INVISIBLE.test(page.description)) add(where, `meta description ${quote(page.description)}`);
        const ld = page.jsonLd.flatMap((n) => strings(n)).find((s) => INVISIBLE.test(s));
        if (ld) add(where, `JSON-LD ${quote(ld)}`);
        const h1 = page.h1.find((h) => INVISIBLE.test(h));
        if (h1) add(where, t.h1Typography(quote(h1)), "info");
      }
      for (const feed of site.feeds) {
        const n = countInvisible(feed.body);
        if (n) add(feed.publicUrl, t.feedInvisible(n));
      }
      for (const f of [site.llms, site.llmsFull]) {
        const n = f ? countInvisible(f.body) : 0;
        if (f && n) add(f.publicUrl, t.fileInvisible(n));
      }
      return out;
    },
  },
  {
    id: "B-3",
    group: "B",
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
  },
];
