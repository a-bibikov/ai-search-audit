import type { Report } from "./index.ts";
import type { Level } from "./types.ts";

const ICON: Record<Level, string> = { error: "✖", warn: "⚠", info: "ℹ" };
const ORDER: Record<Level, number> = { error: 0, warn: 1, info: 2 };
const MAX_PER_RULE = 8;

const GROUPS: Record<string, string> = {
  A: "Access for AI agents",
  B: "Text without JavaScript",
  C: "Entities and authorship",
  D: "Answer first",
  E: "Machine-readable versions",
  F: "Freshness",
  G: "Content safety",
};

/** Markdown report for a terminal, a PR summary or a file. */
export function toMarkdown(r: Report): string {
  const short = (where: string) => (where === "site" ? "site" : where.startsWith(r.site) ? where.slice(r.site.length) || "/" : where);
  const lines: string[] = [
    `# AI search audit: ${r.site}`,
    "",
    `**${r.score}/100 (${r.grade})** · ${r.counts.error} errors · ${r.counts.warn} warnings · ${r.counts.info} notes · ${r.pages.length} pages`,
    "",
  ];

  const byRule = new Map<string, Report["findings"]>();
  for (const f of r.findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);
  const failed = r.rules
    .filter((rule) => byRule.has(rule.id))
    .map((rule) => ({ rule, findings: byRule.get(rule.id)!, worst: byRule.get(rule.id)!.reduce<Level>((w, f) => (ORDER[f.level] < ORDER[w] ? f.level : w), "info") }))
    .sort((a, b) => ORDER[a.worst] - ORDER[b.worst] || a.rule.id.localeCompare(b.rule.id, "en", { numeric: true }));

  if (!failed.length) lines.push("Nothing to fix: AI search can read, understand and cite these pages.", "");
  for (const { rule, findings, worst } of failed) {
    lines.push(`## ${ICON[worst]} ${rule.id} ${rule.title}`, "");
    for (const f of findings.slice(0, MAX_PER_RULE)) lines.push(`- ${f.level === worst ? "" : `${ICON[f.level]} `}\`${short(f.where)}\` — ${f.message}`);
    if (findings.length > MAX_PER_RULE) lines.push(`- …and ${findings.length - MAX_PER_RULE} more`);
    lines.push("", `**Fix:** ${rule.fix}`, "");
  }

  const passed = r.rules.filter((rule) => !byRule.has(rule.id));
  if (passed.length) {
    lines.push("## ✓ Passed", "");
    for (const g of Object.keys(GROUPS)) {
      const list = passed.filter((p) => p.group === g);
      if (list.length) lines.push(`- **${GROUPS[g]}:** ${list.map((p) => `${p.id} ${p.title}`).join("; ")}`);
    }
    lines.push("");
  }

  lines.push(
    "---",
    "",
    `Checked ${r.pages.length} pages on ${r.checkedAt.slice(0, 10)}. Also check by hand after each deploy: the live CDN and bot protection with real AI agents (A-3), Google Search Console, Bing Webmaster Tools (ChatGPT search uses Bing), Yandex Webmaster.`,
    "",
    "[ai-search-audit](https://github.com/a-bibikov/ai-search-audit)",
    "",
  );
  return lines.join("\n");
}
