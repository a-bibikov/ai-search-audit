/** Helpers shared by the C checks. */
import type { JsonLdNode, Page, Site } from "../../types.ts";
import { ENTITY_TYPES, isA, isArticle, str } from "../util.ts";

export const idOf = (v: unknown) => (v && typeof v === "object" ? str((v as JsonLdNode)["@id"]) : "");

export const authors = (node: JsonLdNode) => {
  const a = node.author;
  return Array.isArray(a) ? a : a ? [a] : [];
};

/** Entity nodes that are definitions, not references: author and publisher objects inside articles are left out. */
export const definitions = (site: Site) => {
  const refs = new Set<unknown>();
  for (const p of site.pages) for (const n of p.jsonLd) for (const k of ["author", "publisher", "creator"]) for (const r of [n[k]].flat()) refs.add(r);
  return site.pages.flatMap((page) => page.jsonLd.filter((n) => !refs.has(n) && isA(n, ENTITY_TYPES) && n.name && (n.url || n.sameAs)).map((n) => ({ n, page })));
};

/** The path of a page, decoded and without the trailing slash: «/ru/cv», «/blog/tag/ai». */
export const pathOf = (page: Page) => {
  try {
    return decodeURIComponent(new URL(page.fetched.publicUrl).pathname).replace(/\/$/, "").toLowerCase();
  } catch {
    return "";
  }
};

/** About, CV and team pages: where a site says who stands behind it. */
export const ABOUT = /(^|\/)(about|about-us|about-me|cv|resume|team|company|profile|o-nas|obo-mne|o-kompanii|komanda|rezyume|о-нас|обо-мне|о-компании|команда|резюме)$/i;
export const CONTACT = /(^|\/)(contacts?|contact-us|kontakty|контакты)$/i;

/** A page that lists articles: a blog, a tag or a category, not an article itself. */
export const isListing = (page: Page) => {
  if (isArticle(page)) return false;
  const segs = pathOf(page).split("/").filter(Boolean);
  const last = segs.at(-1) ?? "";
  const parent = segs.at(-2) ?? "";
  return /^(blog|news|articles|posts|insights|stat[iy]i|novosti|блог|новости|статьи)$/.test(last) || /^(tags?|category|categories|topics?|tema|теги|темы)$/.test(parent);
};

/** Every JSON-LD node of a type on the audited pages, with its page. */
export const nodesOf = (site: Site, list: string[]) => site.pages.flatMap((page) => page.jsonLd.filter((n) => isA(n, list)).map((n) => ({ n, page })));

/** A value or list of values as a list. */
export const listOf = (v: unknown): unknown[] => (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]);

/**
 * Text for comparing what markup says with what the page shows: letters and digits only, no case, ё as е. Spaces,
 * punctuation, separators of thousands and the invisible characters typography plugins insert (U+00AD, U+2060,
 * zero-width spaces) do not make the same question or price look different.
 */
export const squash = (s: string) => s.normalize("NFKC").toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
