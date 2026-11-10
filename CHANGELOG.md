# Changelog

From the next release on, the changes of every version are in [GitHub Releases](https://github.com/a-bibikov/ai-search-audit/releases).

## [0.6.0](https://github.com/a-bibikov/ai-search-audit/compare/v0.5.0...v0.6.0) (2026-11-09)


### ⚠ BREAKING CHANGES

* 56 GEO checks in groups with three-letter codes ([#24](https://github.com/a-bibikov/ai-search-audit/issues/24))

### New checks and features

* 56 GEO checks in groups with three-letter codes ([#24](https://github.com/a-bibikov/ai-search-audit/issues/24)) ([76ab4ca](https://github.com/a-bibikov/ai-search-audit/commit/76ab4caf7699c2e92222fd9fcd8ad4dd84ef7e1b))

## [0.5.0](https://github.com/a-bibikov/ai-search-audit/compare/v0.4.0...v0.5.0) (2026-11-09)


### ⚠ BREAKING CHANGES

* --seo is removed, classic SEO checks live in search-auditor
* the crawl, scoring and report come from auditor-engine and are no longer exported here
* check AI search only, on auditor-engine

### New checks and features

* --seo is removed, classic SEO checks live in search-auditor ([ed55de1](https://github.com/a-bibikov/ai-search-audit/commit/ed55de1f829ccd08da0729605a8d6d9756000d82))
* check AI search only, on auditor-engine ([ed55de1](https://github.com/a-bibikov/ai-search-audit/commit/ed55de1f829ccd08da0729605a8d6d9756000d82))
* JSON findings carry the check title, why it is a problem and how to fix it ([ed55de1](https://github.com/a-bibikov/ai-search-audit/commit/ed55de1f829ccd08da0729605a8d6d9756000d82))
* report with a table per group, one recommendations table and --width for the terminal ([ed55de1](https://github.com/a-bibikov/ai-search-audit/commit/ed55de1f829ccd08da0729605a8d6d9756000d82))
* the crawl, scoring and report come from auditor-engine and are no longer exported here ([ed55de1](https://github.com/a-bibikov/ai-search-audit/commit/ed55de1f829ccd08da0729605a8d6d9756000d82))

## [0.4.0](https://github.com/a-bibikov/ai-search-audit/compare/v0.3.0...v0.4.0) (2026-11-04)


### New checks and features

* --seo runs the classic SEO checks of search-auditor in the same crawl ([#18](https://github.com/a-bibikov/ai-search-audit/issues/18)) ([8f6ed94](https://github.com/a-bibikov/ai-search-audit/commit/8f6ed949f37064d25be60971895c540115cceeed))

## [0.3.0](https://github.com/a-bibikov/ai-search-audit/compare/v0.2.0...v0.3.0) (2026-11-04)


### New checks and features

* open the engine for other rule sets, add --pages n|all ([#15](https://github.com/a-bibikov/ai-search-audit/issues/15)) ([#16](https://github.com/a-bibikov/ai-search-audit/issues/16)) ([4be3229](https://github.com/a-bibikov/ai-search-audit/commit/4be3229c4338fc932cd9e8f5b9a8e0a287e707d1))

## [0.2.0](https://github.com/a-bibikov/ai-search-audit/compare/v0.2.0...v0.2.0) (2026-11-03)


### New checks and features

* checklist by section at the end of the report ([c43423c](https://github.com/a-bibikov/ai-search-audit/commit/c43423c6f1c522de056552980c39db7cb411b082))
* what to do first, coverage in the summary, weight by scale, llms.txt is optional ([f9e6ffb](https://github.com/a-bibikov/ai-search-audit/commit/f9e6ffb74b51c96b2e9639b4f580dbabe7809512))


### Fixes

* checks that cannot run are marked not checked, not passed ([e01eec5](https://github.com/a-bibikov/ai-search-audit/commit/e01eec5674c5f313ffa7b957af6c3520b86e840c))
* checks that cannot run are marked not checked, not passed ([9281b96](https://github.com/a-bibikov/ai-search-audit/commit/9281b96ad2c6dee10d4a756b11e825fe858fc563))
* CLI help names the npm package, --version flag ([31887fa](https://github.com/a-bibikov/ai-search-audit/commit/31887fada369eb41024f119b79359e5a98c03126))


### Documentation

* what the audit checks, roadmap, release process ([365965a](https://github.com/a-bibikov/ai-search-audit/commit/365965a7f2f0842a4dba13a0d1b8f1dfa8a8404b))


### Internal

* release 0.1.4 ([2c8056d](https://github.com/a-bibikov/ai-search-audit/commit/2c8056d386588262362e66c5fce78726df9127d8))

## [0.2.0](https://github.com/a-bibikov/ai-search-audit/compare/v0.1.5...v0.2.0) (2026-11-03)


### New checks and features

* what to do first, coverage in the summary, weight by scale, llms.txt is optional ([f9e6ffb](https://github.com/a-bibikov/ai-search-audit/commit/f9e6ffb74b51c96b2e9639b4f580dbabe7809512))

## [0.1.5](https://github.com/a-bibikov/ai-search-audit/compare/v0.1.4...v0.1.5) (2026-11-03)


### Fixes

* checks that cannot run are marked not checked, not passed ([e01eec5](https://github.com/a-bibikov/ai-search-audit/commit/e01eec5674c5f313ffa7b957af6c3520b86e840c))
* checks that cannot run are marked not checked, not passed ([9281b96](https://github.com/a-bibikov/ai-search-audit/commit/9281b96ad2c6dee10d4a756b11e825fe858fc563))

## [0.1.4](https://github.com/a-bibikov/ai-search-audit/compare/v0.1.3...v0.1.4) (2026-11-03)


### Internal

* release 0.1.4 ([2c8056d](https://github.com/a-bibikov/ai-search-audit/commit/2c8056d386588262362e66c5fce78726df9127d8))

## [0.1.3](https://github.com/a-bibikov/ai-search-audit/compare/v0.1.2...v0.1.3) (2026-11-03)


### Fixes

* CLI help names the npm package, --version flag ([31887fa](https://github.com/a-bibikov/ai-search-audit/commit/31887fada369eb41024f119b79359e5a98c03126))

## [0.1.2](https://github.com/a-bibikov/ai-search-audit/compare/v0.1.1...v0.1.2) (2026-11-03)


### New checks and features

* checklist by section at the end of the report ([c43423c](https://github.com/a-bibikov/ai-search-audit/commit/c43423c6f1c522de056552980c39db7cb411b082))

## [0.1.1](https://github.com/a-bibikov/ai-search-audit/compare/v0.1.0...v0.1.1) (2026-11-03)


### Documentation

* what the audit checks, roadmap, release process ([365965a](https://github.com/a-bibikov/ai-search-audit/commit/365965a7f2f0842a4dba13a0d1b8f1dfa8a8404b))

## 0.1.0 — 2026-11-03

First release, published to npm as `ai-search-auditor` (commands `ai-search-auditor` and `ai-search-audit`).

- CLI `ai-search-audit <url>`: checks whether ChatGPT, Claude, Perplexity and other answer engines can read, understand and cite a site.
- 20 checks in seven groups: access for AI agents (A), text without JavaScript (B), entities and authorship (C), answer first (D), machine-readable versions such as `llms.txt` (E), freshness (F), content safety (G).
- Score 0–100 with a grade; a rule counts once, not per page.
- Local builds with `--base`, page sampling across templates with `--max-pages`, CI exit codes with `--fail-on`.
- `llms-txt` subcommand: checks only `llms.txt` and `llms-full.txt`.
- Reports in English (default) and Russian: `--lang en|ru`.
- Markdown and JSON reports; job summary in GitHub Actions.
- GitHub Action `a-bibikov/ai-search-audit@v0`.
- No runtime dependencies; Node.js 22.18+.
