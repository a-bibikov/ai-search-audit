import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickPages } from "../src/crawl.ts";
import { parseRobots } from "../src/robots.ts";
import { scoreOf } from "../src/score.ts";

describe("robots.txt", () => {
  const r = parseRobots("User-agent: *\nDisallow: /private\nAllow: /private/ok$\n\nUser-agent: GPTBot\nUser-agent: CCBot\nDisallow: /\n");
  it("uses the agent's own group, else *", () => {
    assert.equal(r.allows("GPTBot", "/"), false);
    assert.equal(r.allows("ccbot", "/blog"), false);
    assert.equal(r.allows("ClaudeBot", "/blog"), true);
    assert.equal(r.names("GPTBot"), true);
    assert.equal(r.names("ClaudeBot"), false);
  });
  it("lets the longest match win and supports $", () => {
    assert.equal(r.allows("x", "/private/a"), false);
    assert.equal(r.allows("x", "/private/ok"), true);
    assert.equal(r.allows("x", "/private/ok/more"), false);
  });
});

describe("score", () => {
  it("counts a rule once at its worst level", () => {
    const f = (rule: string, level: "error" | "warn" | "info") => ({ rule, level, where: "x", message: "" });
    const s = scoreOf([f("B-1", "warn"), f("B-1", "error"), f("B-1", "error"), f("C-6", "warn"), f("A-2", "info")]);
    assert.equal(s.score, 80);
    assert.equal(s.grade, "B");
    assert.deepEqual(s.counts, { error: 2, warn: 2, info: 1 });
  });
});

describe("pickPages", () => {
  it("samples every template before the second article", () => {
    const o = "https://x.test";
    const urls = ["/blog/a", "/blog/b", "/blog/c", "/cv", "/ru/blog/a", "/ru/cv"].map((p) => o + p);
    const picked = pickPages(`${o}/`, urls, 5);
    assert.deepEqual(picked, [`${o}/`, `${o}/blog/a`, `${o}/cv`, `${o}/ru/blog/a`, `${o}/ru/cv`]);
  });
  it("does not take the home page twice, with or without the slash", () => {
    const o = "https://x.test";
    assert.deepEqual(pickPages(`${o}/`, [o, `${o}/cv`, `${o}/cv/`], 5), [`${o}/`, `${o}/cv`]);
  });
});

describe("pickPages on sites with city copies", () => {
  it("takes each template once before the copies under other prefixes", () => {
    const o = "https://shop.test";
    const cities = ["abakan", "abinsk", "achinsk"];
    const leaves = ["9-may", "calendars/foldout", "photobooks/3d"];
    const urls = [...cities.flatMap((c) => leaves.map((l) => `${o}/${c}/${l}`)), `${o}/about`, `${o}/blog/post`];
    const picked = pickPages(`${o}/`, urls, 6);
    assert.deepEqual(picked, [`${o}/`, `${o}/abakan/9-may`, `${o}/abakan/calendars/foldout`, `${o}/abakan/photobooks/3d`, `${o}/about`, `${o}/blog/post`]);
  });

  it("fills the rest with copies when there is room", () => {
    const o = "https://shop.test";
    const picked = pickPages(`${o}/`, [`${o}/a/x`, `${o}/b/x`, `${o}/c/x`], 10);
    assert.deepEqual(picked, [`${o}/`, `${o}/a/x`, `${o}/b/x`, `${o}/c/x`]);
  });
});
