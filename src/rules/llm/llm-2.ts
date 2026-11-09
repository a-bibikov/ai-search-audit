/** LLM-2: Links in llms.txt work and match the sitemap. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";
import { llmsSkip } from "./shared.ts";

export const llm2: Rule = {
  id: "LLM-2",
  group: "LLM",
  level: "warn",
  applies: (site, t) => llmsSkip(site, t),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const inSitemap = new Set((site.sitemap?.urls ?? []).map((u) => u.loc.replace(/\/$/, "")));
    for (const { href, status } of site.llmsLinks) {
      if (status !== 200) add(href, t.brokenLink(status ? String(status) : t.nothing));
      else if (site.sitemap && /\/[^./]*$/.test(new URL(href).pathname) && !inSitemap.has(href.replace(/\/$/, ""))) add(href, t.notInSitemap, "info");
    }
    return out;
  },
};
