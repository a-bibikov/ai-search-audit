/** TXT-4: The main text sits in <main> or <article> and is not drowned in menus, footers and banners. */
import { countWords, visibleText } from "auditor-engine";
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";
import { mainHtml } from "./shared.ts";

/** Pages with less text are TXT-1's business: there is no main text to look for. */
const MIN_WORDS = 150;
/** Below this share of the page's words in <main>, menus and footers outweigh the content. */
const MIN_SHARE = 0.5;

export const txt4: Rule = {
  id: "TXT-4",
  group: "TXT",
  level: "info",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      if (page.words < MIN_WORDS) continue;
      const main = mainHtml(page.fetched.body);
      if (main === null) {
        add(page.fetched.publicUrl, t.noMain);
        continue;
      }
      const share = countWords(visibleText(main)) / page.words;
      if (share < MIN_SHARE) add(page.fetched.publicUrl, t.mainShare(Math.round(share * 100), Math.round(MIN_SHARE * 100)));
    }
    return out;
  },
};
