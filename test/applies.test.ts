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
    assert.match(md, /- – E-2 .* — not checked: no llms\.txt/);
    assert.doesNotMatch(md, /- ✓ E-2/);
    assert.ok(!r.findings.some((f) => ["E-2", "E-3", "E-5", "C-2", "C-4", "D-2", "A-5"].includes(f.rule)));
  });

  it("E-1 says what the server answered instead of «not found»", async () => {
    const r = await audit(origin, { config: { lang: "ru" } });
    const e1 = r.findings.find((f) => f.rule === "E-1");
    assert.match(e1?.message ?? "", /\/llms\.txt отвечает HTTP 403/);
  });
});
