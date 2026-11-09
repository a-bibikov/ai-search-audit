/** UPD-2: Feeds keep up with the site: every item has a date, carries the full text, and the newest article is in it. */
import type { Rule } from "../../types.ts";
import { articleNode, finder, isArticle, str } from "../util.ts";
import { dateOf, feedItems } from "./shared.ts";

/** An item shorter than this is a teaser, not the article. */
const FULL_TEXT = 100;
/** The newest article may take a little while to reach the feed of a cached site. */
const LAG_DAYS = 2;

export const upd2: Rule = {
  id: "UPD-2",
  group: "UPD",
  level: "warn",
  applies: (site, t) => (site.feeds.some((f) => f.status === 200 && feedItems(f.body).length) ? null : t.skipNoFeed),
  run(site, _config, t) {
    const { out, add } = finder(this);
    const newest = site.pages
      .filter(isArticle)
      .map((p) => ({ url: p.fetched.publicUrl, date: dateOf(str(articleNode(p)!.datePublished)) }))
      .filter((a): a is { url: string; date: Date } => a.date !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    for (const feed of site.feeds) {
      const items = feed.status === 200 ? feedItems(feed.body) : [];
      if (!items.length) continue;
      const undated = items.filter((i) => !i.date).length;
      if (undated) add(feed.publicUrl, t.feedNoDates(undated, items.length));
      const short = items.filter((i) => i.words < FULL_TEXT).length;
      if (short > items.length / 2) add(feed.publicUrl, t.feedSummaries(short, items.length), "info");
      const latest = Math.max(...items.map((i) => i.date?.getTime() ?? 0));
      const path = (u: string) => u.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "");
      if (newest && latest && newest.date.getTime() - latest > LAG_DAYS * 86_400_000 && !items.some((i) => path(i.link) === path(newest.url)))
        add(feed.publicUrl, t.feedBehind(newest.url, new Date(latest).toISOString().slice(0, 10)));
    }
    return out;
  },
};
