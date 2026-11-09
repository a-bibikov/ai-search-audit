/**
 * Entities and authorship (ENT): whether a model can tell who stands behind the site.
 * The author or company is one defined entity, articles point at it by @id and carry complete Article markup, every page
 * has a link card, a visible FAQ is marked up as one, the about page is a profile and listings are collections, a
 * company has a logo and contacts, products carry prices, markup says what the page shows, one entity has one name,
 * and the site has about and contact pages.
 */
import type { Rule } from "../../types.ts";
import { ent1 } from "./ent-1.ts";
import { ent2 } from "./ent-2.ts";
import { ent3 } from "./ent-3.ts";
import { ent4 } from "./ent-4.ts";
import { ent5 } from "./ent-5.ts";
import { ent6 } from "./ent-6.ts";
import { ent7 } from "./ent-7.ts";
import { ent8 } from "./ent-8.ts";
import { ent9 } from "./ent-9.ts";
import { ent10 } from "./ent-10.ts";
import { ent11 } from "./ent-11.ts";
import { ent12 } from "./ent-12.ts";

export const entRules: Rule[] = [ent1, ent2, ent3, ent4, ent5, ent6, ent7, ent8, ent9, ent10, ent11, ent12];
