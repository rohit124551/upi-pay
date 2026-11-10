import { paiseToPlain, formatINR } from "./money";

export const getFormattedStatus = (r) => {
  if (r.status === "paid") {
    return "paid ✅";
  }
  if (r.status === "failed") {
    return r.failReason ? `Error: ${r.failReason}` : "Error";
  }
  return "Pending";
};

// First 3 columns: UPI ID, Amount, Status. Followed by other audit details.
const HEAD = [
  "UPI ID",
  "Amount (INR)",
  "Status",
  "Name",
  "Type",
  "UPI Lite",
  "Done At",
  "Fail Reason",
  "Merged From",
];

// Prefix cells that spreadsheets would run as formulas.
const safe = (v) => {
  const s = v == null ? "" : String(v);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};
const quote = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

const cells = (r) => [
  r.identifier,
  paiseToPlain(r.amountPaise),
  getFormattedStatus(r),
  r.name || "",
  r.kind === "vpa" ? "UPI ID" : "Mobile",
  r.lite ? "yes" : "no",
  r.doneAt || "",
  r.failReason || "",
  (r.parts || []).map((p) => paiseToPlain(p.paise)).join(" + "),
].map(safe);

export const toCSV = (rows) => [HEAD, ...rows.map(cells)].map((line) => line.map(quote).join(",")).join("\n");

/**
 * Simple copy format requested:
 * UPI ID  amount paid  status (paid ✅)
 * if error: status error with reason.
 * Tab-separated for seamless pasting into Excel, Google Sheets, or chat.
 */
export const toSimpleCopy = (rows) =>
  rows
    .map((r) => `${r.identifier}\t${formatINR(r.amountPaise)}\t${getFormattedStatus(r)}`)
    .join("\n");

export const toTSV = (rows) => toSimpleCopy(rows);

export function downloadFile(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
