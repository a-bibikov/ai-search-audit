import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { loadSeo } from "../src/seo.ts";

const CLI = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const run = (cwd: string, ...args: string[]) => spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8" });

/** A project with a stand-in search-auditor that records how it was called. */
function project(withSeo: boolean) {
  const dir = mkdtempSync(join(tmpdir(), "ai-seo-"));
  if (withSeo) {
    const pkg = join(dir, "node_modules", "search-auditor");
    mkdirSync(pkg, { recursive: true });
    writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "search-auditor", type: "module", exports: { ".": "./index.js" } }));
    writeFileSync(
      join(pkg, "index.js"),
      `export async function auditSearch(target, opts) {
        return { site: "https://stub.test", lang: opts.config.lang, checkedAt: "2026-11-04T00:00:00Z", pages: [], findings: [], rules: [],
          score: 88, grade: "B", counts: { error: 0, warn: 0, info: 0 }, checked: 1, total: 1, capped: false,
          sections: [{ name: "Classic search", score: 90, grade: "A", checked: 1, total: 1 }],
          seen: { target, base: opts.base, maxLinks: opts.config.maxLinks, maxPages: opts.config.maxPages } };
      }`,
    );
  }
  return dir;
}

describe("--seo", () => {
  let withSeo = "";
  let without = "";
  before(() => {
    withSeo = project(true);
    without = project(false);
  });
  after(() => {
    rmSync(withSeo, { recursive: true, force: true });
    rmSync(without, { recursive: true, force: true });
  });

  it("hands the run to search-auditor from the current project", () => {
    const r = run(withSeo, "https://example.com", "--seo", "--base", "https://example.org", "--max-links", "7", "--pages", "all", "--json", "--lang", "ru");
    assert.equal(r.status, 0, r.stderr);
    const report = JSON.parse(r.stdout);
    assert.deepEqual(report.seen, { target: "https://example.com", base: "https://example.org", maxLinks: 7, maxPages: "all" });
    assert.equal(report.lang, "ru");
  });

  it("says how to get search-auditor when it is missing", () => {
    const r = run(without, "https://example.com", "--seo");
    assert.equal(r.status, 2);
    assert.match(r.stderr, /--seo needs the search-auditor package/);
    assert.match(r.stderr, /npx -p ai-search-auditor -p search-auditor ai-search-auditor https:\/\/example\.com --seo/);
  });

  it("refuses --max-links without --seo", () => {
    const r = run(without, "https://example.com", "--max-links", "5");
    assert.equal(r.status, 2);
    assert.match(r.stderr, /--max-links works only with --seo/);
  });

  it("finds nothing where there is nothing", async () => {
    assert.equal(await loadSeo(without), null);
  });
});
