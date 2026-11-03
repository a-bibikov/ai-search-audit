import type { Rule } from "../types.ts";
import { INVISIBLE, finder, isArticle, quote, strings } from "./util.ts";

export const textRules: Rule[] = [
  {
    id: "B-1",
    group: "B",
    level: "error",
    title: "The text is in the HTML, not only in JavaScript",
    fix: "Render the content on the server (SSR or static generation). Most AI crawlers do not run JavaScript: what is not in the HTML does not exist for them.",
    run(site) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        const article = isArticle(page);
        const min = article ? 300 : 150;
        if (page.words < min) add(page.fetched.publicUrl, `${page.words} words in the HTML without JavaScript (${article ? "article" : "page"}: at least ${min})`, article ? "error" : "warn");
      }
      return out;
    },
  },
  {
    id: "B-2",
    group: "B",
    level: "warn",
    title: "No invisible characters inside words in machine-readable output",
    fix: "Strip U+2060, U+200B, U+FEFF and U+00AD from <title>, meta, JSON-LD, feeds and llms.txt: «AI-⟨U+2060⟩native» with a hidden character does not match the query «AI-native». On the page itself typography can keep them, use CSS `white-space: nowrap` where you can.",
    run(site) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        const where = page.fetched.publicUrl;
        if (INVISIBLE.test(page.title)) add(where, `<title> ${quote(page.title)}`);
        if (INVISIBLE.test(page.description)) add(where, `meta description ${quote(page.description)}`);
        const ld = page.jsonLd.flatMap((n) => strings(n)).find((s) => INVISIBLE.test(s));
        if (ld) add(where, `JSON-LD ${quote(ld)}`);
        const h1 = page.h1.find((h) => INVISIBLE.test(h));
        if (h1) add(where, `H1 ${quote(h1)} — fine if it is deliberate typography, the visible text is matched less strictly`, "info");
      }
      for (const feed of site.feeds) {
        const n = (feed.body.match(/[\u2060\u200B\uFEFF\u00AD]/g) ?? []).length;
        if (n) add(feed.publicUrl, `${n} invisible characters in the feed`);
      }
      for (const f of [site.llms, site.llmsFull]) {
        const n = f ? (f.body.match(/[\u2060\u200B\uFEFF\u00AD]/g) ?? []).length : 0;
        if (f && n) add(f.publicUrl, `${n} invisible characters`);
      }
      return out;
    },
  },
  {
    id: "B-3",
    group: "B",
    level: "warn",
    title: "Headings do not glue words together",
    fix: 'Put a space between sibling elements inside the heading (in JSX: `{" "}`). Styles show two lines, but a crawler reads the text nodes joined: «NameTagline».',
    run(site) {
      const { out, add } = finder(this);
      // A letter, then closing tag(s), then opening tag(s) of a sibling element, then a letter: no whitespace anywhere.
      const glue = /([\p{L}\p{N}])((?:<\/[a-z0-9]+>)+)((?:<[a-z0-9][^>]*>)+)([\p{L}\p{N}])/iu;
      for (const page of site.pages) {
        page.h1Html.forEach((html, i) => {
          if (glue.test(html)) add(page.fetched.publicUrl, `H1 reads as ${quote(page.h1[i] ?? "")}`);
        });
      }
      return out;
    },
  },
];
