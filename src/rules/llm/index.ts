/**
 * Machine-readable versions (LLM): llms.txt and llms-full.txt for models and coding agents.
 * They follow llmstxt.org, their links work and match the sitemap, each language has its own, llms-full.txt carries the
 * full text, pages have Markdown versions, robots.txt does not close the files, llms.txt lists the newest articles, and
 * its links say what is behind them.
 */
import type { Rule } from "../../types.ts";
import { llm1 } from "./llm-1.ts";
import { llm2 } from "./llm-2.ts";
import { llm3 } from "./llm-3.ts";
import { llm4 } from "./llm-4.ts";
import { llm5 } from "./llm-5.ts";
import { llm6 } from "./llm-6.ts";
import { llm7 } from "./llm-7.ts";
import { llm8 } from "./llm-8.ts";

export const llmRules: Rule[] = [llm1, llm2, llm3, llm4, llm5, llm6, llm7, llm8];
