import { normalizeText, vpaRe, phoneRe, extractAmounts, parseAmountString } from "./parser";
import { paiseToPlain } from "./money";

const TOKEN_RE = /\[ID-\d+\]/g;

export function maskLines(lines) {
  const tokens = {};
  const byValue = {};
  let n = 0;
  const tok = (identifier, kind, valid = true) => {
    if (!byValue[identifier]) {
      n += 1;
      byValue[identifier] = `[ID-${n}]`;
      tokens[byValue[identifier]] = { identifier, kind, valid };
    }
    return byValue[identifier];
  };
  const isVpa = (m) => !/\s/.test(m) && (m.match(vpaRe()) || [])[0] === m;
  const masked = lines.map((l) => ({
    line_no: l.lineNo,
    text: normalizeText(l.raw)
      .replace(/[^\s()[\]{}]*\s?@\s?[^\s()[\]{}]*/g, (m) => tok(m.toLowerCase(), "vpa", isVpa(m)))
      .replace(phoneRe(), (m, d) => tok(d, "phone"))
      .replace(/\+?(?:\d[\s-]?){7,}\d/g, (m) => tok(m.replace(/\D/g, ""), "phone", false))
      .trim()
      .slice(0, 500),
  }));
  return { masked, tokens };
}

// Never trust the model: token must be in that line, amount must be written in that line.
export function validateSuggestion(s, masked, tokens) {
  const line = masked.find((m) => m.line_no === s.line_no);
  if (!line) return { ok: false, reason: "Unknown line" };
  if (!s.id_token) return { ok: false, reason: s.note || "AI couldn't decide" };
  if (!line.text.includes(s.id_token) || !tokens[s.id_token]) return { ok: false, reason: "ID not in this line" };
  if (!tokens[s.id_token].valid) return { ok: false, reason: "That ID isn't a valid UPI ID or mobile number" };
  const paise = s.amount ? parseAmountString(s.amount) : null;
  if (!paise) return { ok: false, reason: "No clear amount" };
  const { amounts } = extractAmounts(line.text.replace(TOKEN_RE, " "));
  if (!amounts.includes(paise)) return { ok: false, reason: "Amount not written in this line" };
  const name = s.name && line.text.toLowerCase().includes(s.name.toLowerCase()) ? s.name : null;
  return {
    ok: true,
    entry: { identifier: tokens[s.id_token].identifier, kind: tokens[s.id_token].kind, name, paise, lines: [s.line_no], source: "ai" },
  };
}

// For the AI double-check: hide the personal part, keep the bank handle so typos like @okaxsi can be spotted.
export function maskForVerify(sourceLines, rows) {
  const tokens = {};
  const byValue = {};
  let n = 0;
  const tok = (id) => {
    if (!byValue[id]) {
      n += 1;
      byValue[id] = `[ID-${n}]`;
      tokens[byValue[id]] = id;
    }
    return byValue[id];
  };
  const show = (id) => (id.includes("@") ? `${tok(id)}@${id.split("@")[1]}` : tok(id));
  const source = sourceLines
    .map((l) => ({
      line_no: l.line_no,
      text: normalizeText(l.text).trim()
        .replace(vpaRe(), (m) => show(m.toLowerCase()))
        .replace(/[^\s()[\]{}]*\s?@\s?[^\s()[\]{}]*/g, (m, off, s) => (s[off - 1] === "]" ? m : tok(m.toLowerCase())))
        .replace(phoneRe(), (m, d) => tok(d))
        .replace(/\+?(?:\d[\s-]?){7,}\d/g, (m) => tok(m.replace(/\D/g, "")))
        .slice(0, 500),
    }))
    .filter((l) => l.text);
  const masked = rows.map((r, i) => ({
    ref: `R${i + 1}`,
    identifier: show(r.identifier),
    name: r.name,
    amount: paiseToPlain(r.amountPaise),
    lines: r.parts.flatMap((p) => p.lines),
  }));
  const unmask = (text) => String(text).replace(/\[?ID-(\d+)\]?/g, (m, d) => tokens[`[ID-${d}]`]?.split("@")[0] || m).replace(/\bR(\d+)\b/g, (m, d) => rows[d - 1]?.identifier || m);
  return { source, rows: masked, unmask };
}

export const textToSourceLines = (raw) => normalizeText(raw).split("\n").map((text, i) => ({ line_no: i + 1, text }));

