# Changelog

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
