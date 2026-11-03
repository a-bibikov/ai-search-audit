import { messages } from "./i18n/index.ts";
import type { Report } from "./index.ts";
import type { Group, Level } from "./types.ts";

const ICON: Record<Level, string> = { error: "✖", warn: "⚠", info: "ℹ" };
const ORDER: Record<Level, number> = { error: 0, warn: 1, info: 2 };
const MAX_PER_RULE = 8;

/** Markdown report for a terminal, a PR summary or a file, in the report's language. */
export function toMarkdown(r: Report): string {
  const t = messages(r.lang).report;
  const short = (where: string) => (where === "site" ? t.site : where.startsWith(r.site) ? where.slice(r.site.length) || "/" : where);
  const lines: string[] = [
    `# ${t.title(r.site)}`,
    "",
    t.summary({ score: r.score, grade: r.grade, errors: r.counts.error, warnings: r.counts.warn, notes: r.counts.info, pages: r.pages.length }),
    "",
  ];

  const byRule = new Map<string, Report["findings"]>();
  for (const f of r.findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);
  const failed = r.rules
    .filter((rule) => byRule.has(rule.id))
    .map((rule) => ({ rule, findings: byRule.get(rule.id)!, worst: byRule.get(rule.id)!.reduce<Level>((w, f) => (ORDER[f.level] < ORDER[w] ? f.level : w), "info") }))
    .sort((a, b) => ORDER[a.worst] - ORDER[b.worst] || a.rule.id.localeCompare(b.rule.id, "en", { numeric: true }));

  if (!failed.length) lines.push(t.clean, "");
  for (const { rule, findings, worst } of failed) {
    lines.push(`## ${ICON[worst]} ${rule.id} ${rule.title}`, "");
    for (const f of findings.slice(0, MAX_PER_RULE)) lines.push(`- ${f.level === worst ? "" : `${ICON[f.level]} `}\`${short(f.where)}\` — ${f.message}`);
    if (findings.length > MAX_PER_RULE) lines.push(`- ${t.more(findings.length - MAX_PER_RULE)}`);
    lines.push("", `**${worst === "info" ? t.recommendation : t.fix}:** ${rule.fix}`, "");
  }

  // Every audited check by group, as in the README: what is fine and what is not, at a glance.
  lines.push(`## ${t.checklist}`, "", t.legend, "");
  for (const g of Object.keys(t.groups) as Group[]) {
    const list = r.rules.filter((rule) => rule.group === g).sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
    if (!list.length) continue;
    lines.push(`**${g}. ${t.groups[g]}**`, "");
    for (const rule of list) {
      const found = byRule.get(rule.id) ?? [];
      const n = (level: Level) => found.filter((f) => f.level === level).length;
      const icon = found.length ? ICON[found.reduce<Level>((w, f) => (ORDER[f.level] < ORDER[w] ? f.level : w), "info")] : "✓";
      const count = found.length ? ` — ${t.count({ errors: n("error"), warnings: n("warn"), notes: n("info") })}` : "";
      lines.push(`- ${icon} ${rule.id} ${rule.title}${count}`);
    }
    lines.push("");
  }

  lines.push(
    "---",
    "",
    t.footer(r.pages.length, r.checkedAt.slice(0, 10)),
    "",
    "[ai-search-audit](https://github.com/a-bibikov/ai-search-audit)",
    "",
  );
  return lines.join("\n");
}
