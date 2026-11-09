/** TXT-7: Linked PDFs contain real text, not scans a model cannot read. */
import type { Rule } from "../../types.ts";
import { finder } from "../util.ts";

export const txt7: Rule = {
  id: "TXT-7",
  group: "TXT",
  level: "warn",
  applies: (site, t) => (site.pdfs.some((p) => p.text !== null) ? null : t.skipNoPdfs),
  run(site, _config, t) {
    const { out, add } = finder(this);
    for (const pdf of site.pdfs) if (pdf.text === false) add(pdf.url, t.pdfScan);
    return out;
  },
};
