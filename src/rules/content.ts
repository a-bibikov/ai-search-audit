import { countWords } from "../html.ts";
import { markdownLinks } from "../sitemap.ts";
import type { Rule, Site } from "../types.ts";
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

/** llms.txt that answered 200 with text, not an HTML page served at that address (a common SPA fallback). */
const llmsReadable = (site: Site) => Boolean(site.llms && !/^\s*<(!doctype|html)/i.test(site.llms.body));

export const contentRules: Rule[] = [
  {
    id: "D-2",
    group: "D",
    level: "warn",
    applies(site, t) {
      return site.pages.some(isArticle) ? null : t.skipNoArticles;
    },
    run(site, _config, t) {
      const { out, add } = finder(this);
      for (const page of site.pages) {
        if (!isArticle(page)) continue;
        const first = page.paragraphs.filter((p) => countWords(p) >= 8).slice(0, 2);
        if (first.some((p) => FILLER.test(p.trim()))) add(page.fetched.publicUrl, t.introFirst(quote(first.find((p) => FILLER.test(p.trim()))!)));
        else if (!first.some((p) => countWords(p) >= 25)) add(page.fetched.publicUrl, t.noLongParagraph);
      }
      return out;
    },
  },
  {
    id: "E-1",
    group: "E",
    level: "warn",
    run(site, _config, t) {
      const { out, add } = finder(this);
      if (!site.llms) {
        const a = site.llmsAttempt;
        add("site", a.status === 404 || a.status === 410 ? t.notFound("/llms.txt") : t.answers("/llms.txt", a.error ?? `HTTP ${a.status}`));
        return out;
      }
      const body = site.llms.body;
      const where = site.llms.publicUrl;
      if (/^\s*<(!doctype|html)/i.test(body)) add(where, t.returnsHtml);
      if (!/^#\s+\S/m.test(body.trimStart().split("\n")[0] ?? "")) add(where, t.noH1);
      if (!/^>\s+\S/m.test(body)) add(where, t.noSummary);
      if (!/^##\s+\S/m.test(body)) add(where, t.noSections);
      if (!markdownLinks(body).length) add(where, t.noLinks);
      return out;
    },
  },
  {
    id: "E-2",
    group: "E",
    level: "error",
    applies(site, t) {
      return llmsReadable(site) ? null : t.skipNoLlms;
    },
    run(site, _config, t) {
      const { out, add } = finder(this);
      const inSitemap = new Set((site.sitemap?.urls ?? []).map((u) => u.loc.replace(/\/$/, "")));
      for (const { href, status } of site.llmsLinks) {
        if (status !== 200) add(href, t.brokenLink(status ? String(status) : t.nothing));
        else if (site.sitemap && /\/[^./]*$/.test(new URL(href).pathname) && !inSitemap.has(href.replace(/\/$/, ""))) add(href, t.notInSitemap, "warn");
      }
      return out;
    },
  },
  {
    id: "E-3",
    group: "E",
    level: "info",
    applies(site, t) {
      if (!llmsReadable(site)) return t.skipNoLlms;
      const langs = new Set(site.pages.flatMap((p) => p.hreflang.map((h) => h.lang)).filter((l) => l !== "x-default"));
      return langs.size > 1 ? null : t.skipOneLanguage;
    },
    run(site, _config, t) {
      const { out, add } = finder(this);
      const langs = new Set(site.pages.flatMap((p) => p.hreflang.map((h) => h.lang)).filter((l) => l !== "x-default"));
      if (site.llms && langs.size > 1 && !markdownLinks(site.llms.body).some((h) => /llms(-full)?\.txt$/.test(h))) add(site.llms.publicUrl, t.noOtherLlms(langs.size, [...langs].join(", ")));
      return out;
    },
  },
  {
    id: "E-5",
    group: "E",
    level: "info",
    applies(site, t) {
      return llmsReadable(site) ? null : t.skipNoLlms;
    },
    run(site, _config, t) {
      const { out, add } = finder(this);
      if (!site.llmsFull) {
        if (site.llms) add("site", t.notFound("/llms-full.txt"));
        return out;
      }
      const full = site.llmsFull.body.replace(/\s+/g, " ");
      const missing = site.pages.filter(isArticle).filter((p) => {
        const sample = p.paragraphs.find((x) => countWords(x) >= 12 && !x.includes(p.description));
        return sample && !full.includes(sample.slice(0, 60).replace(/\s+/g, " "));
      });
      if (missing.length) add(site.llmsFull.publicUrl, t.noArticleText(missing.length, site.pages.filter(isArticle).length, missing[0]!.fetched.publicUrl));
      return out;
    },
  },
  {
    id: "F-1",
    group: "F",
    level: "warn",
    applies(site, t) {
      if (!site.sitemap) return t.skipNoSitemap;
      return site.pages.some(isArticle) ? null : t.skipNoArticles;
    },
    run(site, _config, t) {
      const { out, add } = finder(this);
      if (!site.sitemap) return out;
      const lastmod = new Map(site.sitemap.urls.map((u) => [u.loc.replace(/\/$/, ""), u.lastmod]));
      for (const page of site.pages) {
        const modified = str(articleNode(page)?.dateModified);
        const lm = lastmod.get(page.fetched.publicUrl.replace(/\/$/, ""));
        if (modified && lm && datePart(lm) !== datePart(modified)) add(page.fetched.publicUrl, t.lastmodMismatch(datePart(lm), datePart(modified)));
        if (modified && lastmod.has(page.fetched.publicUrl.replace(/\/$/, "")) && !lm) add(page.fetched.publicUrl, t.noLastmod, "info");
      }
      return out;
    },
  },
  {
    id: "G-1",
    group: "G",
    level: "warn",
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
