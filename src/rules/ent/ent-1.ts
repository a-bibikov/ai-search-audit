/** ENT-1: The author or company is a defined entity. */
import { jsonLdTypes as types } from "auditor-engine";
import type { Rule } from "../../types.ts";
import { finder, isA, str } from "../util.ts";
import { definitions } from "./shared.ts";

export const ent1: Rule = {
  id: "ENT-1",
  group: "ENT",
  level: "error",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const defined = definitions(site);
    if (!defined.length) {
      add("site", t.noEntity);
      return out;
    }
    // The home page is where answer engines look first for who runs the site.
    const home = site.pages.find((p) => p.fetched.publicUrl.replace(/\/$/, "") === site.base);
    if (home && !defined.some(({ page }) => page === home)) add(home.fetched.publicUrl, t.entityNotOnHome(defined[0]!.page.fetched.publicUrl), "warn");
    const seen = new Set<string>();
    for (const { n, page } of defined) {
      const key = str(n["@id"]) || str(n.url) || str(n.name);
      if (seen.has(key)) continue;
      seen.add(key);
      const name = str(n.name);
      if (!n["@id"]) add(page.fetched.publicUrl, t.noId(types(n)[0]!, name));
      if (!n.sameAs) add(page.fetched.publicUrl, t.noSameAs(types(n)[0]!, name), "warn");
      if (isA(n, ["Person"]) && !n.jobTitle) add(page.fetched.publicUrl, t.noJobTitle(name), "warn");
    }
    return out;
  },
};
