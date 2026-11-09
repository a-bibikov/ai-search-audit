/** BOT-4: No noindex or noai on public pages. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

export const bot4: Rule = {
  id: "BOT-4",
  group: "BOT",
  level: "error",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const bad = /\b(noindex|none|noai)\b/i;
    for (const page of site.pages) {
      const header = page.fetched.headers.get("x-robots-tag") ?? "";
      if (bad.test(page.metaRobots)) add(page.fetched.publicUrl, t.closedBy(`<meta name="robots" content="${page.metaRobots}">`));
      if (bad.test(header)) add(page.fetched.publicUrl, t.closedBy(`X-Robots-Tag: ${header}`));
    }
    const llmsHeader = site.llms?.headers.get("x-robots-tag") ?? "";
    if (site.llms && bad.test(llmsHeader)) add(site.llms.publicUrl, t.closedBy(`X-Robots-Tag: ${llmsHeader}`));
    return out;
  },
};
