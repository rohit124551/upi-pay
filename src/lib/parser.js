import { toPaise, sumPaise } from "./money";

const INVISIBLE = /[\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;
const ODD_SPACES = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\t]/g;
const LIST_MARKER = /^\s*(?:\d{1,3}[.)]|[-*•>])\s+/;
const BRACKET = /[([{]\s*([^)\]}]*?)\s*[)\]}]/g;
const CURRENCY = /₹|\brs\b\.?|\binr\b|\/-/gi;
const STOPWORDS = /\b(amount|amt|paid|pay|upi|id|mobile|phone|no|number)\b/gi;
export const TOTAL_LINE = /^\s*(?:grand\s+)?total\b/i;

export const vpaRe = () =>
  /(?<![\p{L}\p{N}._@-])[A-Za-z0-9][A-Za-z0-9._-]{1,255}@[A-Za-z][A-Za-z0-9]{1,63}(?!\.?[\p{L}\p{N}@_-])/gu;
export const phoneRe = () => /(?<![\p{L}\p{N}@._-])(?:\+?91[-\s]?|0)?([6-9]\d{9})(?![\p{L}\p{N}@])/gu;
const amountRe = () => /(?<![\p{L}\p{N}.,-])(\d{1,3}(?:,\d{2,3})+|\d+)(?:\.(\d{1,2}))?(?![\p{L}\p{N}]|[.,]\p{N})/gu;

export const normalizeText = (s) =>
  String(s || "").normalize("NFKC").replace(INVISIBLE, "").replace(ODD_SPACES, " ").replace(/\r\n?/g, "\n");

export function extractAmounts(text) {
  const amounts = [];
  const rest = text.replace(CURRENCY, " ").replace(amountRe(), (m, i, f) => {
    amounts.push(toPaise(i, f));
    return " ";
  });
  return { amounts, rest };
}

export function parseAmountString(s) {
  const { amounts, rest } = extractAmounts(normalizeText(s));
  return amounts.length === 1 && !/\p{N}/u.test(rest) ? amounts[0] : null;
}

const cleanName = (s) => s.replace(/[^\p{L}\s.'-]/gu, " ").replace(/\s+/g, " ").replace(/^[\s.'-]+|[\s.'-]+$/g, "");

export function lineFacts(raw) {
  const ids = [];
  const seen = new Set();
  const add = (identifier, kind) => {
    if (!seen.has(identifier)) ids.push({ identifier, kind });
    seen.add(identifier);
    return " ";
  };
  let t = normalizeText(raw).replace(LIST_MARKER, "");
  t = t.replace(vpaRe(), (m) => add(m.toLowerCase(), "vpa"));
  t = t.replace(phoneRe(), (m, d) => add(d, "phone"));
  let name = null;
  t = t.replace(BRACKET, (m, inner) => {
    if (/\p{N}/u.test(inner)) return ` ${inner} `;
    name = name || cleanName(inner) || null;
    return " ";
  });
  const { amounts, rest } = extractAmounts(t);
  const leftover = cleanName(rest.replace(STOPWORDS, " "));
  if (!name && /\p{L}{2,}/u.test(leftover)) name = leftover;
  return { ids, amounts, name, digitsLeft: /\p{N}/u.test(rest), hasAt: rest.includes("@") };
}

function reasonFor(f) {
  if (f.hasAt) return "Looks like an ID but isn't a valid UPI ID";
  if (f.ids.length > 1) return "More than one UPI ID or number on this line";
  if (f.ids.length === 0 && f.amounts.length > 0) return "Amount without a UPI ID or number";
  if (f.ids.length === 0) return "No UPI ID, number or amount";
  if (f.amounts.length === 0) return "No amount found";
  if (f.amounts.length > 1) return "More than one amount on this line";
  if (f.digitsLeft) return "Contains a number the rules can't place";
  return "Amount is zero";
}

const isClean = (f, ids, amts) => f.ids.length === ids && f.amounts.length === amts && !f.digitsLeft && !f.hasAt;

export function parseText(rawText) {
  const lines = normalizeText(rawText).split("\n");
  const entries = [];
  const unclear = [];
  let declaredTotalPaise = null;
  const entry = (id, name, paise, lineNos) => ({ ...id, name: name || null, paise, lines: lineNos, source: "rules" });

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i].trim();
    if (!raw) continue;
    const f = lineFacts(raw);
    const lineNo = i + 1;
    if (TOTAL_LINE.test(raw) && f.ids.length === 0 && f.amounts.length === 1) {
      declaredTotalPaise = f.amounts[0];
      continue;
    }
    if (isClean(f, 1, 0)) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j += 1;
      const n = j < lines.length && !TOTAL_LINE.test(lines[j]) ? lineFacts(lines[j]) : null;
      if (n && isClean(n, 0, 1) && n.amounts[0] > 0) {
        entries.push(entry(f.ids[0], f.name || n.name, n.amounts[0], [lineNo, j + 1]));
        i = j;
        continue;
      }
    }
    if (isClean(f, 1, 1) && f.amounts[0] > 0) {
      entries.push(entry(f.ids[0], f.name, f.amounts[0], [lineNo]));
      continue;
    }
    unclear.push({ lineNo, raw, reason: reasonFor(f), amountsPaise: f.amounts, ignored: false });
  }
  return { entries, unclear, declaredTotalPaise };
}

export function mergeEntries(entries) {
  const map = new Map();
  for (const e of entries) {
    const part = { paise: e.paise, lines: e.lines, source: e.source };
    const r = map.get(e.identifier);
    if (!r) {
      map.set(e.identifier, { id: e.identifier, identifier: e.identifier, kind: e.kind, name: e.name, note: e.note || null, amountPaise: e.paise, parts: [part], nameConflict: false });
      continue;
    }
    r.amountPaise += e.paise;
    r.parts.push(part);
    if (!r.note && e.note) r.note = e.note;
    if (!r.name && e.name) r.name = e.name;
    else if (r.name && e.name && r.name.toLowerCase() !== e.name.toLowerCase()) r.nameConflict = true;
  }
  return [...map.values()];
}

export function reconcile({ entries, unclear, declaredTotalPaise }, rows) {
  const finalPaise = sumPaise(rows, (r) => r.amountPaise);
  const unreadPaise = sumPaise(unclear, (u) => sumPaise(u.amountsPaise));
  const sourcePaise = sumPaise(entries, (e) => e.paise) + unreadPaise;
  const declaredDiff = declaredTotalPaise == null ? 0 : declaredTotalPaise - finalPaise;
  return {
    sourcePaise,
    finalPaise,
    unreadPaise,
    declaredTotalPaise,
    declaredDiff,
    openLines: unclear.filter((u) => !u.ignored).length,
    merged: entries.length - rows.length,
    balanced: sourcePaise === finalPaise && declaredDiff === 0,
  };
}
