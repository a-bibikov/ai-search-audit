/** BOT-3: The server answers AI agents like a browser. */
import type { Fetched, Rule } from "../../types.ts";
import { finder } from "../util.ts";

/** A bot check instead of the page: Cloudflare and other CDNs mark it in a header or in the page title. */
const challenged = (f: Fetched) =>
  f.headers.get("cf-mitigated") === "challenge" ||
  /<title>\s*(just a moment|attention required|checking your browser|access denied|ddos-guard)/i.test(f.body.slice(0, 20000)) ||
  /\/cdn-cgi\/challenge-platform\//.test(f.body.slice(0, 50000));

export const bot3: Rule = {
  id: "BOT-3",
  group: "BOT",
  level: "error",
  run(site, _config, t) {
    const { out, add } = finder(this);
    const normal = site.pages[0]?.fetched.body.length ?? 0;
    for (const { agent, fetched } of site.asAgents) {
      if (fetched.status !== 200) add(fetched.publicUrl, t.agentGets(agent, fetched.error ?? `HTTP ${fetched.status}`));
      else if (challenged(fetched) && !challenged(site.pages[0]!.fetched)) add(fetched.publicUrl, t.agentChallenge(agent));
      else if (normal && fetched.body.length < normal * 0.5) add(fetched.publicUrl, t.agentSmallPage(agent, fetched.body.length, normal));
    }
    return out;
  },
};
