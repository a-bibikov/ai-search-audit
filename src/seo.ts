import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { CrawlOptions } from "./crawl.ts";
import type { Report } from "./index.ts";
import type { Config } from "./types.ts";

/** The package with the classic search checks. Not a dependency: installed only by those who want --seo. */
export const SEO_PACKAGE = "search-auditor";

/** What --seo needs from search-auditor: one crawl, both rule sets, one report. */
export interface SeoModule {
  auditSearch(
    target: string,
    opts: { base?: string; config?: Partial<Config> & { maxLinks?: number }; log?: CrawlOptions["log"] },
  ): Promise<Report>;
}

/**
 * Loads search-auditor next to this package (npx -p, a project's node_modules) or, failing that, from the current
 * project (a global ai-search-auditor run inside a project that has search-auditor). Returns null when neither has it.
 */
export async function loadSeo(cwd = process.cwd()): Promise<SeoModule | null> {
  const name = SEO_PACKAGE;
  // Missing means search-auditor itself is missing; a missing package inside it is a real error worth showing.
  const missing = (e: unknown) => /MODULE_NOT_FOUND/.test(String((e as { code?: string }).code)) && String((e as Error).message).includes(`'${name}'`);
  try {
    return (await import(name)) as SeoModule;
  } catch (e) {
    if (!missing(e)) throw e;
  }
  try {
    const resolved = createRequire(join(cwd, "noop.js")).resolve(name);
    return (await import(pathToFileURL(resolved).href)) as SeoModule;
  } catch (e) {
    if (missing(e)) return null;
    throw e;
  }
}
