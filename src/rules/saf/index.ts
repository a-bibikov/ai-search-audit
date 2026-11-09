/**
 * Content safety (SAF): whether the content tries to steer AI.
 * No instructions addressed to AI models in the text or hidden in comments, attributes and markup, no hidden blocks of
 * text, the same page for AI agents as for people, and no smuggled Unicode tag characters or direction overrides.
 */
import type { Rule } from "../../types.ts";
import { saf1 } from "./saf-1.ts";
import { saf2 } from "./saf-2.ts";
import { saf3 } from "./saf-3.ts";
import { saf4 } from "./saf-4.ts";
import { saf5 } from "./saf-5.ts";

export const safRules: Rule[] = [saf1, saf2, saf3, saf4, saf5];
