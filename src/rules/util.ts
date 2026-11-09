import { jsonLdTypes as types } from "auditor-engine";
import type { JsonLdNode, Page } from "../types.ts";

export { finder } from "auditor-engine";

export const ARTICLE_TYPES = ["Article", "BlogPosting", "NewsArticle", "TechArticle", "Report", "ScholarlyArticle"];
export const ENTITY_TYPES = ["Person", "Organization", "Corporation", "LocalBusiness", "EducationalOrganization", "NGO"];

export const isA = (node: JsonLdNode, list: string[]) => types(node).some((t) => list.includes(t));
export const articleNode = (page: Page) => page.jsonLd.find((n) => isA(n, ARTICLE_TYPES));
export const isArticle = (page: Page) => Boolean(articleNode(page));

export const str = (v: unknown): string => (typeof v === "string" ? v : "");

/** Every string inside a JSON-LD value. */
export const strings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) for (const x of v) strings(x, out);
  else if (v && typeof v === "object") for (const x of Object.values(v)) strings(x, out);
  return out;
};

/** Short quote for a message: trimmed, invisible characters shown as ⟨U+XXXX⟩. */
export const quote = (s: string, max = 70) => {
  const shown = s.replace(/\s+/g, " ").replace(INVISIBLE_G, (c) => `⟨U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}⟩`);
  return `«${shown.length > max ? shown.slice(0, max) + "…" : shown}»`;
};

/** Characters that are invisible but split a word for exact matching: word joiner, zero-width space, BOM, soft hyphen. */
export const INVISIBLE = /[\u2060\u200B\uFEFF\u00AD]/;
export const INVISIBLE_G = /[\u2060\u200B\uFEFF\u00AD]/g;

/** Link targets in Markdown, as in llms.txt: [title](url). */
export const markdownLinks = (text: string) => [...text.matchAll(/\[[^\]]*\]\((\S+?)\)/g)].map((m) => m[1]!);
