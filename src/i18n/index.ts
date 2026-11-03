import { en, type Messages, type RuleId } from "./en.ts";
import { ru } from "./ru.ts";

export type { Messages, RuleId };

/** Report languages. English is the default; to add one, write ./<lang>.ts typed as Messages and list it here. */
export const LANGS = { en, ru } satisfies Record<string, Messages>;
export type Lang = keyof typeof LANGS;
export const DEFAULT_LANG: Lang = "en";

export const isLang = (value: unknown): value is Lang => typeof value === "string" && Object.hasOwn(LANGS, value);
export const messages = (lang: Lang = DEFAULT_LANG): Messages => LANGS[lang];
