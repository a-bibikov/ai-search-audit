/**
 * Answer first (ANS): whether the answer sits where answer engines quote from.
 * Articles answer in their first two paragraphs instead of an introduction and name their topic there, show the date
 * the markup gives, are split into sections with lists or tables, link the sources of their figures, start each
 * section without leaning on the one before, and end with a conclusion a model can quote whole.
 */
import type { Rule } from "../../types.ts";
import { ans1 } from "./ans-1.ts";
import { ans2 } from "./ans-2.ts";
import { ans3 } from "./ans-3.ts";
import { ans4 } from "./ans-4.ts";
import { ans5 } from "./ans-5.ts";
import { ans6 } from "./ans-6.ts";
import { ans7 } from "./ans-7.ts";

export const ansRules: Rule[] = [ans1, ans2, ans3, ans4, ans5, ans6, ans7];
