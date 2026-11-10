import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy, ShieldAlert, Smartphone, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "./Badge";
import { buildUpiUri, lastFour } from "../../lib/upi";
import { formatINR, paiseToPlain } from "../../lib/money";
import { isUnusualHandle } from "../../lib/handles";

const copy = (text, label) => navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`), () => toast.error("Copy failed"));

const Details = ({ row }) => (
  <div className="min-w-0 space-y-5">
    {row.lite && <p className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/30" data-testid="runner-lite-badge"><Zap className="h-3.5 w-3.5" />UPI Lite · wallet top-up {row.liteLoad} ({formatINR(row.liteLoadTotal)} needed)</p>}
    {row.lite && row.liteLoadStart && row.status === "pending" && <p className="rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-800 dark:text-amber-200" data-testid="runner-lite-topup">Top up your UPI Lite wallet with at least {formatINR(row.liteLoadTotal)} before this payment.</p>}
    <div><p className="eyebrow">Amount</p><p className="mt-1 font-mono text-5xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-300 sm:text-6xl" data-testid="runner-amount">{formatINR(row.amountPaise)}</p>
      {row.parts.length > 1 && <p className="mt-1 font-mono text-xs text-muted-foreground">merged: {row.parts.map((p) => formatINR(p.paise)).join(" + ")}</p>}</div>
    <div><p className="eyebrow">Name</p><p className="mt-1 text-xl text-foreground font-medium" data-testid="runner-name">{row.name || <span className="text-muted-foreground">—</span>}</p></div>
    <div><p className="eyebrow">{row.kind === "vpa" ? "UPI ID" : "Mobile number"}</p><p className="mt-1 break-all font-mono text-lg text-foreground font-semibold" data-testid="runner-identifier">{row.identifier}</p>
      {isUnusualHandle(row.identifier) && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300" data-testid="runner-handle-warning">Unusual bank handle — double-check the spelling</p>}</div>
    {row.note && <div><p className="eyebrow">Description</p><p className="mt-1 text-sm text-muted-foreground" data-testid="runner-note">{row.note}</p></div>}
    <div><p className="eyebrow">Last 4 — match on your phone</p><p className="mt-1 font-mono text-4xl font-bold tracking-[0.3em] text-foreground" data-testid="runner-last4">{lastFour(row.identifier)}</p></div>
  </div>
);

const Phone = ({ row }) => (
  <div className="flex w-full max-w-[300px] flex-col justify-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-6" data-testid="runner-phone-panel">
    <Smartphone className="h-6 w-6 text-cyan-600 dark:text-cyan-300" aria-hidden="true" />
    <p className="font-medium text-foreground">Pay to mobile number in your app</p>
    <p className="text-xs text-muted-foreground">No @bank is guessed. Check the name your app shows is the person you meant.</p>
    <Button variant="outline" onClick={() => copy(row.identifier, "Number")} data-testid="copy-number-button" aria-label={`Copy mobile number ${row.identifier}`}><Copy className="mr-2 h-4 w-4" aria-hidden="true" />Copy number</Button>
    <Button variant="outline" onClick={() => copy(paiseToPlain(row.amountPaise), "Amount")} data-testid="copy-amount-button" aria-label="Copy payment amount"><Copy className="mr-2 h-4 w-4" aria-hidden="true" />Copy amount</Button>
  </div>
);

const Gate = ({ row, onCheck }) => (
  <div className="flex w-full max-w-[300px] flex-col justify-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-6" data-testid="high-value-gate" role="alertdialog" aria-label="High-value payment confirmation required">
    <ShieldAlert className="h-6 w-6 text-amber-500 dark:text-amber-300" aria-hidden="true" />
    <p className="font-medium text-foreground">High-value payment</p>
    <p className="text-sm text-muted-foreground">{formatINR(row.amountPaise)} to …{lastFour(row.identifier)}. Read it aloud, then confirm.</p>
    <Button onClick={onCheck} className="bg-amber-500 text-black hover:bg-amber-400 font-semibold" data-testid="high-value-confirm-button" aria-label={`Confirm payment of ${formatINR(row.amountPaise)} to ${row.identifier}`}>I've checked — show {row.kind === "vpa" ? "QR" : "details"}</Button>
  </div>
);

const Done = ({ row }) => (
  <div
    className={`grid w-full max-w-[300px] place-items-center rounded-lg border p-6 text-center ${row.status === "paid" ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"}`}
    data-testid="runner-done-panel"
    role="status"
    aria-live="polite"
    aria-label={row.status === "paid" ? "Payment marked as paid" : `Payment failed: ${row.failReason || "unknown reason"}`}
  >
    <div><Badge tone={row.status === "paid" ? "green" : "red"}>{row.status === "paid" ? "PAID ✅" : "FAILED"}</Badge>
      {row.failReason && <p className="mt-3 font-mono text-sm text-foreground">{row.failReason}</p>}
      <p className="mt-2 text-xs text-muted-foreground">QR hidden. Press U to undo.</p></div>
  </div>
);

export const PayTarget = ({ row, high, checked, onCheck }) => {
  let side;
  if (row.status !== "pending") side = <Done row={row} />;
  else if (high && !checked) side = <Gate row={row} onCheck={onCheck} />;
  else if (row.kind === "phone") side = <Phone row={row} />;
  else side = (
    <div
      className="rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5"
      data-testid="runner-qr"
      role="img"
      aria-label={`UPI QR code for ${row.identifier}, amount ${formatINR(row.amountPaise)}`}
    >
      <QRCodeSVG value={buildUpiUri(row, row.note || "Batch payout")} size={240} level="M" className="max-w-full" />
    </div>
  );
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 md:flex-row md:items-center" key={row.id}>
      <div className="rise shrink-0 w-full md:w-auto">{side}</div>
      <Details row={row} />
    </div>
  );
};
