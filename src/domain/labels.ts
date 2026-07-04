// Label cleaning and merchant extraction.

const NOISE_PREFIXES = [
  "carte",
  "cb",
  "paiement",
  "paiement cb",
  "achat cb",
  "prlv",
  "prelevement",
  "prélèvement",
  "virement",
  "vir",
  "vir sepa",
  "retrait",
  "retrait dab",
];

/** Collapse whitespace and drop trailing date/reference tokens from a label. */
export function cleanLabel(raw: string): string {
  let s = raw.replace(/\s+/g, " ").trim();
  // Strip trailing "DU 12/03/24", card masks, and long reference numbers.
  s = s.replace(/\bdu\s+\d{1,2}\/\d{1,2}(\/\d{2,4})?\b.*$/i, "").trim();
  s = s.replace(/\b\d{6,}\b/g, "").trim();
  s = s.replace(/\s{2,}/g, " ").trim();
  return s === "" ? raw.trim() : s;
}

/** Best-effort merchant guess: drop known operation prefixes, take the head. */
export function guessMerchant(raw: string): string | undefined {
  let s = cleanLabel(raw).toLowerCase();
  for (const p of NOISE_PREFIXES.sort((a, b) => b.length - a.length)) {
    if (s.startsWith(p + " ")) {
      s = s.slice(p.length).trim();
      break;
    }
  }
  const merchant = s.split(/\s{2,}|\s\d/)[0]?.trim();
  if (!merchant) return undefined;
  return merchant
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
