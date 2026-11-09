/** TXT-8: Text behind tabs and accordions is in the HTML, not loaded when a person clicks. */
import type { Rule } from "../../types.ts";
import { finder, quote } from "../util.ts";

/** Panels that are navigation or overlays, not content: their absence from the HTML costs nothing. */
const NOT_CONTENT = /menu|nav|search|dialog|modal|cart|drawer|popover|dropdown|sheet|sidebar|lang/i;

export const txt8: Rule = {
  id: "TXT-8",
  group: "TXT",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      const html = page.fetched.body;
      const ids = new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]!));
      const missing: string[] = [];
      // A tab or a disclosure button that names its panel: the panel should be in the HTML, even if hidden.
      for (const m of html.matchAll(/<[a-z][^>]*\baria-controls\s*=\s*["']([^"']+)["'][^>]*>([^<]{0,80})/gi)) {
        const tag = m[0];
        if (!/role\s*=\s*["']tab["']|aria-expanded/i.test(tag)) continue;
        const id = m[1]!.split(/\s+/)[0]!;
        if (ids.has(id) || NOT_CONTENT.test(id)) continue;
        missing.push(m[2]!.trim() || `#${id}`);
      }
      if (missing.length) add(page.fetched.publicUrl, t.panelsMissing(missing.length, quote(missing[0]!, 40)));
    }
    return out;
  },
};
