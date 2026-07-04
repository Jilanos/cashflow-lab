// Bank CSV exports are not always UTF-8. Credit Agricole in particular often
// exports ISO-8859-1 (latin1), which turns accented headers like "Libellé"
// into mojibake when decoded as UTF-8 and breaks header detection.
//
// Decode strategy: try strict UTF-8 first; if it throws (invalid byte
// sequence) fall back to ISO-8859-1, which never fails and covers French
// bank exports.

export function decodeBytes(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("iso-8859-1").decode(bytes);
  }
}

/** Read a File (browser) with encoding auto-detection. */
export async function readFileSmart(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return decodeBytes(buffer);
}
