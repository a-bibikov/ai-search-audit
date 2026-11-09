/** SAF-3: No directions to AI hidden where people do not look: comments, alt and title texts, meta tags, JSON-LD. */
import { decode } from "auditor-engine";
import type { Rule } from "../../types.ts";
import { finder, quote, strings } from "../util.ts";
import { findToAi } from "./shared.ts";

export const saf3: Rule = {
  id: "SAF-3",
  group: "SAF",
  level: "error",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      const html = page.fetched.body;
      // Visible text is SAF-1's: here only what a person never sees on the page.
      const places: [string, string[]][] = [
        ["<!-- -->", [...html.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1]!)],
        ["alt / title / aria-label", [...html.matchAll(/\b(?:alt|title|aria-label|aria-description)\s*=\s*"([^"]*)"/gi)].map((m) => decode(m[1]!))],
        ["<meta>", [...html.matchAll(/<meta\b[^>]*\bcontent\s*=\s*"([^"]*)"/gi)].map((m) => decode(m[1]!))],
        ["<noscript>", [...html.matchAll(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/gi)].map((m) => m[1]!)],
        ["JSON-LD", page.jsonLd.flatMap((n) => strings(n))],
      ];
      for (const [place, texts] of places) {
        const found = texts.map(findToAi).find(Boolean);
        if (found) {
          add(page.fetched.publicUrl, t.hiddenToAi(place, quote(found)));
          break;
        }
      }
    }
    return out;
  },
};
