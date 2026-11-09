/** Helpers shared by the F checks. */
import { countWords, decode, textContent } from "auditor-engine";

export const datePart = (s: string) => s.slice(0, 10);

/** A date a feed or markup gives, or null when it is missing or not a date. */
export const dateOf = (s: string | undefined) => {
  if (!s) return null;
  const d = new Date(s.trim());
  return Number.isNaN(d.getTime()) ? null : d;
};

const tag = (xml: string, names: string[]) => {
  for (const n of names) {
    const m = xml.match(new RegExp(`<${n}\\b[^>]*>([\\s\\S]*?)</${n}>`, "i"));
    if (m) return m[1]!.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");
  }
  return undefined;
};

/** Items of an RSS or Atom feed: their link, date and how many words of text they carry. */
export const feedItems = (xml: string) =>
  [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => {
    const body = m[2]!;
    const link = tag(body, ["link"])?.trim() || body.match(/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    const text = tag(body, ["content:encoded", "content"]) ?? tag(body, ["description", "summary"]) ?? "";
    return { link: decode(link), date: dateOf(tag(body, ["pubDate", "published", "updated", "dc:date"])), words: countWords(textContent(decode(text))) };
  });
