/** ENT-12: The site has an about page and a way to contact its owner. */
import type { Rule } from "../../types.ts";
import { finder, isA } from "../util.ts";
import { ABOUT, CONTACT } from "./shared.ts";

const path = (url: string) => {
  try {
    return decodeURIComponent(new URL(url).pathname).replace(/\/$/, "").toLowerCase();
  } catch {
    return "";
  }
};

export const ent12: Rule = {
  id: "ENT-12",
  group: "ENT",
  level: "info",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const own = (u: string) => u.startsWith(`${site.base}/`) || u.startsWith(`${site.target}/`) || u === site.base;
    const paths = new Set([...site.pages.map((p) => p.fetched.publicUrl), ...site.pages.flatMap((p) => p.links).filter(own)].map(path));
    const about = [...paths].some((p) => ABOUT.test(p)) || site.pages.some((p) => p.jsonLd.some((n) => isA(n, ["ProfilePage", "AboutPage"])));
    // Contacts can be a page, a mail or phone link, or contact points in the markup.
    const contact =
      [...paths].some((p) => CONTACT.test(p)) ||
      site.pages.some((p) => /href\s*=\s*["'](mailto|tel):/i.test(p.fetched.body) || p.jsonLd.some((n) => n.contactPoint || n.email || n.telephone));
    if (!about) add("site", t.noAboutPage);
    if (!contact) add("site", t.noContacts);
    return out;
  },
};
