/**
 * Freshness (UPD): whether the dates a crawler reads agree.
 * The sitemap lastmod of a page matches its dateModified, feeds have dates and full text and keep up with the site,
 * nothing shows a past year as current, markup dates are plausible, and lastmod is not one build date for every page.
 */
import type { Rule } from "../../types.ts";
import { upd1 } from "./upd-1.ts";
import { upd2 } from "./upd-2.ts";
import { upd3 } from "./upd-3.ts";
import { upd4 } from "./upd-4.ts";
import { upd5 } from "./upd-5.ts";

export const updRules: Rule[] = [upd1, upd2, upd3, upd4, upd5];
