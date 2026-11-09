/** TXT-6: The text has no broken encoding: «Ð¿Ñ€Ð¸Ð²ÐµÑ‚» or � instead of letters. */
import type { Rule } from "../../types.ts";
import { finder, quote } from "../util.ts";

/** UTF-8 read as Latin-1 or Windows-1252: Cyrillic and accented letters turn into pairs like «Ð¿», «Ã©», «â€™». */
const MOJIBAKE = /[ÃÐÑ][\u0080-¿]|â€[™œ“”¦˜]|�/;

export const txt6: Rule = {
  id: "TXT-6",
  group: "TXT",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      for (const [field, text] of [["<title>", page.title], ["meta description", page.description], ["text", page.text]] as const) {
        const m = MOJIBAKE.exec(text);
        if (!m) continue;
        const at = Math.max(0, m.index - 20);
        add(page.fetched.publicUrl, t.brokenEncoding(field, quote(text.slice(at, at + 50))));
        break;
      }
    }
    return out;
  },
};
