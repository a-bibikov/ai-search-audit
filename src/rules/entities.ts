import { types } from "../html.ts";
import type { JsonLdNode, Rule, Site } from "../types.ts";
import { ENTITY_TYPES, articleNode, finder, isA, isArticle, str } from "./util.ts";

const idOf = (v: unknown) => (v && typeof v === "object" ? str((v as JsonLdNode)["@id"]) : "");
const authors = (node: JsonLdNode) => {
  const a = node.author;
  return Array.isArray(a) ? a : a ? [a] : [];
};

/** Entity nodes that are definitions, not references: author and publisher objects inside articles are left out. */
const definitions = (site: Site) => {
  const refs = new Set<unknown>();
  for (const p of site.pages) for (const n of p.jsonLd) for (const k of ["author", "publisher", "creator"]) for (const r of [n[k]].flat()) refs.add(r);
  return site.pages.flatMap((page) => page.jsonLd.filter((n) => !refs.has(n) && isA(n, ENTITY_TYPES) && n.name && (n.url || n.sameAs)).map((n) => ({ n, page })));
};

export const entityRules: Rule[] = [
  {
    id: "C-1",
    group: "C",
    level: "error",
    run(site, _config, t) {
      const { out, add } = finder(this);
      const defined = definitions(site);
      if (!defined.length) {
        add("site", t.noEntity);
        return out;
      }
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
  },
  {
    id: "C-2",
    group: "C",
    level: "warn",
    applies(site, t) {
      return site.pages.some(isArticle) ? null : t.skipNoArticles;
    },
    run(site, _config, t) {
      const { out, add } = finder(this);
      const ids = new Set(definitions(site).map(({ n }) => str(n["@id"])).filter(Boolean));
      for (const page of site.pages) {
        const art = articleNode(page);
        if (!art) continue;
        for (const a of authors(art)) {
          const id = idOf(a);
          if (!id) add(page.fetched.publicUrl, t.authorNoId(a && typeof a === "object" ? `«${str((a as JsonLdNode).name)}»` : JSON.stringify(a)));
          else if (ids.size && !ids.has(id)) add(page.fetched.publicUrl, t.authorUnknownId(id));
        }
      }
      return out;
    },
  },
  {
    id: "C-4",
    group: "C",
    level: "error",
    applies(site, t) {
      return site.pages.some(isArticle) ? null : t.skipNoArticles;
    },
    run(site, _config, t) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        const art = articleNode(page);
        if (!art) continue;
        const missing = ["headline", "datePublished", "author"].filter((k) => !art[k]);
        const soft = ["dateModified", "image", "inLanguage"].filter((k) => !art[k]);
        if (missing.length) add(page.fetched.publicUrl, t.articleMissing(types(art)[0]!, missing.join(", ")));
        if (soft.length) add(page.fetched.publicUrl, t.articleMissing(types(art)[0]!, soft.join(", ")), "warn");
      }
      return out;
    },
  },
  {
    id: "C-6",
    group: "C",
    level: "warn",
    run(site, _config, t) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        const missing = ["title", "description", "image"].filter((k) => !page.og[k]);
        if (missing.length) add(page.fetched.publicUrl, t.noOg(missing.map((k) => `og:${k}`).join(", ")));
      }
      return out;
    },
  },
  {
    id: "C-7",
    group: "C",
    level: "info",
    run(site, _config, t) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        if (page.jsonLd.some((n) => isA(n, ["FAQPage"]))) continue;
        const questions = page.headings.filter((h) => /\?\s*$/.test(h.text)).length;
        if (page.details >= 3 || questions >= 3) add(page.fetched.publicUrl, page.details >= 3 ? t.faqDetails(page.details) : t.faqQuestions(questions));
      }
      return out;
    },
  },
];
