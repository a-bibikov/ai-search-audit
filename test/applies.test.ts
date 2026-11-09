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
    assert.equal(reason("E-2"), "no llms.txt");
    assert.equal(reason("E-3"), "no llms.txt");
    assert.equal(reason("E-5"), "no llms.txt");
    assert.equal(reason("C-2"), "no articles among the audited pages");
    assert.equal(reason("D-2"), "no articles among the audited pages");
    assert.equal(reason("A-5"), "the site has no feed");
    assert.equal(reason("E-1"), undefined, "E-1 still runs and reports the missing file");
    const md = toMarkdown(r);
    assert.match(md, /\| – +\| E-2 .*\| not checked: no llms\.txt +\|/);
    assert.doesNotMatch(md, /\| ✓ +\| E-2/);
    assert.equal(r.rules.find((x) => x.id === "E-2")?.status, "skipped");
    assert.ok(!r.findings.some((f) => ["E-2", "E-3", "E-5", "C-2", "C-4", "D-2", "A-5"].includes(f.rule)));
  });

  it("E-1 says what the server answered instead of «not found»", async () => {
    const r = await audit(origin, { config: { lang: "ru" } });
    const e1 = r.findings.find((f) => f.rule === "E-1");
    assert.match(e1?.message ?? "", /\/llms\.txt отвечает HTTP 403/);
    assert.equal(e1?.level, "info");
  });
});

describe("C-1 on a site that describes itself only on an inner page", () => {
  let origin = "";
  let close = async () => {};
  before(async () => {
    const routes: Parameters<typeof serve>[0] = {};
    const s = await serve(routes);
    const org = { "@context": "https://schema.org", "@type": "Organization", "@id": `${s.origin}/#org`, name: "Shop", url: `${s.origin}/`, sameAs: ["https://t.me/shop"] };
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
    const c1 = r.findings.filter((f) => f.rule === "C-1");
    assert.equal(c1.length, 1);
    assert.equal(c1[0]!.level, "warn");
    assert.match(c1[0]!.message, /home page does not describe the company or author; it is described only on .*\/albums/);
  });

  it("treats a missing llms.txt as an optional note: no points lost, not among the priorities", async () => {
    const r = await audit(origin);
    const e1 = r.findings.filter((f) => f.rule === "E-1");
    assert.equal(e1.length, 1);
    assert.equal(e1[0]!.level, "info");
    assert.match(e1[0]!.message, /optional/);
    assert.equal(r.score, 90, "only C-1 costs points: a warning on 1 of 2 pages counts as site-wide");
    const md = toMarkdown(r);
    assert.doesNotMatch(md.slice(md.indexOf("## What to do first"), md.indexOf("## Checklist")), /E-1/);
  });
});
