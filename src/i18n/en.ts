/**
 * English report text: the reference for every other language. A new language is a file that satisfies the
 * `Messages` type below (TypeScript lists what is missing) plus one line in ./index.ts.
 */
export const en = {
  report: {
    title: (site: string) => `AI search audit: ${site}`,
    summary: (o: { score: number; grade: string; checked: number; total: number; errors: number; warnings: number; notes: number; pages: number }) =>
      `**${o.score}/100 (${o.grade})** · ${o.checked} of ${o.total} checks run · ${o.errors} errors · ${o.warnings} warnings · ${o.notes} notes · ${o.pages} pages`,
    capped: (checked: number, total: number) => `Grade capped at B: only ${checked} of ${total} checks could run on this site.`,
    priorities: "What to do first",
    /** One part of a combined report, under the summary. */
    section: (o: { name: string; score: number; grade: string; checked: number; total: number }) =>
      `- **${o.name}:** ${o.score}/100 (${o.grade}) · ${o.checked} of ${o.total} checks run`,
    /** Scale of a problem in the priorities: «on 12 of 20 pages». */
    scale: (n: number, total: number) => `on ${n} of ${total} pages`,
    clean: "Nothing to fix: AI search can read, understand and cite these pages.",
    fix: "Fix",
    /** Label instead of «Fix» when a rule has only notes: nothing is broken, it is advice. */
    recommendation: "Recommendation",
    more: (n: number) => `…and ${n} more`,
    checklist: "Checklist",
    legend: "✓ OK · ✖ error · ⚠ warning · ℹ note · – not checked",
    notChecked: "not checked",
    /** Findings of one rule in the checklist: «2 errors, 1 warning». */
    count: (o: { errors: number; warnings: number; notes: number }) =>
      [
        o.errors && `${o.errors} ${o.errors === 1 ? "error" : "errors"}`,
        o.warnings && `${o.warnings} ${o.warnings === 1 ? "warning" : "warnings"}`,
        o.notes && `${o.notes} ${o.notes === 1 ? "note" : "notes"}`,
      ]
        .filter(Boolean)
        .join(", "),
    site: "site",
    footer: (pages: number, date: string) =>
      `Checked ${pages} pages on ${date}. Also check by hand after each deploy: the live CDN and bot protection with real AI agents (A-3), Google Search Console, Bing Webmaster Tools (ChatGPT search uses Bing), Yandex Webmaster.`,
    groups: {
      A: "Access for AI agents",
      B: "Text without JavaScript",
      C: "Entities and authorship",
      D: "Answer first",
      E: "Machine-readable versions",
      F: "Freshness",
      G: "Content safety",
    },
  },

  rules: {
    "A-1": {
      title: "robots.txt lets AI search agents in",
      fix: "Remove the Disallow for these agents (or add `Allow: /` in their group). They fetch pages to answer questions and cite them; training crawlers are a separate choice (A-2).",
      impact: "AI search is not allowed to read the site, so it cannot cite it.",
    },
    "A-2": {
      title: "Training crawlers follow your policy",
      fix: "Decide whether future models may learn from the site and state it in robots.txt with a group per crawler. Blocking them does not remove you from AI search (A-1).",
      impact: "Whether future models may learn from the site is not decided.",
    },
    "A-3": {
      title: "The server answers AI agents like a browser",
      fix: "Check the CDN, WAF or bot protection: these agents get an error, a challenge or a different page. Allow them by user agent or verified IP ranges.",
      impact: "AI agents get an error or a check page instead of your content.",
    },
    "A-4": {
      title: "No noindex or noai on public pages",
      fix: 'Remove `noindex`, `none`, `noai` from `<meta name="robots">` and the `X-Robots-Tag` header on pages that should be cited (keep them on previews and staging).',
      impact: "Pages are marked as closed, so AI search skips them.",
    },
    "A-5": {
      title: "The feed is declared in <head>",
      fix: 'Add `<link rel="alternate" type="application/rss+xml" href="…">` to pages so crawlers find new content without guessing the address.',
      impact: "New pages are found later than they could be.",
    },
    "B-1": {
      title: "The text is in the HTML, not only in JavaScript",
      fix: "Render the content on the server (SSR or static generation). Most AI crawlers do not run JavaScript: what is not in the HTML does not exist for them.",
      impact: "ChatGPT, Claude and Perplexity see an empty page: the text appears only after scripts run.",
    },
    "B-2": {
      title: "No invisible characters inside words in machine-readable output",
      fix: "Strip U+2060, U+200B, U+FEFF and U+00AD from <title>, meta, JSON-LD, feeds and llms.txt: «AI-⟨U+2060⟩native» with a hidden character does not match the query «AI-native». On the page itself typography can keep them, use CSS `white-space: nowrap` where you can.",
      impact: "Hidden characters break words, so the text does not match what people search for.",
    },
    "B-3": {
      title: "Headings do not glue words together",
      fix: 'Put a space between sibling elements inside the heading (in JSX: `{" "}`). Styles show two lines, but a crawler reads the text nodes joined: «NameTagline».',
      impact: "Headings read as glued words, so AI misreads what the page is about.",
    },
    "C-1": {
      title: "The author or company is a defined entity",
      fix: "Add JSON-LD Person (or Organization) to the home or about page with a stable `@id` (e.g. https://example.com/#person), `name`, `url`, `sameAs` with your profiles, and `jobTitle` for a person.",
      impact: "AI search cannot tell who stands behind the site, so it trusts it less.",
    },
    "C-2": {
      title: "Articles point at the author entity by @id",
      fix: 'Set `author: { "@id": "https://example.com/#person" }` (plus name and url if you like) — the same @id as the Person on the home page.',
      impact: "Articles are not tied to their author, so the expertise does not add up to one name.",
    },
    "C-4": {
      title: "Articles have complete Article / BlogPosting markup",
      fix: "Fill in `headline`, `datePublished`, `author` (required), and `dateModified`, `image`, `inLanguage`.",
      impact: "Articles lack dates or authorship, so AI search treats them as less reliable.",
    },
    "C-6": {
      title: "Every page has a link card: og:title, og:description, og:image",
      fix: "Add og:image (1200×630) and og:title / og:description to each public page. Chat apps, social networks and AI answers build the link card from them.",
      impact: "Links to the site look bare in chats and AI answers: no title, no picture.",
    },
    "C-7": {
      title: "A visible FAQ is marked up as FAQPage",
      fix: "If the page really is questions and answers, add FAQPage JSON-LD with the same questions and answers as on the page.",
      impact: "Questions and answers on the page are not marked as such, so they are quoted less often.",
    },
    "D-2": {
      title: "Articles answer in the first two paragraphs",
      fix: "Open with the answer: what it is, for whom, the main conclusion, in 25+ words. Answer engines quote the first paragraphs most often; an intro like «In this article we will…» wastes them.",
      impact: "The answer is buried below the intro, while AI search quotes the opening.",
    },
    "E-1": {
      title: "llms.txt follows llmstxt.org (optional)",
      fix: "llms.txt is optional: AI search engines rarely read it, coding agents and docs tools do — worth it for documentation, APIs and developer products. If you publish one, serve Markdown: `# Site name`, a `> one-line summary`, then `## Sections` with `- [Title](url): note` links to the key pages.",
      impact: "The published llms.txt cannot be read the way the agents that use it expect.",
    },
    "E-2": {
      title: "Links in llms.txt work and match the sitemap",
      fix: "Fix or remove broken links; list only published pages. A link that is in llms.txt but not in sitemap.xml is often a draft or a stale URL.",
      impact: "Agents that use llms.txt are sent to broken or unpublished pages.",
    },
    "E-3": {
      title: "Each language has its own llms.txt",
      fix: "For a multilingual site, serve llms.txt per language (e.g. /llms.txt and /ru/llms.txt) and link them to each other.",
      impact: "Language models get the guide to the site in one language only.",
    },
    "E-5": {
      title: "llms-full.txt carries the full text",
      fix: "Serve /llms-full.txt with the full text of key pages and articles, so a model can read the site in one request.",
      impact: "A model cannot read the site's content in one request.",
    },
    "F-1": {
      title: "Sitemap lastmod matches the page's dateModified",
      fix: "Generate lastmod from the same date as JSON-LD dateModified; a mismatch tells crawlers the page changed when it did not, or hides real updates.",
      impact: "Search engines get mixed signals about when pages changed.",
    },
    "G-1": {
      title: "No instructions addressed to AI in the content",
      fix: "Remove lines that tell AI systems what to say or do. Answer engines treat them as prompt injection and may drop the page or trust the site less. An easter egg for humans can live in humans.txt or the console.",
      impact: "Text addressed to AI looks like a manipulation attempt and lowers trust in the site.",
    },
  },

  /** Finding messages. Quotes («…»), URLs and code come in already formatted. */
  m: {
    none: "none",
    blockedSite: (agent: string) => `${agent} is blocked on the whole site`,
    blockedPages: (agent: string, n: number, total: number, example: string) => `${agent} is blocked on ${n} of ${total} pages, e.g. ${example}`,
    trainingBlockButAllowed: (list: string) => `Policy is block, but allowed: ${list}`,
    trainingAllowButBlocked: (list: string) => `Policy is allow, but blocked: ${list}`,
    trainingStatus: (allowed: string, blocked: string) => `Training crawlers — allowed: ${allowed}; blocked: ${blocked}`,
    agentGets: (agent: string, what: string) => `${agent} gets ${what}`,
    agentSmallPage: (agent: string, size: number, normal: number) => `${agent} gets a page half the usual size (${size} vs ${normal} bytes): a challenge or a stub?`,
    undeclaredFeed: (url: string) => `A feed exists at ${url}, but no page links to it in <head>`,
    fewWords: (words: number, article: boolean, min: number) => `${words} words in the HTML without JavaScript (${article ? "article" : "page"}: at least ${min})`,
    h1Typography: (q: string) => `H1 ${q} — fine if it is deliberate typography, the visible text is matched less strictly`,
    feedInvisible: (n: number) => `${n} invisible characters in the feed`,
    fileInvisible: (n: number) => `${n} invisible characters`,
    h1Reads: (q: string) => `H1 reads as ${q}`,
    noEntity: "No Person or Organization with name and url in JSON-LD on any audited page",
    noId: (type: string, name: string) => `${type} «${name}» has no @id: articles cannot point at it as one entity`,
    noSameAs: (type: string, name: string) => `${type} «${name}» has no sameAs (LinkedIn, GitHub…): models cannot confirm who this is`,
    noJobTitle: (name: string) => `Person «${name}» has no jobTitle`,
    entityNotOnHome: (url: string) => `the home page does not describe the company or author; it is described only on ${url}`,
    authorNoId: (name: string) => `author ${name} has no @id`,
    authorUnknownId: (id: string) => `author @id ${id} matches no Person or Organization defined on the site`,
    articleMissing: (type: string, fields: string) => `${type} without ${fields}`,
    noOg: (tags: string) => `no ${tags}`,
    faqDetails: (n: number) => `${n} <details> and no FAQPage — check by hand whether this is an FAQ`,
    faqQuestions: (n: number) => `${n} headings ending with «?» and no FAQPage — check by hand whether this is an FAQ`,
    introFirst: (q: string) => `starts with an intro instead of the answer: ${q}`,
    noLongParagraph: "no paragraph of 25+ words among the first two",
    notFound: (path: string) => `${path} not found`,
    llmsMissing: "no /llms.txt — optional: AI search engines rarely read it; it helps documentation, APIs and coding agents",
    answers: (path: string, status: string) => `${path} answers ${status}, so AI agents cannot read it`,
    skipNoArticles: "no articles among the audited pages",
    skipNoLlms: "no llms.txt",
    skipNoFeed: "the site has no feed",
    skipOneLanguage: "the site has one language",
    skipNoSitemap: "no sitemap.xml",
    returnsHtml: "returns HTML, not Markdown",
    noH1: "does not start with an H1 `# Name`",
    noSummary: "no `> summary` line",
    noSections: "no `## sections`",
    noLinks: "no links",
    brokenLink: (status: string) => `listed in llms.txt, answers ${status}`,
    nothing: "nothing",
    notInSitemap: "listed in llms.txt but not in sitemap.xml",
    noOtherLlms: (n: number, langs: string) => `site has ${n} languages (${langs}), llms.txt links to no other llms.txt`,
    noArticleText: (missing: number, total: number, example: string) => `no article text for ${missing} of ${total} audited articles, e.g. ${example}`,
    lastmodMismatch: (lastmod: string, modified: string) => `sitemap lastmod ${lastmod}, dateModified ${modified}`,
    noLastmod: "no lastmod in sitemap.xml",
  },
};

export type Messages = typeof en;
export type RuleId = keyof Messages["rules"];
