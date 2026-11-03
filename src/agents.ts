/**
 * AI user agents by role. Search and user agents fetch pages to answer a question and cite them: blocking them removes
 * the site from AI answers. Training crawlers collect data for future models: allowing them is a policy choice.
 */
export const SEARCH_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Googlebot",
  "Bingbot",
  "YandexBot",
] as const;

export const TRAINING_AGENTS = ["GPTBot", "ClaudeBot", "CCBot", "Google-Extended", "Applebot-Extended", "meta-externalagent"] as const;

/** A browser-like UA string carrying the agent's token, the way these crawlers identify themselves. */
export const userAgentFor = (token: string) => `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ${token}/1.0)`;
