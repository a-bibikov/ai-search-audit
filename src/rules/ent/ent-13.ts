/** ENT-13: sameAs points at profiles of the entity, not at a network's home page or at the site itself. */
import { jsonLdTypes as types } from "auditor-engine";
import type { Rule } from "../../types.ts";
import { finder, str } from "../util.ts";
import { definitions, listOf } from "./shared.ts";

const host = (u: URL) => u.hostname.toLowerCase().replace(/^www\./, "");

export const ent13: Rule = {
  id: "ENT-13",
  group: "ENT",
  level: "warn",
  applies: (site, t) => (definitions(site).some(({ n }) => listOf(n.sameAs).length) ? null : t.skipNoSameAs),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const own = host(new URL(site.base));
    // One entity is usually defined on every page: report each wrong link once, on the first page that has it.
    const seen = new Set<string>();
    for (const { n, page } of definitions(site)) {
      const who = `${types(n)[0]} «${str(n.name)}»`;
      for (const value of listOf(n.sameAs)) {
        const raw = str(value).trim();
        if (seen.has(`${who} ${raw}`)) continue;
        seen.add(`${who} ${raw}`);
        let url: URL | null = null;
        try {
          url = /^https?:\/\//i.test(raw) ? new URL(raw) : null;
        } catch {
          url = null;
        }
        // A profile needs a path (github.com/ada) or a query (facebook.com/profile.php?id=…); a bare host is the network.
        if (!url) add(page.fetched.publicUrl, t.sameAsNotUrl(who, raw || JSON.stringify(value)));
        else if (host(url) === own) add(page.fetched.publicUrl, t.sameAsSelf(who, raw));
        else if (url.pathname.replace(/\/+$/, "") === "" && !url.search) add(page.fetched.publicUrl, t.sameAsRoot(who, raw));
      }
    }
    return out;
  },
};
