import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { audit, toMarkdown } from "../src/index.ts";
import { page, serve, words } from "./site.ts";

/** A shop page with no articles, no feed, one language and an llms.txt that the server refuses. */
describe("checks that do not apply", () => {
  let origin = "";
  let close = async () => {};
  before(async () => {
    const s = await serve({
      "/": { body: page({ title: "Shop", h1: "Shop", body: `<p>${words(200)}</p>` }) },
      "/llms.txt": { status: 403, type: "text/plain", body: "Forbidden" },
    });
    origin = s.origin;
    close = s.close;
  });
  after(() => close());

  it("are shown as not checked with the reason, never as passed", async () => {
    const r = await audit(origin, { config: { lang: "en" } });
    const reason = (id: string) => r.rules.find((x) => x.id === id)?.skipped;
    // The whole group E waits for an llms.txt, and the reason says what the server answered.
    for (let i = 1; i <= 8; i++) assert.equal(reason(`LLM-${i}`), "/llms.txt answers HTTP 403", `LLM-${i}`);
    assert.equal(reason("ENT-2"), "no articles among the audited pages");
    assert.equal(reason("ENT-3"), "no articles among the audited pages");
    assert.equal(reason("BOT-5"), "the site has no feed");
    const md = toMarkdown(r);
    assert.match(md, /\| – +\| LLM-2 .*\| not checked: \/llms\.txt answers HTTP 403 +\|/);
    assert.doesNotMatch(md, /\| ✓ +\| LLM-2/);
    assert.equal(r.rules.find((x) => x.id === "LLM-2")?.status, "skipped");
    assert.ok(!r.findings.some((f) => ["LLM-1", "LLM-2", "LLM-3", "LLM-4", "LLM-5", "LLM-6", "LLM-7", "LLM-8", "ENT-2", "ENT-3", "BOT-5"].includes(f.rule)));
  });

  it("says in the report language why group E did not run", async () => {
    const r = await audit(origin, { config: { lang: "ru" } });
    assert.equal(r.rules.find((x) => x.id === "LLM-1")?.skipped, "/llms.txt отвечает HTTP 403");
  });
});

describe("ENT-1 on a site that describes itself only on an inner page", () => {
  let origin = "";
  let close = async () => {};
  before(async () => {
    const routes: Parameters<typeof serve>[0] = {};
    const s = await serve(routes);
    const org = { "@context": "https://schema.org", "@type": "Organization", "@id": `${s.origin}/#org`, name: "Shop", url: `${s.origin}/`, sameAs: ["https://t.me/shop"], logo: `${s.origin}/logo.png`, email: "shop@example.com" };
    Object.assign(routes, {
      "/": { body: page({ title: "Shop", h1: "Shop", body: `<p>${words(200)}</p>` }) },
      "/robots.txt": { type: "text/plain", body: `User-agent: *\nAllow: /\nSitemap: ${s.origin}/sitemap.xml\n` },
      "/sitemap.xml": { type: "application/xml", body: `<urlset><url><loc>${s.origin}/</loc></url><url><loc>${s.origin}/albums</loc></url></urlset>` },
      "/albums": { body: page({ title: "Albums", h1: "Albums", body: `<p>${words(200)}</p>`, jsonLd: [org] }) },
    });
    origin = s.origin;
    close = s.close;
  });
  after(() => close());

  it("warns that the home page does not say who runs the site", async () => {
    const r = await audit(origin);
    const c1 = r.findings.filter((f) => f.rule === "ENT-1");
    assert.equal(c1.length, 1);
    assert.equal(c1[0]!.level, "warn");
    assert.match(c1[0]!.message, /home page does not describe the company or author; it is described only on .*\/albums/);
  });

  it("skips group E without llms.txt: no points lost, nothing among the priorities", async () => {
    const r = await audit(origin);
    assert.ok(!r.findings.some((f) => f.rule.startsWith("LLM-")));
    for (const x of r.rules.filter((x) => x.group === "LLM")) assert.equal(x.skipped, "no llms.txt — it is optional", x.id);
    assert.equal(r.score, 90, "only ENT-1 costs points: a warning on 1 of 2 pages counts as site-wide");
    const md = toMarkdown(r);
    assert.doesNotMatch(md.slice(md.indexOf("## What to do first"), md.indexOf("## Checklist")), /LLM-1/);
  });
});
