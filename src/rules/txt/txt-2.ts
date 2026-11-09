/** TXT-2: No invisible characters inside words in machine-readable output. */
import type { Rule } from "../../types.ts";
import { finder, INVISIBLE, quote, strings } from "../util.ts";
import { countInvisible } from "./shared.ts";

export const txt2: Rule = {
  id: "TXT-2",
  group: "TXT",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      const where = page.fetched.publicUrl;
      if (INVISIBLE.test(page.title)) add(where, t.invisibleIn("<title>", quote(page.title)));
      if (INVISIBLE.test(page.description)) add(where, t.invisibleIn("meta description", quote(page.description)));
      const ld = page.jsonLd.flatMap((n) => strings(n)).find((s) => INVISIBLE.test(s));
      if (ld) add(where, t.invisibleIn("JSON-LD", quote(ld)));
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
};
