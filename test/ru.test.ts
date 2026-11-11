import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { audit } from "../src/index.ts";
import { page, serve, words } from "./site.ts";

/**
 * Russian pages with typography: invisible characters must not make the markup and the page look different, and a
 * short listing is not a page drowned in menus.
 */
describe("Russian pages", () => {
  let site: { origin: string; close: () => Promise<void> };
  before(async () => {
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Сколько стоит SEO-аудит?", acceptedAnswer: { "@type": "Answer", text: "Бесплатно." } }],
    };
    site = await serve({
      // A typography plugin put a word joiner and a soft hyphen into the visible question, inside a closed <details>.
      "/faq": { body: page({ title: "Вопросы", h1: "Вопросы", body: `<p>${words(60, "слово")}</p><details><summary>Сколько\u2060 стоит <b>SEO-ау\u00ADдит</b>?</summary><p>Бесплатно.</p></details>`, jsonLd: [faq] }) },
      // A listing of cards: little text of its own under a heavy footer.
      "/tools": { body: page({ title: "Инструменты", h1: "Инструменты", body: `<p>${words(90, "карточка")}</p>` }).replace("</main>", `</main><footer>${words(200, "подвал")}</footer>`) },
    });
  });
  after(() => site.close());

  it("reads FAQ questions with typography and short listings", async () => {
    const urls = ["/faq", "/tools"].map((p) => site.origin + p);
    const r = await audit(site.origin, { urls });
    const at = (rule: string) => r.findings.filter((f) => f.rule === rule).map((f) => new URL(f.where, site.origin).pathname);
    assert.deepEqual(at("ENT-10"), [], "the question is on the page despite the invisible characters");
    assert.ok(!at("TXT-4").includes("/tools"), "a short listing is not a page drowned in menus");
  });
});
