import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toMarkdown, type Report } from "../src/index.ts";

const report = (lang: "en" | "ru"): Report => ({
  site: "https://ada.example",
  lang,
  checkedAt: "2026-11-03T00:00:00.000Z",
  pages: ["https://ada.example/"],
  score: 75,
  grade: "C",
  counts: { error: 1, warn: 2, info: 1 },
  findings: [
    { rule: "B-3", level: "warn", where: "https://ada.example/", message: "H1" },
    { rule: "B-3", level: "warn", where: "https://ada.example/cv", message: "H1" },
    { rule: "B-1", level: "error", where: "https://ada.example/", message: "few words" },
    { rule: "A-2", level: "info", where: "site", message: "policy" },
  ],
  rules: [
    { id: "A-1", group: "A", level: "error", title: "Agents allowed", fix: "allow" },
    { id: "A-2", group: "A", level: "info", title: "Training policy", fix: "decide" },
    { id: "B-1", group: "B", level: "error", title: "Text in HTML", fix: "render" },
    { id: "B-3", group: "B", level: "warn", title: "Headings not glued", fix: "space" },
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
});
