# ai-search-audit

**Can ChatGPT, Claude and Perplexity read, understand and cite your site?** One command checks what AI search actually sees: robots.txt for AI agents, text without JavaScript, authorship in JSON-LD, `llms.txt`, freshness, and content that answer engines treat as prompt injection.

```bash
npx ai-search-auditor https://example.com
```

No sign-up, no API keys, no dependencies. Node.js 22.18+.

The npm package is `ai-search-auditor`; once installed (`npm i -g ai-search-auditor`), the command is also available as `ai-search-audit`.

## Why another GEO checker

Most GEO / AI SEO checkers score a checklist: "is there an FAQ?", "are AI bots named in robots.txt?". They miss what breaks citations in practice and raise alarms that are not problems. This one reads the site the way a model does:

- **Reads like a model.** It looks at the HTML without JavaScript and at machine-readable output: headings that glue words together (`NameTagline`), invisible characters that split «AI-native» in a feed, an author in articles that points at no defined person, lines in `llms.txt` addressed to AI agents.
- **No false alarms.** A rule fires on a fact in the HTML or a server response, not on a guess. Heuristics are `info` and say "check by hand". Every rule is tested on a site where it must fire and on one where it must stay silent.
- **Explains the consequence.** Each finding says what AI search will not be able to do and how to fix it in code.
- **CI first.** Exit code, a GitHub Action and a report in the PR summary, so a fix does not regress.
- **Multilingual sites.** hreflang, `llms.txt` per language, `inLanguage`.

## What it checks

| Group | Rules |
|---|---|
| **A. Access** | A-1 search agents (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot, Googlebot, Bingbot…) are allowed in robots.txt · A-2 training crawlers follow your policy · A-3 the server answers AI agents like a browser (no 403, no challenge) · A-4 no `noindex` / `noai` · A-5 the feed is declared in `<head>` |
| **B. Text without JS** | B-1 the text is in the HTML · B-2 no invisible characters in title, meta, JSON-LD, feeds, `llms.txt` · B-3 headings do not glue words together |
| **C. Entities** | C-1 Person or Organization with `@id`, `sameAs`, `jobTitle` · C-2 articles point at the author by `@id` · C-4 complete Article / BlogPosting · C-6 og:title, og:description, og:image · C-7 a visible FAQ is marked up |
| **D. Answer first** | D-2 articles answer in the first two paragraphs |
| **E. Machine-readable** | E-1 `llms.txt` follows llmstxt.org · E-2 its links work and match the sitemap · E-3 `llms.txt` per language · E-5 `llms-full.txt` carries the full text |
| **F. Freshness** | F-1 sitemap `lastmod` matches `dateModified` |
| **G. Content safety** | G-1 no instructions addressed to AI in the content |

Levels: `error` — AI search cannot read the page or reads it wrong; `warn` — lowers the chance of a citation; `info` — a recommendation.

**Score:** 100 minus 15 per rule with an error and 5 per rule with a warning. A rule counts once, not per page, so one template bug does not sink a large site. A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, F below.

## Usage

```bash
# A live site
npx ai-search-auditor https://example.com

# A local build: requests go to localhost, the report shows public URLs
npx ai-search-auditor http://127.0.0.1:3000 --base https://example.com

# Only llms.txt and llms-full.txt
npx ai-search-auditor llms-txt https://example.com

# Report in Russian (English is the default)
npx ai-search-auditor https://example.com --lang ru

# JSON for scripts and agents
npx ai-search-auditor https://example.com --json --out report.json
```

| Option | |
|---|---|
| `--base <url>` | Public origin when auditing a local build |
| `--max-pages <n>` | Pages to audit, sampled across templates (default 20) |
| `--fail-on <level>` | Exit 1 on `error` (default), `warn` or `never` |
| `--lang <lang>` | Report language: `en` (default), `ru` |
| `--json` | JSON instead of Markdown |
| `--out <file>` | Also write the report to a file |
| `--config <file>` | Config file (default `ai-search-audit.config.json`) |

Config:

```json
{
  "trainingBots": "any",
  "disable": ["C-7"],
  "maxPages": 20,
  "lang": "en"
}
```

`trainingBots`: `allow`, `block` or `any` — whether GPTBot, ClaudeBot, CCBot and others may collect data for training. Blocking them does not remove you from AI search; blocking search agents does.

## GitHub Action

```yaml
- run: npm run build && (npm start &) && npx wait-on http://127.0.0.1:3000
- uses: a-bibikov/ai-search-audit@v0
  with:
    url: http://127.0.0.1:3000
    base: https://example.com
    fail-on: error
    lang: en
```

The report goes to the job summary.

## Example

[albibikov.com](https://albibikov.com), a Next.js site in English and Russian, before and after one round of fixes (20 pages, local production build):

| | Before | After |
|---|---|---|
| Score | **60/100 (D)** | **95/100 (A)** |
| C-1 Person without `@id` on home and CV | ✖ | ✓ |
| C-2 Articles do not point at the author by `@id` | ⚠ | ✓ |
| B-3 H1 reads as «Aleksandr BibikovI build…» | ⚠ | ✓ |
| B-2 Invisible U+2060 in RSS (32 + 56) | ⚠ | ✓ (kept in on-page typography, ℹ) |
| G-1 «A note for AI agents…» in `llms.txt` | ⚠ | ✓ |
| C-6 No og:image on home, CV, blog | ⚠ | ⚠ |

Each fix was a few lines: a stable `@id`, a `{" "}` between two spans, stripping word joiners from the feed, deleting one line from `llms.txt`.

A score-based checker gave the same site 90/100 before the fixes and missed all five problems, while flagging an FAQ that does not exist.

## Need the fixes, not just the report?

The audit shows what blocks AI search. If you want it fixed and measured — what ChatGPT, Claude and Perplexity answer about your niche today and 30 days later — see [AI search audit on albibikov.com](https://albibikov.com/tools/ai-search-audit).

## Languages

Reports come in English (`en`, default) and Russian (`ru`). A new language is one file in `src/i18n/` typed as `Messages`: TypeScript lists every missing string, and a test checks that no string is left untranslated. Pull requests welcome.

## License

MIT © [Aleksandr Bibikov](https://albibikov.com)
