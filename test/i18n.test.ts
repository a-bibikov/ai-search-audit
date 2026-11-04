import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { LANGS, audit, isLang, rules, toMarkdown } from "../src/index.ts";
import { en } from "../src/i18n/en.ts";
import { page, serve, words } from "./site.ts";

/** Every key of a nested object, functions included: «report.title», «m.noId»… */
const keys = (o: object, prefix = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

describe("languages", () => {
  it("every language has every string of English", () => {
    for (const [lang, t] of Object.entries(LANGS)) assert.deepEqual(keys(t).sort(), keys(en).sort(), lang);
  });

  it("every rule has a title and a fix in every language", () => {
    for (const t of Object.values(LANGS)) for (const r of rules) assert.ok(t.rules[r.id as keyof typeof t.rules].title && t.rules[r.id as keyof typeof t.rules].fix, r.id);
  });

  it("Russian is translated, not copied", () => {
    const same = keys(en.rules).filter((k) => {
      const [id, field] = k.split(".") as [keyof typeof en.rules, "title" | "fix"];
      return LANGS.ru.rules[id][field] === en.rules[id][field];
    });
    assert.deepEqual(same, []);
  });

  it("knows its languages", () => {
    assert.ok(isLang("en") && isLang("ru"));
    assert.ok(!isLang("de") && !isLang("toString") && !isLang(undefined));
  });
});

describe("report language", () => {
  let origin = "";
  let close = async () => {};
  before(async () => {
    const s = await serve({
      "/": { body: page({ title: "Ada", h1: '<span>Ada</span><span>Engineer</span>', body: `<p>${words(200)}</p>`, og: false }) },
    });
    origin = s.origin;
    close = s.close;
  });
  after(() => close());

  it("is English by default", async () => {
    const r = await audit(origin);
    assert.equal(r.lang, "en");
    const md = toMarkdown(r);
    assert.match(md, /^# AI search audit:/);
    assert.match(md, /H1 reads as «AdaEngineer»/);
    assert.match(md, /\*\*Fix:\*\*/);
  });

  it("writes titles, fixes and messages in Russian with lang: ru", async () => {
    const r = await audit(origin, { config: { lang: "ru" } });
    const md = toMarkdown(r);
    assert.match(md, /^# Проверка для AI-поиска:/);
    assert.match(md, /ошибок: \d+ · предупреждений: \d+/);
    assert.match(md, /H1 читается как «AdaEngineer»/);
    assert.match(md, /## ⚠ B-3 Заголовки не склеивают слова/);
    assert.match(md, /\*\*Как исправить:\*\*/);
    assert.doesNotMatch(md, /H1 reads as|Fix:|Passed/);
  });
});
