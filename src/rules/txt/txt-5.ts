/** TXT-5: Content is not hidden in frames of the same site or drawn on a canvas. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

/** A canvas on a page with less text than this is likely drawing the content instead of showing it. */
const MIN_WORDS = 150;

export const txt5: Rule = {
  id: "TXT-5",
  group: "TXT",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const own = (u: string) => u.startsWith(`${site.base}/`) || u.startsWith(`${site.target}/`);
    for (const page of site.pages) {
      const where = page.fetched.publicUrl;
      // Frames of other sites (video, maps, forms) are not the page's content.
      for (const m of page.fetched.body.matchAll(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)) {
        let src: string;
        try {
          src = new URL(m[1]!, where).href;
        } catch {
          continue;
        }
        if (own(src)) add(where, t.ownFrame(src.replace(site.base, "").replace(site.target, "") || "/"));
      }
      if (/<canvas\b/i.test(page.fetched.body) && page.words < MIN_WORDS) add(where, t.canvasText(page.words));
    }
    return out;
  },
};
