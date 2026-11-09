/** UPD-3: Nothing on the page looks stale: no past year in a title or heading, no old copyright year. */
import type { Rule } from "../../types.ts";
import { articleNode, finder, quote, str } from "../util.ts";

/** Years this far back are history, not a stale «Best tools of 2019». */
const LOOKBACK = 6;

export const upd3: Rule = {
  id: "UPD-3",
  group: "UPD",
  level: "info",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const now = new Date().getFullYear();
    for (const page of site.pages) {
      const art = articleNode(page);
      // An article from 2024 may say 2024 in its title: that is its date, not a stale promise.
      const own = new Set([str(art?.datePublished), str(art?.dateModified)].map((d) => d.slice(0, 4)).filter(Boolean));
      const heading = [page.title, ...page.h1].find((h) =>
        (h.match(/\b(20\d{2})\b/g) ?? []).some((y) => Number(y) < now && Number(y) >= now - LOOKBACK && !own.has(y)),
      );
      if (heading) add(page.fetched.publicUrl, t.staleYear(quote(heading, 60)));
      // «© 2019» alone, not «© 2019–2026»: the range is kept up to date, the single year was forgotten.
      const copyright = page.fetched.body.match(/(?:©|&copy;|\(c\))\s*(20\d{2})(?!\s*[-–—]\s*\d)/i)?.[1];
      if (copyright && Number(copyright) < now - 1) add(page.fetched.publicUrl, t.oldCopyright(copyright));
    }
    return out;
  },
};
