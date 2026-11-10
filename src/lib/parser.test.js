import { parseText, mergeEntries, reconcile, normalizeText } from "./parser";
import { formatINR, paiseToPlain } from "./money";
import { maskLines, validateSuggestion } from "./mask";
import { buildUpiUri, lastFour } from "./upi";
import { toCSV } from "./csv";
import { SAMPLE_TEXT } from "./sample";
import { planLite } from "./lite";
import { maskForVerify, textToSourceLines } from "./mask";
import { isUnusualHandle } from "./handles";
import { guessMapping, rowsFromSheet } from "./sheet";
import { LOGO_PATHS } from "./brandLogos";
import { buildPdfFromJpeg } from "./pdfExport";

const one = (line) => parseText(line).entries[0];

describe("line parsing", () => {
  test("UPI ID with bracket name and rupee sign", () => {
    expect(one("rahul@okaxis (Rahul Verma) ₹4,250")).toMatchObject({ identifier: "rahul@okaxis", kind: "vpa", name: "Rahul Verma", paise: 425000 });
  });
  test("plain phone with /- suffix, +91 prefix", () => {
    expect(one("+91 9999991811 - 1,200/-")).toMatchObject({ identifier: "9999991811", kind: "phone", paise: 120000 });
  });
  test("phone inside a UPI ID is not double counted", () => {
    const r = parseText("9999991811@ptyes 11698");
    expect(r.entries).toHaveLength(1);
    expect(r.entries[0].identifier).toBe("9999991811@ptyes");
  });
  test("decimals are exact paise", () => {
    expect(one("a.b@ybl 304.5").paise).toBe(30450);
  });
  test("Indian lakh commas", () => {
    expect(one("big@ybl Rs.1,00,000").paise).toBe(10000000);
  });
  test("ID on one line, amount on the next", () => {
    expect(one("aman_k@paytm\n  2,401")).toMatchObject({ identifier: "aman_k@paytm", paise: 240100, lines: [1, 2] });
  });
  test("emails are not UPI IDs", () => {
    const r = parseText("someone@gmail.com 500");
    expect(r.entries).toHaveLength(0);
    expect(r.unclear).toHaveLength(1);
  });
  test("two amounts on a line is unclear, never guessed", () => {
    const r = parseText("9999991888 amount 750 or 800?");
    expect(r.entries).toHaveLength(0);
    expect(r.unclear[0].amountsPaise).toEqual([75000, 80000]);
  });
  test("invisible characters and full-width digits are cleaned", () => {
    expect(normalizeText("mk735\u200B@ybl １６１６")).toBe("mk735@ybl 1616");
    expect(one("mk735\u200B@ybl １６１６")).toMatchObject({ identifier: "mk735@ybl", paise: 161600 });
  });
  test("look-alike Cyrillic letter breaks the match instead of paying a wrong ID", () => {
    expect(parseText("\u0430man@ybl 500").entries).toHaveLength(0);
  });
  test("total line becomes declared total", () => {
    expect(parseText("a@ybl 10\nTotal: 10").declaredTotalPaise).toBe(1000);
  });
});

describe("merge and reconcile", () => {
  test("case-insensitive duplicates merge with history", () => {
    const p = parseText("Pushkar@oksbi (Pushkar) 404\npushkar@oksbi 2020");
    const rows = mergeEntries(p.entries);
    expect(rows).toHaveLength(1);
    expect(rows[0].amountPaise).toBe(242400);
    expect(rows[0].parts.map((x) => x.paise)).toEqual([40400, 202000]);
  });
  test("different names on same ID raise a conflict", () => {
    const rows = mergeEntries(parseText("xy@ybl (Asha) 1\nxy@ybl (Ravi) 2").entries);
    expect(rows[0].nameConflict).toBe(true);
  });
  test("sample: declared total mismatch and unread amounts are caught", () => {
    const p = parseText(SAMPLE_TEXT);
    const rows = mergeEntries(p.entries);
    const rec = reconcile(p, rows);
    expect(rows).toHaveLength(13);
    expect(rec.merged).toBe(1);
    expect(rec.finalPaise).toBe(2991250);
    expect(rec.unreadPaise).toBe(155000);
    expect(rec.declaredTotalPaise).toBe(2400000);
    expect(rec.balanced).toBe(false);
  });
});

describe("masking for AI", () => {
  test("real IDs never appear in masked text", () => {
    const { masked, tokens } = maskLines([{ lineNo: 4, raw: "9694962220 x@ybl 1634" }]);
    expect(masked[0].text).toBe("[ID-2] [ID-1] 1634");
    expect(JSON.stringify(masked)).not.toMatch(/9694962220|x@ybl/);
    expect(tokens["[ID-2]"].identifier).toBe("9694962220");
    expect(tokens["[ID-1]"].valid).toBe(false);
  });
  test("anything with @ or long digit runs is masked, even if invalid", () => {
    const { masked } = maskLines([{ lineNo: 1, raw: "bad@gmail.com 12345678901 Rs 500" }]);
    expect(masked[0].text).toBe("[ID-1] [ID-2] Rs 500");
  });
  test("spaced phones and spaced @ are masked too", () => {
    const { masked } = maskLines([{ lineNo: 1, raw: "+91-98765-43210 and rahul @ okaxis 98765 43210 Rs 500" }]);
    expect(masked[0].text).not.toMatch(/98765|rahul|okaxis/);
    expect(masked[0].text).toContain("Rs 500");
  });
  test("AI amount must be written in the line", () => {
    const { masked, tokens } = maskLines([{ lineNo: 1, raw: "9694962220 amount 750 or 800" }]);
    expect(validateSuggestion({ line_no: 1, id_token: "[ID-1]", amount: "775" }, masked, tokens).ok).toBe(false);
    expect(validateSuggestion({ line_no: 1, id_token: "[ID-9]", amount: "750" }, masked, tokens).ok).toBe(false);
    const ok = validateSuggestion({ line_no: 1, id_token: "[ID-1]", amount: "750" }, masked, tokens);
    expect(ok.entry).toMatchObject({ identifier: "9694962220", paise: 75000, source: "ai" });
  });
});

describe("UPI Lite planning", () => {
  const caps = { liteTxMaxPaise: 100000, liteWalletPaise: 500000 };
  test("only payments up to ₹1,000 are Lite", () => {
    const out = planLite([{ amountPaise: 100000 }, { amountPaise: 100001 }], caps);
    expect(out.map((r) => r.lite)).toEqual([true, false]);
  });
  test("wallet top-ups never exceed ₹5,000", () => {
    const out = planLite(Array.from({ length: 7 }, () => ({ amountPaise: 90000 })), caps);
    expect(out.map((r) => r.liteLoad)).toEqual([1, 1, 1, 1, 1, 2, 2]);
    expect(out[0].liteLoadTotal).toBe(450000);
    expect(out[5]).toMatchObject({ liteLoadStart: true, liteLoadTotal: 180000 });
  });
});

describe("UPI link, money, CSV", () => {
  test("verify masking keeps bank handle, hides personal part", () => {
    const rows = mergeEntries(parseText("rahul.v@okaxsi 404\n9694962220 50").entries);
    const v = maskForVerify(textToSourceLines("rahul.v@okaxsi 404\n9694962220 50"), rows);
    const all = JSON.stringify([v.source, v.rows]);
    expect(all).not.toMatch(/rahul|9694962220/);
    expect(v.source[0].text).toBe("[ID-1]@okaxsi 404");
    expect(v.rows[1]).toMatchObject({ identifier: "[ID-2]", amount: "50.00" });
    expect(isUnusualHandle("rahul.v@okaxsi")).toBe(true);
    expect(isUnusualHandle("rahul.v@okaxis")).toBe(false);
  });
  test("sheet rows map to entries, bad rows become unclear", () => {
    const table = [["Payee", "Amt", "Person Name"], ["a.b@ybl", "1,200", "Asha"], ["12345", "50", ""], ["", "", ""], ["9876500011", "₹99.5", ""]];
    const map = guessMapping(table[0]);
    expect(map).toMatchObject({ id: "0", amount: "1", name: "2" });
    const out = rowsFromSheet(table, map);
    expect(out.entries.map((e) => [e.identifier, e.paise, e.lines[0]])).toEqual([["a.b@ybl", 120000, 2], ["9876500011", 9950, 5]]);
    expect(out.unclear[0]).toMatchObject({ lineNo: 3 });
    expect(guessMapping(["upi_id_or_mobile", "name", "amount", "description"])).toEqual({ id: "0", amount: "2", name: "1", note: "3" });
    expect(guessMapping(["Payee UPI", "Person Name", "Amount Rs", "Remark"])).toEqual({ id: "0", amount: "2", name: "1", note: "3" });
  });
  test("QR without amount or note omits them", () => {
    expect(buildUpiUri({ identifier: "a@ybl", amountPaise: null })).toBe("upi://pay?pa=a%40ybl&pn=a%40ybl&cu=INR");
  });
  test("UPI link uses exact amount string", () => {
    const uri = buildUpiUri({ identifier: "p@oksbi", name: "P Bansal", amountPaise: 242400 }, "Batch Day 1");
    expect(uri).toBe("upi://pay?pa=p%40oksbi&pn=P%20Bansal&am=2424.00&cu=INR&tn=Batch%20Day%201");
    expect(lastFour("pushkar09-2@oksbi")).toBe("09-2");
  });
  test("Indian formatting", () => {
    expect(formatINR(10000000)).toBe("₹1,00,000");
    expect(formatINR(30450)).toBe("₹304.50");
    expect(paiseToPlain(5)).toBe("0.05");
  });
  test("CSV neutralises formula injection", () => {
    const csv = toCSV([{ identifier: "a@ybl", kind: "vpa", name: "=HYPERLINK()", amountPaise: 100, status: "paid", parts: [{ paise: 100 }] }]);
    expect(csv).toContain("'=HYPERLINK()");
  });
  test("UPI uri handles special characters in name and note safely", () => {
    const uri = buildUpiUri({ identifier: "john@oksbi", name: "John & Co", amountPaise: 50000 }, "Dinner / Drinks");
    expect(uri).toContain("pa=john%40oksbi");
    expect(uri).toContain("pn=John%20%26%20Co");
    expect(uri).toContain("am=500.00");
    expect(uri).toContain("tn=Dinner%20%2F%20Drinks");
  });
  test("lastFour returns last 4 chars before @ or end of phone", () => {
    expect(lastFour("rahul1234@okaxis")).toBe("1234");
    expect(lastFour("9876543210")).toBe("3210");
  });
  test("brandLogos contains official authorized marks and strictly excludes Amazon Pay", () => {
    expect(LOGO_PATHS.bhim).toContain("bhim.svg");
    expect(LOGO_PATHS.upi).toContain("upi.svg");
    expect(LOGO_PATHS.gpay).toContain("gpay.svg");
    expect(LOGO_PATHS.phonepe).toContain("phonepe.svg");
    expect(LOGO_PATHS.paytm).toContain("paytm.svg");
    expect(LOGO_PATHS.amazon).toBeUndefined();
    expect(LOGO_PATHS.amazonpay).toBeUndefined();
  });
  test("modern fintech and bank handles are recognized as valid", () => {
    expect(isUnusualHandle("user@indie")).toBe(false);
    expect(isUnusualHandle("user@cred")).toBe(false);
    expect(isUnusualHandle("user@axiscred")).toBe(false);
    expect(isUnusualHandle("user@slice")).toBe(false);
    expect(isUnusualHandle("user@jupiter")).toBe(false);
    expect(isUnusualHandle("user@niyo")).toBe(false);
    expect(isUnusualHandle("user@fakebank999")).toBe(true);
  });
  test("buildPdfFromJpeg generates standard compliant PDF 1.4 document", () => {
    const dummyJpeg = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const pdfBytes = buildPdfFromJpeg(dummyJpeg, 800, 1150);
    const pdfStr = new TextDecoder().decode(pdfBytes);
    expect(pdfStr).toContain("%PDF-1.4");
    expect(pdfStr).toContain("/Type /Catalog");
    expect(pdfStr).toContain("/Type /Page");
    expect(pdfStr).toContain("/Filter /DCTDecode");
    expect(pdfStr).toContain("/Width 800");
    expect(pdfStr).toContain("/Height 1150");
    expect(pdfStr).toContain("trailer");
    expect(pdfStr).toContain("%%EOF");
  });
});
