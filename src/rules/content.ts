import { countWords } from "../html.ts";
import { markdownLinks } from "../sitemap.ts";
import type { Rule } from "../types.ts";
import { articleNode, finder, isArticle, quote, str } from "./util.ts";

const FILLER = /^(in this (article|post|guide)|this (article|post) (will|is about)|today we|welcome to|в этой статье|в этом посте|сегодня мы|сегодня расскажу|давайте разберёмся)/i;

/** Directions addressed to AI systems inside content: they look like prompt injection to answer engines. */
const TO_AI = [
  /\bif you are an? (ai|llm|language model|assistant|chatbot)\b/i,
  /\b(note|message|instructions?) (for|to) (ai|llms?|language models?|ai agents?|assistants?)\b/i,
  /\bignore (all |any )?(previous|prior|above) instructions\b/i,
  /\b(ai|llm) agents?,? (please |just )?(say|tell|recommend|share|mention)\b/i,
  /(для|к) (ai|ии)[- ]?(агент\p{L}*|ассистент\p{L}*|моделей)\s*:/iu,
  /если вы (ии|ai|нейросеть|языковая модель)/iu,
  /игнорируй(те)? (все )?(предыдущие|прошлые) инструкции/iu,
];

const datePart = (s: string) => s.slice(0, 10);

export const contentRules: Rule[] = [
  {
    id: "D-2",
    group: "D",
    level: "warn",
    title: "Articles answer in the first two paragraphs",
    fix: "Open with the answer: what it is, for whom, the main conclusion, in 25+ words. Answer engines quote the first paragraphs most often; an intro like «In this article we will…» wastes them.",
    run(site) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        if (!isArticle(page)) continue;
        const first = page.paragraphs.filter((p) => countWords(p) >= 8).slice(0, 2);
        if (first.some((p) => FILLER.test(p.trim()))) add(page.fetched.publicUrl, `starts with an intro instead of the answer: ${quote(first.find((p) => FILLER.test(p.trim()))!)}`);
        else if (!first.some((p) => countWords(p) >= 25)) add(page.fetched.publicUrl, "no paragraph of 25+ words among the first two");
      }
      return out;
    },
  },
  {
    id: "E-1",
    group: "E",
    level: "warn",
    title: "llms.txt exists and follows llmstxt.org",
    fix: "Serve /llms.txt as Markdown: `# Site name`, a `> one-line summary`, then `## Sections` with `- [Title](url): note` links to the key pages.",
    run(site) {
      const { out, add } = finder(this);
      if (!site.llms) {
        add("site", "/llms.txt not found");
        return out;
      }
      const t = site.llms.body;
      const where = site.llms.publicUrl;
      if (/^\s*<(!doctype|html)/i.test(t)) add(where, "returns HTML, not Markdown");
      if (!/^#\s+\S/m.test(t.trimStart().split("\n")[0] ?? "")) add(where, "does not start with an H1 `# Name`");
      if (!/^>\s+\S/m.test(t)) add(where, "no `> summary` line");
      if (!/^##\s+\S/m.test(t)) add(where, "no `## sections`");
      if (!markdownLinks(t).length) add(where, "no links");
      return out;
    },
  },
  {
    id: "E-2",
    group: "E",
    level: "error",
    title: "Links in llms.txt work and match the sitemap",
    fix: "Fix or remove broken links; list only published pages. A link that is in llms.txt but not in sitemap.xml is often a draft or a stale URL.",
    run(site) {
      const { out, add } = finder(this);
      const inSitemap = new Set((site.sitemap?.urls ?? []).map((u) => u.loc.replace(/\/$/, "")));
      for (const { href, status } of site.llmsLinks) {
        if (status !== 200) add(href, `listed in llms.txt, answers ${status || "nothing"}`);
        else if (site.sitemap && /\/[^./]*$/.test(new URL(href).pathname) && !inSitemap.has(href.replace(/\/$/, ""))) add(href, "listed in llms.txt but not in sitemap.xml", "warn");
      }
      return out;
    },
  },
  {
    id: "E-3",
    group: "E",
    level: "info",
    title: "Each language has its own llms.txt",
    fix: "For a multilingual site, serve llms.txt per language (e.g. /llms.txt and /ru/llms.txt) and link them to each other.",
    run(site) {
      const { out, add } = finder(this);
      const langs = new Set(site.pages.flatMap((p) => p.hreflang.map((h) => h.lang)).filter((l) => l !== "x-default"));
      if (site.llms && langs.size > 1 && !markdownLinks(site.llms.body).some((h) => /llms(-full)?\.txt$/.test(h))) add(site.llms.publicUrl, `site has ${langs.size} languages (${[...langs].join(", ")}), llms.txt links to no other llms.txt`);
      return out;
    },
  },
  {
    id: "E-5",
    group: "E",
    level: "info",
    title: "llms-full.txt carries the full text",
    fix: "Serve /llms-full.txt with the full text of key pages and articles, so a model can read the site in one request.",
    run(site) {
      const { out, add } = finder(this);
      if (!site.llmsFull) {
        if (site.llms) add("site", "/llms-full.txt not found");
        return out;
      }
      const full = site.llmsFull.body.replace(/\s+/g, " ");
      const missing = site.pages.filter(isArticle).filter((p) => {
        const sample = p.paragraphs.find((x) => countWords(x) >= 12 && !x.includes(p.description));
        return sample && !full.includes(sample.slice(0, 60).replace(/\s+/g, " "));
      });
      if (missing.length) add(site.llmsFull.publicUrl, `no article text for ${missing.length} of ${site.pages.filter(isArticle).length} audited articles, e.g. ${missing[0]!.fetched.publicUrl}`);
      return out;
    },
  },
  {
    id: "F-1",
    group: "F",
    level: "warn",
    title: "Sitemap lastmod matches the page's dateModified",
    fix: "Generate lastmod from the same date as JSON-LD dateModified; a mismatch tells crawlers the page changed when it did not, or hides real updates.",
    run(site) {
      const { out, add } = finder(this);
      if (!site.sitemap) return out;
      const lastmod = new Map(site.sitemap.urls.map((u) => [u.loc.replace(/\/$/, ""), u.lastmod]));
      for (const page of site.pages) {
        const modified = str(articleNode(page)?.dateModified);
        const lm = lastmod.get(page.fetched.publicUrl.replace(/\/$/, ""));
        if (modified && lm && datePart(lm) !== datePart(modified)) add(page.fetched.publicUrl, `sitemap lastmod ${datePart(lm)}, dateModified ${datePart(modified)}`);
        if (modified && lastmod.has(page.fetched.publicUrl.replace(/\/$/, "")) && !lm) add(page.fetched.publicUrl, "no lastmod in sitemap.xml", "info");
      }
      return out;
    },
  },
  {
    id: "G-1",
    group: "G",
    level: "warn",
    title: "No instructions addressed to AI in the content",
    fix: "Remove lines that tell AI systems what to say or do. Answer engines treat them as prompt injection and may drop the page or trust the site less. An easter egg for humans can live in humans.txt or the console.",
    run(site) {
      const { out, add } = finder(this);
      const check = (where: string, text: string) => {
        for (const re of TO_AI) {
          const m = text.match(re);
          if (m) {
            const i = m.index ?? 0;
            add(where, quote(text.slice(Math.max(0, i - 10), i + 80).trim()));
            return;
          }
        }
      };
      if (site.llms) check(site.llms.publicUrl, site.llms.body);
      if (site.llmsFull) check(site.llmsFull.publicUrl, site.llmsFull.body);
      for (const page of site.pages) check(page.fetched.publicUrl, page.text);
      return out;
    },
  },
];
