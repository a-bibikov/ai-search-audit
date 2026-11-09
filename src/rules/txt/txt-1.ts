/** TXT-1: The text is in the HTML, not only in JavaScript. */
import type { Rule } from "../../types.ts";
import { finder, isArticle, quote } from "../util.ts";
import { JS_STUB } from "./shared.ts";

export const txt1: Rule = {
  id: "TXT-1",
  group: "TXT",
  level: "error",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      const article = isArticle(page);
      const min = article ? 300 : 150;
      if (page.words >= min) continue;
      const stub = page.text.match(JS_STUB)?.[0];
      add(page.fetched.publicUrl, stub ? t.jsStub(page.words, quote(stub)) : t.fewWords(page.words, article, min), article ? "error" : "warn");
    }
    return out;
  },
};
