/** Helpers shared by the D checks. */
import { countWords, textContent } from "auditor-engine";
import type { Page } from "../../types.ts";

export const FILLER = /^(in this (article|post|guide)|this (article|post) (will|is about)|today we|welcome to|в этой статье|в этом посте|сегодня мы|сегодня расскажу|давайте разберёмся)/i;

/** The first paragraphs of an article that carry text, not a byline or a caption. */
export const leadParagraphs = (page: Page, n = 2) => page.paragraphs.filter((p) => countWords(p) >= 8).slice(0, n);

/** Each H2 with the text of the first paragraph after it: where a section starts when it is quoted alone. */
export const sections = (html: string) =>
  [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2\b|$)/gi)].map((m) => ({
    heading: textContent(m[1]!),
    first: textContent(m[2]!.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? ""),
    words: countWords(textContent(m[2]!)),
  }));
