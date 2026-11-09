/** Helpers shared by the E checks. */
import type { Messages } from "../../i18n/index.ts";
import type { Site } from "../../types.ts";

/** llms.txt that answered 200 with text, not an HTML page served at that address (a common SPA fallback). */
export const llmsReadable = (site: Site) => Boolean(site.llms && !/^\s*<(!doctype|html)/i.test(site.llms.body));

/**
 * Why group E cannot run, or null when there is an llms.txt to check. Without the file the whole group is «not checked»:
 * llms.txt is optional, so its absence is not a finding. A page served at /llms.txt (an SPA fallback) is no file either.
 */
export const llmsSkip = (site: Site, t: Messages["m"]): string | null => {
  if (llmsReadable(site)) return null;
  if (site.llms) return t.skipLlmsHtml;
  const a = site.llmsAttempt;
  return a.status === 404 || a.status === 410 ? t.skipNoLlms : t.skipLlmsAnswers(a.error ?? `HTTP ${a.status}`);
};
