import type { Rule } from "../types.ts";
import { botRules } from "./bot/index.ts";
import { txtRules } from "./txt/index.ts";
import { entRules } from "./ent/index.ts";
import { ansRules } from "./ans/index.ts";
import { llmRules } from "./llm/index.ts";
import { updRules } from "./upd/index.ts";
import { safRules } from "./saf/index.ts";

/** The checks in checklist order: one folder per group, one file per check. */
export const rules: Rule[] = [...botRules, ...txtRules, ...entRules, ...ansRules, ...llmRules, ...updRules, ...safRules];
