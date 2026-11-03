#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { audit, rules, toMarkdown, type Config } from "./index.ts";

const HELP = `ai-search-audit — can ChatGPT, Claude and Perplexity read, understand and cite your site?

Usage:
  ai-search-audit <url> [options]
  ai-search-audit llms-txt <url>        check only llms.txt and llms-full.txt

Options:
  --base <url>        public origin when auditing a local build (links in sitemap point there)
  --max-pages <n>     pages to audit, sampled across templates (default 20)
  --fail-on <level>   exit 1 on: error (default), warn, never
  --json              print the JSON report instead of Markdown
  --out <file>        also write the report to a file (.json or .md)
  --config <file>     config file (default: ai-search-audit.config.json if present)
  -h, --help

Examples:
  npx ai-search-audit https://example.com
  npx ai-search-audit http://127.0.0.1:3000 --base https://example.com --fail-on warn
`;

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    base: { type: "string" },
    "max-pages": { type: "string" },
    "fail-on": { type: "string", default: "error" },
    json: { type: "boolean", default: false },
    out: { type: "string" },
    config: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});

const llmsOnly = positionals[0] === "llms-txt";
const target = llmsOnly ? positionals[1] : positionals[0];
if (values.help || !target) {
  process.stdout.write(HELP);
  process.exit(values.help ? 0 : 2);
}

const url = /^https?:\/\//.test(target) ? target : `https://${target}`;
const configPath = values.config ?? (existsSync("ai-search-audit.config.json") ? "ai-search-audit.config.json" : undefined);
const fileConfig: Partial<Config> = configPath ? JSON.parse(readFileSync(configPath, "utf8")) : {};
const config: Partial<Config> = {
  ...fileConfig,
  ...(values["max-pages"] ? { maxPages: Number(values["max-pages"]) } : {}),
  ...(llmsOnly ? { maxPages: 3, disable: rules.map((r) => r.id).filter((id) => !id.startsWith("E-") && id !== "G-1") } : {}),
};

const log = (line: string) => process.stderr.write(`· ${line}\n`);
let report: Awaited<ReturnType<typeof audit>>;
try {
  report = await audit(url, { base: values.base, config, log });
} catch (e) {
  process.stderr.write(`ai-search-audit: ${(e as Error).message}\n`);
  process.exit(2);
}
const markdown = toMarkdown(report);

process.stdout.write(values.json ? JSON.stringify(report, null, 2) + "\n" : markdown);
if (values.out) writeFileSync(values.out, values.out.endsWith(".json") ? JSON.stringify(report, null, 2) : markdown);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);

const failOn = values["fail-on"];
const failed = failOn === "never" ? false : failOn === "warn" ? report.counts.error + report.counts.warn > 0 : report.counts.error > 0;
process.exit(failed ? 1 : 0);
