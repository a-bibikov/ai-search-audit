/** BOT-11: Missing pages answer 404, so «not found» and the home page are not indexed and quoted in their place. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

export const bot11: Rule = {
  id: "BOT-11",
  group: "BOT",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const r = site.missingPage;
    if (r.status !== 200) return out;
    add(r.publicUrl, r.redirected && r.finalUrl && r.finalUrl.replace(/\/$/, "") === site.base ? t.soft404Home : t.soft404);
    return out;
  },
};
