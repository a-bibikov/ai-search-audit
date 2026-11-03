import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toMarkdown, type Report } from "../src/index.ts";

const report = (lang: "en" | "ru"): Report => ({
  site: "https://ada.example",
  lang,
  checkedAt: "2026-11-03T00:00:00.000Z",
  pages: ["https://ada.example/", "https://ada.example/cv", "https://ada.example/blog"],
  score: 75,
  grade: "C",
  counts: { error: 1, warn: 2, info: 1 },
  checked: 4,
  total: 4,
  capped: false,
  findings: [
    { rule: "B-3", level: "warn", where: "https://ada.example/", message: "H1" },
    { rule: "B-3", level: "warn", where: "https://ada.example/cv", message: "H1" },
    { rule: "B-1", level: "error", where: "https://ada.example/", message: "few words" },
    { rule: "A-2", level: "info", where: "site", message: "policy" },
  ],
  rules: [
    { id: "A-1", group: "A", level: "error", title: "Agents allowed", fix: "allow", impact: "AI cannot read." },
    { id: "A-2", group: "A", level: "info", title: "Training policy", fix: "decide", impact: "Undecided." },
    { id: "B-1", group: "B", level: "error", title: "Text in HTML", fix: "render", impact: "Empty page for AI." },
    { id: "B-3", group: "B", level: "warn", title: "Headings not glued", fix: "space", impact: "Glued headings." },
  ],
});


describe("report checklist", () => {
  it("lists every check by group with its status at the end", () => {
    const md = toMarkdown(report("en"));
    const tail = md.slice(md.indexOf("## Checklist"));
    assert.ok(md.indexOf("## Checklist") > md.indexOf("## ✖ B-1"), "checklist comes after the findings");
    assert.match(tail, /\*\*A\. Access for AI agents\*\*\n\n- ✓ A-1 Agents allowed\n- ℹ A-2 Training policy — 1 note/);
    assert.match(tail, /\*\*B\. Text without JavaScript\*\*\n\n- ✖ B-1 Text in HTML — 1 error\n- ⚠ B-3 Headings not glued — 2 warnings/);
    assert.doesNotMatch(tail, /Entities and authorship/, "groups without audited checks are left out");
    assert.match(md, /✓ OK · ✖ error/);
  });

  it("calls the fix a recommendation when a rule has only notes", () => {
    const md = toMarkdown(report("en"));
    assert.match(md, /## ℹ A-2[\s\S]*?\*\*Recommendation:\*\* decide/);
    assert.match(md, /## ✖ B-1[\s\S]*?\*\*Fix:\*\* render/);
  });

  it("is translated", () => {
    const md = toMarkdown(report("ru"));
    assert.match(md, /## Чек-лист/);
    assert.match(md, /- ⚠ B-3 Headings not glued — предупреждений: 2/);
    assert.match(md, /\*\*Рекомендация:\*\*/);
  });

  it("starts with what to do first, costliest first, with the scale", () => {
    const md = toMarkdown(report("en"));
    const block = md.slice(md.indexOf("## What to do first"), md.indexOf("## ✖"));
    // B-1 error costs 15; B-3 warns on 2 of 3 pages, a site-wide problem that costs 10; A-2 is a note and costs nothing.
    assert.match(block, /1\. \*\*Empty page for AI\.\*\* B-1, on 1 of 3 pages\n2\. \*\*Glued headings\.\*\* B-3, on 2 of 3 pages\n\n/);
    assert.doesNotMatch(block, /Undecided/);
    assert.ok(md.indexOf("## What to do first") < md.indexOf("## ✖ B-1"), "priorities come before the details");
  });

  it("shows coverage in the summary and says when the grade is capped", () => {
    const md = toMarkdown({ ...report("ru"), checked: 12, total: 20, capped: true, grade: "B", score: 95 });
    assert.match(md, /\*\*95\/100 \(B\)\*\* · проверено: 12 из 20 ·/);
    assert.match(md, /Оценка ограничена B: на этом сайте удалось выполнить только 12 проверок из 20\./);
  });
});
