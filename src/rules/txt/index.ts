/**
 * Text without JavaScript (TXT): whether the words reach a model that reads raw HTML.
 * The text is in the HTML and not only in scripts, machine-readable output has no invisible characters inside words,
 * headings do not glue words together, the main text sits in <main> and outweighs menus, it is not hidden in frames or
 * drawn on a canvas, the encoding is not broken, linked PDFs have real text, and tab panels are in the HTML.
 */
import type { Rule } from "../../types.ts";
import { txt1 } from "./txt-1.ts";
import { txt2 } from "./txt-2.ts";
import { txt3 } from "./txt-3.ts";
import { txt4 } from "./txt-4.ts";
import { txt5 } from "./txt-5.ts";
import { txt6 } from "./txt-6.ts";
import { txt7 } from "./txt-7.ts";
import { txt8 } from "./txt-8.ts";

export const txtRules: Rule[] = [txt1, txt2, txt3, txt4, txt5, txt6, txt7, txt8];
