import type { Rule } from "../types.ts";
import { accessRules } from "./access.ts";
import { contentRules } from "./content.ts";
import { entityRules } from "./entities.ts";
import { textRules } from "./text.ts";

export const rules: Rule[] = [...accessRules, ...textRules, ...entityRules, ...contentRules].sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
