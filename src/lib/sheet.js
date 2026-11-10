import { lineFacts, parseAmountString, extractAmounts, normalizeText } from "./parser";

export const FIELDS = [
  { key: "id", label: "UPI ID or mobile", required: true, guess: /upi|vpa|mobile|phone|payee|\bid\b|number/i },
  { key: "amount", label: "Amount", required: true, guess: /amount|\bamt\b|\brs\b|\binr\b|₹|\bvalue\b/i },
  { key: "name", label: "Name", required: false, guess: /name|person|beneficiary/i },
  { key: "note", label: "Description", required: false, guess: /note|desc|remark|purpose|narration/i },
];

export function guessMapping(headers) {
  const used = new Set();
  const map = {};
  for (const f of FIELDS) {
    const i = headers.findIndex((h, idx) => !used.has(idx) && f.guess.test(String(h)));
    map[f.key] = i === -1 ? "" : String(i);
    if (i !== -1) used.add(i);
  }
  return map;
}

const cell = (row, idx) => (idx === "" || idx == null ? "" : normalizeText(String(row[+idx] ?? "")).trim());

export function rowsFromSheet(table, map) {
  const entries = [];
  const unclear = [];
  const textLines = [];
  const sourceLines = [];
  table.slice(1).forEach((row, i) => {
    const lineNo = i + 2;
    const [id, amt, name, note] = ["id", "amount", "name", "note"].map((k) => cell(row, map[k]));
    if (!id && !amt && !name) return;
    textLines.push(`${id}${name ? ` (${name})` : ""} ${amt}`.trim());
    sourceLines.push({ line_no: lineNo, text: [id, name, amt].filter(Boolean).join(" | ") });
    const f = lineFacts(id);
    const paise = parseAmountString(amt);
    let reason = null;
    if (f.ids.length !== 1 || f.digitsLeft || f.hasAt) reason = "Not a valid UPI ID or 10-digit mobile";
    else if (!paise) reason = "Amount missing or unclear";
    if (reason) unclear.push({ lineNo, raw: [id, name, amt].filter(Boolean).join(" | "), reason, amountsPaise: extractAmounts(amt).amounts, ignored: false });
    else entries.push({ ...f.ids[0], name: name || null, note: note || null, paise, lines: [lineNo], source: "sheet" });
  });
  return { entries, unclear, declaredTotalPaise: null, raw: textLines.join("\n"), sourceLines };
}

export const TEMPLATE = [
  ["upi_id_or_mobile", "name", "amount", "description"],
  ["rahul.verma42@okaxis", "Rahul Verma", "4250", "June incentive"],
  ["9999991811", "", "1200", ""],
  ["priya.s-1@oksbi", "Priya Sharma", "404", "Travel refund"],
];
