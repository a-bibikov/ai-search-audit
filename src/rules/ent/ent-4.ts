/** ENT-4: Every page has a link card: og:title, og:description, og:image. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

export const ent4: Rule = {
  id: "ENT-4",
  group: "ENT",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      const missing = ["title", "description", "image"].filter((k) => !page.og[k]);
      if (missing.length) add(page.fetched.publicUrl, t.noOg(missing.map((k) => `og:${k}`).join(", ")));
    }
    return out;
  },
};
