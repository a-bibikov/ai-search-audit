/** ENT-11: One entity is described the same way on every page: the same @id has the same name in one language. */
import type { Rule } from "../../types.ts";
import { finder, str } from "../util.ts";
import { definitions } from "./shared.ts";

export const ent11: Rule = {
  id: "ENT-11",
  group: "ENT",
  level: "warn",
  run(site, _config, t) {
    const { out, add } = finder(this);
    // A name in Russian on Russian pages and in English on English ones is one entity, not a contradiction.
    const names = new Map<string, Map<string, string>>();
    for (const { n, page } of definitions(site)) {
      const id = str(n["@id"]);
      const name = str(n.name).trim();
      if (!id || !name) continue;
      const key = `${id} ${page.htmlLang.slice(0, 2).toLowerCase()}`;
      if (!names.has(key)) names.set(key, new Map());
      const seen = names.get(key)!;
      if (!seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
    }
    for (const [key, seen] of names)
      if (seen.size > 1) add("site", t.entityDiffers(key.split(" ")[0]!, [...seen.values()].map((v) => `«${v}»`).join(", ")));
    return out;
  },
};
