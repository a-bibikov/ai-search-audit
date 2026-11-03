import { types } from "../html.ts";
import type { JsonLdNode, Rule, Site } from "../types.ts";
import { ENTITY_TYPES, articleNode, finder, isA, str } from "./util.ts";

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
    title: "The author or company is a defined entity",
    fix: "Add JSON-LD Person (or Organization) to the home or about page with a stable `@id` (e.g. https://example.com/#person), `name`, `url`, `sameAs` with your profiles, and `jobTitle` for a person.",
    run(site) {
      const { out, add } = finder(this);
      const defined = definitions(site);
      if (!defined.length) {
        add("site", "No Person or Organization with name and url in JSON-LD on any audited page");
        return out;
      }
      const seen = new Set<string>();
      for (const { n, page } of defined) {
        const key = str(n["@id"]) || str(n.url) || str(n.name);
        if (seen.has(key)) continue;
        seen.add(key);
        const name = str(n.name);
        if (!n["@id"]) add(page.fetched.publicUrl, `${types(n)[0]} «${name}» has no @id: articles cannot point at it as one entity`);
        if (!n.sameAs) add(page.fetched.publicUrl, `${types(n)[0]} «${name}» has no sameAs (LinkedIn, GitHub…): models cannot confirm who this is`, "warn");
        if (isA(n, ["Person"]) && !n.jobTitle) add(page.fetched.publicUrl, `Person «${name}» has no jobTitle`, "warn");
      }
      return out;
    },
  },
  {
    id: "C-2",
    group: "C",
    level: "warn",
    title: "Articles point at the author entity by @id",
    fix: 'Set `author: { "@id": "https://example.com/#person" }` (plus name and url if you like) — the same @id as the Person on the home page.',
    run(site) {
      const { out, add } = finder(this);
      const ids = new Set(definitions(site).map(({ n }) => str(n["@id"])).filter(Boolean));
      for (const page of site.pages) {
        const art = articleNode(page);
        if (!art) continue;
        for (const a of authors(art)) {
          const id = idOf(a);
          if (!id) add(page.fetched.publicUrl, `author ${a && typeof a === "object" ? `«${str((a as JsonLdNode).name)}»` : JSON.stringify(a)} has no @id`);
          else if (ids.size && !ids.has(id)) add(page.fetched.publicUrl, `author @id ${id} matches no Person or Organization defined on the site`);
        }
      }
      return out;
    },
  },
  {
    id: "C-4",
    group: "C",
    level: "error",
    title: "Articles have complete Article / BlogPosting markup",
    fix: "Fill in `headline`, `datePublished`, `author` (required), and `dateModified`, `image`, `inLanguage`.",
    run(site) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        const art = articleNode(page);
        if (!art) continue;
        const missing = ["headline", "datePublished", "author"].filter((k) => !art[k]);
        const soft = ["dateModified", "image", "inLanguage"].filter((k) => !art[k]);
        if (missing.length) add(page.fetched.publicUrl, `${types(art)[0]} without ${missing.join(", ")}`);
        if (soft.length) add(page.fetched.publicUrl, `${types(art)[0]} without ${soft.join(", ")}`, "warn");
      }
      return out;
    },
  },
  {
    id: "C-6",
    group: "C",
    level: "warn",
    title: "Every page has a link card: og:title, og:description, og:image",
    fix: "Add og:image (1200×630) and og:title / og:description to each public page. Chat apps, social networks and AI answers build the link card from them.",
    run(site) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        const missing = ["title", "description", "image"].filter((k) => !page.og[k]);
        if (missing.length) add(page.fetched.publicUrl, `no ${missing.map((k) => `og:${k}`).join(", ")}`);
      }
      return out;
    },
  },
  {
    id: "C-7",
    group: "C",
    level: "info",
    title: "A visible FAQ is marked up as FAQPage",
    fix: "If the page really is questions and answers, add FAQPage JSON-LD with the same questions and answers as on the page.",
    run(site) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        if (page.jsonLd.some((n) => isA(n, ["FAQPage"]))) continue;
        const questions = page.headings.filter((h) => /\?\s*$/.test(h.text)).length;
        if (page.details >= 3 || questions >= 3) add(page.fetched.publicUrl, `${page.details >= 3 ? `${page.details} <details>` : `${questions} headings ending with «?»`} and no FAQPage — check by hand whether this is an FAQ`);
      }
      return out;
    },
  },
];
