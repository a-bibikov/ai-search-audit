/** ANS-3: The publication date is visible on the page and matches the markup. */
import type { Rule } from "../../types.ts";
import { articleNode, finder, isArticle, str } from "../util.ts";

const MONTHS_EN = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTHS_RU = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

/** The ways a date is written on a page: 2026-10-01, 01.10.2026, 1 October 2026, Oct 1, 2026, 1 октября 2026. */
const shownAs = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const en = MONTHS_EN[m - 1]!;
  return [iso, `${dd}.${mm}.${y}`, `${d}.${mm}.${y}`, `${d} ${en} ${y}`, `${en} ${d}, ${y}`, `${en.slice(0, 3)} ${d}, ${y}`, `${d} ${en.slice(0, 3)} ${y}`, `${d} ${MONTHS_RU[m - 1]} ${y}`];
};

export const ans3: Rule = {
  id: "ANS-3",
  group: "ANS",
  level: "warn",
  applies: (site, t) => (site.pages.some(isArticle) ? null : t.skipNoArticles),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const page of site.pages) {
      const art = articleNode(page);
      const published = str(art?.datePublished).slice(0, 10);
      if (!art || !/^\d{4}-\d{2}-\d{2}$/.test(published)) continue;
      const modified = str(art.dateModified).slice(0, 10);
      const times = [...page.fetched.body.matchAll(/<time\b[^>]*\bdatetime\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]!.slice(0, 10));
      const text = page.text.toLowerCase().replace(/\s+/g, " ");
      const visible = times.includes(published) || shownAs(published).some((s) => text.includes(s));
      if (times.length && !times.some((d) => d === published || d === modified)) add(page.fetched.publicUrl, t.dateMismatch(times[0]!, published));
      else if (!visible) add(page.fetched.publicUrl, t.dateHidden(published));
    }
    return out;
  },
};
