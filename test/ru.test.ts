import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { audit } from "../src/index.ts";
import { page, serve, words } from "./site.ts";

/**
 * Russian text and typography: checks that look for words must see Cyrillic ones, and invisible characters must not
 * make the markup and the page look different.
 */
describe("Russian pages", () => {
  let site: { origin: string; close: () => Promise<void> };
  before(async () => {
    const article = (body: string) => ({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Как работают ответы",
      datePublished: "2026-09-30",
      inLanguage: "ru",
      author: { "@type": "Person", name: "Ада" },
      articleBody: body,
    });
    const long = (heading: string, opening: string) =>
      `<p><time datetime="2026-09-30">30 сентября 2026</time></p><p>${words(420, "текст")}</p><h2>Как это устроено</h2><p>${opening} ${words(420, "деталь")}</p><h2>${heading}</h2><p>Короткий вывод статьи.</p>`;
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Сколько стоит SEO-аудит?", acceptedAnswer: { "@type": "Answer", text: "Бесплатно." } }],
    };
    site = await serve({
      "/summary": { body: page({ title: "Как работают ответы", h1: "Как работают ответы", body: long("Главное", "Ответы"), jsonLd: [article("x")] }) },
      "/no-summary": { body: page({ title: "Как работают ответы, часть 2", h1: "Как работают ответы, часть 2", body: long("Что дальше", "Это продолжение"), jsonLd: [article("y")] }) },
      // A typography plugin put a word joiner and a soft hyphen into the visible question, inside a closed <details>.
      "/faq": { body: page({ title: "Вопросы", h1: "Вопросы", body: `<p>${words(60, "слово")}</p><details><summary>Сколько⁠ стоит <b>SEO-ау­дит</b>?</summary><p>Бесплатно.</p></details>`, jsonLd: [faq] }) },
      // A listing of cards: little text of its own under a heavy footer.
      "/tools": { body: page({ title: "Инструменты", h1: "Инструменты", body: `<p>${words(90, "карточка")}</p>` }).replace("</main>", `</main><footer>${words(200, "подвал")}</footer>`) },
    });
  });
  after(() => site.close());

  it("reads Russian conclusions, openings, FAQ questions and short listings", async () => {
    const urls = ["/summary", "/no-summary", "/faq", "/tools"].map((p) => site.origin + p);
    const r = await audit(site.origin, { urls });
    const at = (rule: string) => r.findings.filter((f) => f.rule === rule).map((f) => new URL(f.where, site.origin).pathname);
    assert.ok(!at("ANS-7").includes("/summary"), "«Главное» is a conclusion");
    assert.ok(at("ANS-7").includes("/no-summary"), "an article without one is still found");
    assert.ok(at("ANS-6").includes("/no-summary"), "a section opening with «Это» is found");
    assert.deepEqual(at("ENT-10"), [], "the question is on the page despite the invisible characters");
    assert.ok(!at("TXT-4").includes("/tools"), "a short listing is not a page drowned in menus");
  });
});
