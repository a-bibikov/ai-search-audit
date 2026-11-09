/** SAF-2: No hidden blocks of text: what people cannot see should not be fed to a model either. */
import { countWords, textContent } from "auditor-engine";
import type { Rule } from "../../types.ts";
import { finder, quote } from "../util.ts";

/**
 * Inline styles that hide text from people: the classic ways to stuff keywords. The `hidden` attribute and closed
 * tabs (TXT-8) are left alone: hiding a panel until it is opened is honest.
 */
const HIDING = /display\s*:\s*none|visibility\s*:\s*hidden|font-size\s*:\s*0(px|em|rem)?\s*(;|$)|opacity\s*:\s*0(\.0+)?\s*(;|$)|(left|top|text-indent)\s*:\s*-\d{3,}px|color\s*:\s*transparent|clip\s*:\s*rect\(\s*0/i;
/** Fewer words than this is a label or a skip link, not stuffing. */
const MIN_WORDS = 30;

export const saf2: Rule = {
  id: "SAF-2",
  group: "SAF",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      for (const m of page.fetched.body.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bstyle\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/\1>/gi)) {
        if (!HIDING.test(m[2]!)) continue;
        const text = textContent(m[3]!);
        const words = countWords(text);
        if (words >= MIN_WORDS) {
          add(page.fetched.publicUrl, t.hiddenText(words, quote(text, 50)));
          break;
        }
      }
    }
    return out;
  },
};
