/** UPD-5: lastmod in the sitemap tells pages apart: it is not one build date stamped on every address. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

/** With fewer dated addresses one shared date can be true. */
const MIN_URLS = 5;
const SAME_SHARE = 0.8;

export const upd5: Rule = {
  id: "UPD-5",
  group: "UPD",
  level: "warn",
  applies: (site, t) => ((site.sitemap?.urls.filter((u) => u.lastmod).length ?? 0) >= MIN_URLS ? null : t.skipFewLastmod),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const dated = site.sitemap!.urls.filter((u) => u.lastmod);
    const counts = new Map<string, number>();
    for (const u of dated) counts.set(u.lastmod!, (counts.get(u.lastmod!) ?? 0) + 1);
    const [value, n] = [...counts].sort((a, b) => b[1] - a[1])[0]!;
    if (n / dated.length >= SAME_SHARE) add("site", t.lastmodSame(n, dated.length, value));
    return out;
  },
};
