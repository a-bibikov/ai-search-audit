/** Helpers shared by the B checks. */
import { INVISIBLE_G } from "../util.ts";

export const countInvisible = (text: string) => (text.match(INVISIBLE_G) ?? []).length;

/** Inner HTML of the first <main>, else the first <article>: where the page keeps its own content. */
export const mainHtml = (html: string) =>
  html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? null;

/** What a page shows instead of its text when it needs scripts: «Loading…», «Enable JavaScript». */
export const JS_STUB = /(enable javascript|javascript (is )?(required|disabled)|you need to enable javascript|loading\s*(…|\.\.\.)|включите javascript|для работы (сайта|приложения) нужен javascript|загрузка\s*(…|\.\.\.))/i;
