/** ENT-6: The about or CV page is marked up as a profile: ProfilePage or AboutPage with the person or company in it. */
import type { Rule } from "../../types.ts";
import { finder, isA } from "../util.ts";
import { ABOUT, pathOf } from "./shared.ts";

export const ent6: Rule = {
  id: "ENT-6",
  group: "ENT",
  level: "warn",
  applies: (site, t) => (site.pages.some((p) => ABOUT.test(pathOf(p))) ? null : t.skipNoAbout),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages)
      if (ABOUT.test(pathOf(page)) && !page.jsonLd.some((n) => isA(n, ["ProfilePage", "AboutPage"]))) add(page.fetched.publicUrl, t.noProfilePage);
    return out;
  },
};
