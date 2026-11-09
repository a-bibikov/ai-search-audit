/** LLM-7: llms.txt keeps up with the site: the newest articles are in it. */
import type { Rule } from "../../types.ts";
import { articleNode, finder, isArticle, markdownLinks, str } from "../util.ts";
import { llmsSkip } from "./shared.ts";

const NEWEST = 3;

export const llm7: Rule = {
  id: "LLM-7",
  group: "LLM",
  level: "info",
  applies: (site, t) => llmsSkip(site, t) ?? (site.pages.some(isArticle) ? null : t.skipNoArticles),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const links = markdownLinks(site.llms!.body);
    const norm = (u: string) => {
      try {
        return new URL(u, site.base).pathname.replace(/\/$/, "");
      } catch {
        return u;
      }
    };
    // Articles under a prefix with its own llms.txt (/ru/llms.txt) belong to that file, not to this one.
    const otherFiles = links.filter((h) => /llms(-full)?\.txt$/.test(h)).map((h) => norm(h).replace(/\/llms(-full)?\.txt$/, "/"));
    const listed = new Set(links.map(norm));
    const newest = site.pages
      .filter((p) => isArticle(p) && !otherFiles.some((prefix) => prefix !== "/" && norm(p.fetched.publicUrl).startsWith(prefix)))
      .map((p) => ({ url: p.fetched.publicUrl, date: str(articleNode(p)!.datePublished) }))
      .filter((a) => a.date)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, NEWEST);
    const missing = newest.filter((a) => !listed.has(norm(a.url)));
    if (missing.length) add(site.llms!.publicUrl, t.llmsStale(missing.length, newest.length, missing[0]!.url));
    return out;
  },
};
