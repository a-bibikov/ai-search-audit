#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { DEFAULT_LANG, LANGS, audit, isLang, parsePages, rules, toJSON, toMarkdown, type Config, type Report } from "./index.ts";

// package.json sits one level up both from src/cli.ts (development) and dist/cli.js (published package).
const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version: string };

const HELP = `ai-search-auditor ${version} — can ChatGPT, Claude and Perplexity read, understand and cite your site?

Usage:
  ai-search-auditor <url> [options]
  ai-search-auditor llms-txt <url>      check only llms.txt and llms-full.txt

  npm package: ai-search-auditor (npx ai-search-auditor, npm i -g ai-search-auditor).
  After install the command also works as ai-search-audit.

Options:
  --base <url>        public origin when auditing a local build (links in sitemap point there)
  --pages <n|all>     pages to audit: a number sampled across templates (default 20), or all pages in the sitemap
  --fail-on <level>   exit 1 on: error (default), warn, never
  --lang <lang>       report language: ${Object.keys(LANGS).join(", ")} (default ${DEFAULT_LANG})
  --width <n>         fit tables into n characters (default: the terminal width; 0 — no wrapping)
  --json              print the JSON report instead of Markdown
  --out <file>        also write the report to a file (.json or .md)
  --config <file>     config file (default: ai-search-audit.config.json if present)
  -v, --version       print the version
  -h, --help

Examples:
  npx ai-search-auditor https://example.com
  npx ai-search-auditor http://127.0.0.1:3000 --base https://example.com --fail-on warn
  npx ai-search-auditor https://example.com --lang ru --pages all

Classic SEO checks: npx search-auditor <url>
`;

// --seo ran the checks of search-auditor in this report; they now live only there, with a report of their own.
if (process.argv.includes("--seo")) {
  process.stderr.write("ai-search-auditor: --seo is gone: classic SEO checks run with their own report, npx search-auditor <url>\n");
  process.exit(2);
}

// An unknown or malformed flag gets one line with the help hint, not a stack trace.
let parsed;
try {
  parsed = parseArgs({
  allowPositionals: true,
  options: {
    base: { type: "string" },
    pages: { type: "string" },
    // The old name of --pages, kept so existing scripts and workflows keep working.
    "max-pages": { type: "string" },
    "fail-on": { type: "string", default: "error" },
    lang: { type: "string" },
    json: { type: "boolean", default: false },
    width: { type: "string" },
    out: { type: "string" },
    config: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
    version: { type: "boolean", short: "v", default: false },
  },
});
} catch (e) {
  process.stderr.write(`ai-search-audit: ${(e as Error).message.split(". To specify")[0]}\nRun with --help to see the options.\n`);
  process.exit(2);
}
const { values, positionals } = parsed;

if (values.version) {
  process.stdout.write(`${version}\n`);
  process.exit(0);
}

const llmsOnly = positionals[0] === "llms-txt";
const target = llmsOnly ? positionals[1] : positionals[0];
if (values.help || !target) {
  process.stdout.write(HELP);
  process.exit(values.help ? 0 : 2);
}

// A function declaration, not an arrow: TypeScript treats only declared `never` functions as the end of a branch.
function fail(message: string): never {
  process.stderr.write(`ai-search-audit: ${message}\n`);
  process.exit(2);
}

const url = /^https?:\/\//.test(target) ? target : `https://${target}`;
const configPath = values.config ?? (existsSync("ai-search-audit.config.json") ? "ai-search-audit.config.json" : undefined);
const fileConfig: Partial<Config> = configPath ? JSON.parse(readFileSync(configPath, "utf8")) : {};
// --lang wins over the config file; an unknown language stops before any request is made.
const lang = values.lang ?? fileConfig.lang ?? DEFAULT_LANG;
if (!isLang(lang)) fail(`unknown language «${lang}», use one of: ${Object.keys(LANGS).join(", ")}`);
const pagesFlag = values.pages ?? values["max-pages"];
const pagesRaw = pagesFlag ?? fileConfig.maxPages;
const maxPages = pagesRaw === undefined ? undefined : parsePages(pagesRaw);
if (maxPages === null) fail(`${pagesFlag !== undefined ? "--pages" : "maxPages in the config"} must be a whole number above 0 or «all», got «${pagesRaw}»`);
const config: Partial<Config> = {
  ...fileConfig,
  lang: lang as Config["lang"],
  ...(maxPages ? { maxPages } : {}),
  ...(llmsOnly ? { maxPages: 3, disable: rules.map((r) => r.id).filter((id) => !id.startsWith("E-") && id !== "G-1") } : {}),
};

const log = (line: string) => process.stderr.write(`· ${line}\n`);
let report: Report;
try {
  report = await audit(url, { base: values.base, config, log });
} catch (e) {
  fail((e as Error).message);
}
const markdown = toMarkdown(report);
// In a terminal, tables fit the window and long cells wrap; a file and a CI summary keep plain Markdown.
if (values.width !== undefined && !/^\d+$/.test(values.width)) fail(`--width must be a whole number, got «${values.width}»`);
const columns = values.width !== undefined ? Number(values.width) : process.stdout.isTTY ? process.stdout.columns : 0;
const screen = columns > 0 ? toMarkdown(report, { width: columns }) : markdown;

const json = JSON.stringify(toJSON(report), null, 2) + "\n";
process.stdout.write(values.json ? json : screen);
if (values.out) writeFileSync(values.out, values.out.endsWith(".json") ? json : markdown);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);

const failOn = values["fail-on"];
const failed = failOn === "never" ? false : failOn === "warn" ? report.counts.error + report.counts.warn > 0 : report.counts.error > 0;
process.exit(failed ? 1 : 0);
