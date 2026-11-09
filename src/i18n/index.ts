import { LANGS as REPORT_LANGS, type Lang } from "auditor-engine";
import { en, type Messages, type RuleId } from "./en.ts";
import { ru } from "./ru.ts";

export type { Messages, RuleId, Lang };
export { DEFAULT_LANG, isLang } from "auditor-engine";

/** Texts of the AI search checks in every report language of auditor-engine: TypeScript names a missing one. */
export const LANGS = { en, ru } satisfies Record<keyof typeof REPORT_LANGS, Messages>;
export const messages = (lang: Lang = "en"): Messages => LANGS[lang];
