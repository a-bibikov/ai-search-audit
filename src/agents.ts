/**
 * AI user agents by role, from each operator's own documentation.
 * Search agents build the index AI answers draw on: blocking them removes the site from those answers.
 * User agents open a page when a person asks the assistant about it; they may not follow robots.txt, but a block there
 * still says the site does not want to be read.
 * Training crawlers collect data for future models: allowing them is a policy choice.
 */
export const SEARCH_AGENTS = [
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Googlebot",
  "Bingbot",
  "Applebot",
  "DuckAssistBot",
  "MistralAI-Index",
  "meta-webindexer",
  "Amzn-SearchBot",
  "YandexBot",
] as const;

export const USER_AGENTS = ["ChatGPT-User", "Claude-User", "Perplexity-User", "MistralAI-User", "meta-externalfetcher", "Amzn-User", "Google-Agent"] as const;

export const TRAINING_AGENTS = [
  "GPTBot",
  "ClaudeBot",
  "CCBot",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "MistralAI-Training",
  "Amazonbot",
] as const;

/** A browser-like UA string carrying the agent's token, the way these crawlers identify themselves. */
export const userAgentFor = (token: string) => `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ${token}/1.0)`;
