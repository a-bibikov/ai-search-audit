/**
 * Access (BOT): whether AI agents are let in and can quote what they read.
 * robots.txt lets AI search bots and the agents people send in, training crawlers follow the owner's policy, the server
 * and robots.txt answer AI agents like a browser, no noindex, noai, nosnippet or Content Signal closes public pages,
 * closing Google-Extended is a deliberate choice, a feed is declared, and missing pages answer 404.
 */
import type { Rule } from "../../types.ts";
import { bot1 } from "./bot-1.ts";
import { bot2 } from "./bot-2.ts";
import { bot3 } from "./bot-3.ts";
import { bot4 } from "./bot-4.ts";
import { bot5 } from "./bot-5.ts";
import { bot6 } from "./bot-6.ts";
import { bot7 } from "./bot-7.ts";
import { bot8 } from "./bot-8.ts";
import { bot9 } from "./bot-9.ts";
import { bot10 } from "./bot-10.ts";
import { bot11 } from "./bot-11.ts";

export const botRules: Rule[] = [bot1, bot2, bot3, bot4, bot5, bot6, bot7, bot8, bot9, bot10, bot11];
