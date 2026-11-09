/** ENT-8: A company has a logo and contacts in its markup; a local business has an address and a phone. */
import type { Rule } from "../../types.ts";
import { finder, isA, str } from "../util.ts";
import { definitions } from "./shared.ts";

const ORGANIZATIONS = ["Organization", "Corporation", "LocalBusiness", "EducationalOrganization", "NGO"];

export const ent8: Rule = {
  id: "ENT-8",
  group: "ENT",
  level: "warn",
  applies: (site, t) => (definitions(site).some(({ n }) => isA(n, ORGANIZATIONS)) ? null : t.skipNoOrganization),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const seen = new Set<string>();
    for (const { n, page } of definitions(site)) {
      if (!isA(n, ORGANIZATIONS)) continue;
      const name = str(n.name);
      if (seen.has(name)) continue;
      seen.add(name);
      const missing: string[] = [];
      if (!n.logo) missing.push("logo");
      if (isA(n, ["LocalBusiness"])) missing.push(...["address", "telephone"].filter((k) => !n[k]));
      else if (!n.contactPoint && !n.email && !n.telephone && !n.address) missing.push("contactPoint / email / telephone");
      if (missing.length) add(page.fetched.publicUrl, t.organizationMissing(name, missing.join(", ")));
    }
    return out;
  },
};
