# Changelog

## 0.1.0 — 2026-11-03

First release, published to npm as `ai-search-auditor` (commands `ai-search-auditor` and `ai-search-audit`).

- CLI `ai-search-audit <url>`: checks whether ChatGPT, Claude, Perplexity and other answer engines can read, understand and cite a site.
- 18 rules in seven groups: access for AI agents (A), text without JavaScript (B), entities and authorship (C), answer first (D), machine-readable versions such as `llms.txt` (E), freshness (F), content safety (G).
- Score 0–100 with a grade; a rule counts once, not per page.
- Local builds with `--base`, page sampling across templates with `--max-pages`, CI exit codes with `--fail-on`.
- `llms-txt` subcommand: checks only `llms.txt` and `llms-full.txt`.
- Reports in English (default) and Russian: `--lang en|ru`.
- Markdown and JSON reports; job summary in GitHub Actions.
- GitHub Action `a-bibikov/ai-search-audit@v0`.
- No runtime dependencies; Node.js 22.18+.
