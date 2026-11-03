# ai-search-audit

**Can ChatGPT, Claude and Perplexity read, understand and cite your site?** One command checks what AI search actually sees: robots.txt for AI agents, text without JavaScript, authorship in JSON-LD, `llms.txt`, freshness, and content that answer engines treat as prompt injection.

```bash
npx ai-search-auditor https://example.com
```

No sign-up, no API keys, no dependencies. Node.js 22.18+.

The npm package is `ai-search-auditor`; once installed (`npm i -g ai-search-auditor`), the command is also available as `ai-search-audit`.

## Why this matters now

People increasingly get answers from ChatGPT, Claude, Perplexity and Google AI Overviews instead of a list of links. An answer engine reads a handful of pages, picks a few sources and cites them. The rest of the web does not exist for that answer.

Whether your site is among those sources depends on things classic SEO tools rarely look at: whether AI agents are let in, whether the text is there without JavaScript, whether the model can tell who the author is, whether the answer sits where it gets quoted. A site can rank well in Google and still be invisible, misread or skipped by AI search. Most of these problems are a few lines of code to fix, once you know they are there.

## Why another GEO checker

Most GEO / AI SEO checkers score a checklist: "is there an FAQ?", "are AI bots named in robots.txt?". They miss what breaks citations in practice and raise alarms that are not problems. This one reads the site the way a model does:

- **Reads like a model.** It looks at the HTML without JavaScript and at machine-readable output: headings that glue words together (`NameTagline`), invisible characters that split «AI-native» in a feed, an author in articles that points at no defined person, lines in `llms.txt` addressed to AI agents.
- **No false alarms.** A rule fires on a fact in the HTML or a server response, not on a guess. Heuristics are `info` and say "check by hand". Every rule is tested on a site where it must fire and on one where it must stay silent.
- **Explains the consequence.** Each finding says what AI search will not be able to do and how to fix it in code.
- **CI first.** Exit code, a GitHub Action and a report in the PR summary, so a fix does not regress.
- **Multilingual sites.** hreflang, `llms.txt` per language, `inLanguage`.

## What it checks

20 checks in seven groups.

**A. Access for AI agents**
- **A-1** AI search agents are allowed to read the site
- **A-2** Training crawlers are allowed or blocked the way you intend
- **A-3** The server answers AI agents the same way it answers a browser
- **A-4** Public pages are not marked as closed to indexing or AI
- **A-5** The news feed can be found from the pages

**B. Text without JavaScript**
- **B-1** The content is in the page itself, not only rendered by scripts
- **B-2** Titles, metadata, structured data, feeds and `llms.txt` are free of invisible characters that split words
- **B-3** Headings read as separate words, not glued together

**C. Entities and authorship**
- **C-1** The author or company is described as one clear entity with profiles
- **C-2** Articles are linked to that author
- **C-4** Articles carry complete markup: headline, dates, author, image, language
- **C-6** Every page has a link card: title, description, image
- **C-7** A visible FAQ is marked up as one

**D. Answer first**
- **D-2** Articles give the answer in the first two paragraphs

**E. Machine-readable versions**
- **E-1** `llms.txt` exists and follows the standard
- **E-2** Every link in `llms.txt` works and is a published page
- **E-3** Each language has its own `llms.txt`
- **E-5** `llms-full.txt` carries the full text

**F. Freshness**
- **F-1** The sitemap and the page agree on when it was last updated

**G. Content safety**
- **G-1** The content has no instructions addressed to AI

Gaps in the numbering are taken by the checks on the [roadmap](#roadmap).

Levels: `error` — AI search cannot read the page or reads it wrong; `warn` — lowers the chance of a citation; `info` — a recommendation.

The report lists the findings with fixes first, then ends with a checklist of every check by group: ✓ OK, ✖ error, ⚠ warning, ℹ note, – not checked. A check that cannot run on a site — articles on a site without articles, `llms.txt` links when there is no `llms.txt` — is marked «not checked» with the reason, never as passed.

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
| Score | **60/100 (D)** | **100/100 (A)** |
| C-1 Person without `@id` on home and CV | ✖ | ✓ |
| C-2 Articles do not point at the author by `@id` | ⚠ | ✓ |
| B-3 H1 reads as «Aleksandr BibikovI build…» | ⚠ | ✓ |
| B-2 Invisible U+2060 in RSS (32 + 56) | ⚠ | ✓ (kept in on-page typography, ℹ) |
| G-1 «A note for AI agents…» in `llms.txt` | ⚠ | ✓ |
| C-6 No og:image on home, CV, blog | ⚠ | ✓ |

Most fixes were a few lines: a stable `@id`, a `{" "}` between two spans, stripping word joiners from the feed, deleting one line from `llms.txt`. The link cards took one image generator at build time.

A score-based checker gave the same site 90/100 before the fixes and missed all five problems, while flagging an FAQ that does not exist.

## Roadmap

Each check ships with tests on a site where it must fire and one where it must stay silent.

### 0.2 — next

**L. Server logs** — a new command, `ai-search-auditor logs <access.log>`: what AI bots really do on your site, not what they could do
- **L-1** Which AI bots visit the site and which pages they read
- **L-2** How many of their requests end in errors, redirects or blocks
- **L-3** Important pages no AI bot has ever seen
- **L-4** Fake bots: an AI user agent coming from an address its operator does not use

**A. Access**
- **A-8** Every known AI bot — training, search and user-triggered — is allowed or blocked the way you intend
- **A-9** Opting out of Gemini training does not silently remove the site from Gemini answers
- **A-10** robots.txt, Content Signals, meta tags and `llms.txt` do not contradict each other
- **A-11** Bot protection does not show AI agents a challenge page or rate-limit them
- **A-12** Missing pages answer «not found», not a normal page that gets indexed and quoted

**D. Answer first**
- **D-6** Each section makes sense on its own, so it can be quoted without the rest of the page

**I. Ready for AI agents** — agents now fill in forms and place orders for people
- **I-1** Forms and buttons can be used by an agent acting for a person
- **I-2** Key actions — contact, sign-up, checkout — do not stop an agent at the first step
- **I-3** The site tells agents where its API or MCP server is, if it has one

### Later

**A. Access**
- **A-6** Paywalls, cookie walls and pop-ups do not hide the text from crawlers
- **A-7** Pages answer fast enough and stay within the size crawlers read
- **A-13** Redirect chains are short
- **A-14** AI agents are not blocked by country
- **A-15** Signed agent requests are accepted
- **A-16** The EU text-and-data-mining reservation is stated where you need it

**B. Text without JavaScript**
- **B-4** The page after scripts run says the same as the raw HTML
- **B-5** Images have alt text and captions; data is not locked inside pictures
- **B-6** The main text is not drowned in menus, footers and banners
- **B-7** Text behind tabs, accordions and «show more» is reachable
- **B-8** Content is not hidden in frames or drawn on a canvas
- **B-9** Linked PDFs and documents contain real text

**C. Entities and authorship**
- **C-3** The about or CV page is marked up as a profile
- **C-5** Blog and listing pages are marked up as collections of articles
- **C-8** The company has a logo and contacts; a local business has one consistent name, address and phone
- **C-9** Product pages carry price, availability and ratings
- **C-10** Author profiles linked from the site are alive and link back
- **C-11** Structured data says the same as the visible text: FAQ, prices, dates
- **C-12** The company is described the same way on every page and profile
- **C-13** The site has about and contact pages
- **C-14** The company or author is known to Wikidata
- **C-15** Authors have their own page with their experience

**D. Answer first**
- **D-1** The first paragraph contains the page's main query
- **D-3** The publication and update dates are visible and match the markup
- **D-4** Content is easy to quote: question headings, lists, comparison tables
- **D-5** Facts are citable: numbers come with sources and dates
- **D-7** The page defines its subject and states a short conclusion

**E. Machine-readable versions**
- **E-4** Pages are available as Markdown
- **E-6** New pages are announced to search engines as they appear (IndexNow; ChatGPT search relies on Bing)

**F. Freshness**
- **F-2** Feeds carry the full text and correct dates
- **F-3** No stale signals: last year in a title, an «updated» date long ago

**G. Content safety**
- **G-2** No hidden text stuffed with keywords
- **G-3** No instructions to AI hidden in image text, comments or invisible elements
- **G-4** AI bots get the same page as people

**H. Languages**
- **H-1** Language versions point at each other correctly and do not compete as duplicates

### Beyond the checks
- **Score per answer engine.** ChatGPT, Claude and Perplexity read raw HTML, Gemini and Apple run scripts: one site can be visible to some and invisible to others
- **Fact check.** Ask the models what they know about you and compare it with the site: «ChatGPT says you do not ship to Turkey, your site says you do»
- **Visibility monitor.** What ChatGPT, Claude and Perplexity answer to your queries, who they cite instead of you, and how it changes week to week
- **Site profiles:** blog, shop, SaaS, local business — each gets only the checks that matter for it
- **CI that reports only new problems,** with a file of accepted exceptions
- **SARIF output,** so findings show up in GitHub code scanning
- **Fixes for your stack:** ready snippets for Next.js, WordPress, Astro; a Claude Code skill and an MCP server that apply them
- **Online version** with no install at [albibikov.com/tools/ai-search-audit](https://albibikov.com/tools/ai-search-audit)
- **HTML report** to share with people who do not read Markdown
- **More report languages:** see below

Ideas are welcome in [issues](https://github.com/a-bibikov/ai-search-audit/issues); for pull requests see [CONTRIBUTING.md](CONTRIBUTING.md).

## Need the fixes, not just the report?

The audit shows what blocks AI search. If you want it fixed and measured — what ChatGPT, Claude and Perplexity answer about your niche today and 30 days later — see [AI search audit on albibikov.com](https://albibikov.com/tools/ai-search-audit).

## Languages

Reports come in English (`en`, default) and Russian (`ru`). A new language is one file in `src/i18n/` typed as `Messages`: TypeScript lists every missing string, and a test checks that no string is left untranslated. Pull requests welcome.

## License

MIT © [Aleksandr Bibikov](https://albibikov.com)
