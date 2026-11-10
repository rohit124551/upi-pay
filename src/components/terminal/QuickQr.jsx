import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AlertTriangle, QrCode } from "lucide-react";
import { Input } from "../ui/input";
import { lineFacts, parseAmountString } from "../../lib/parser";
import { buildUpiUri, lastFour } from "../../lib/upi";
import { isUnusualHandle } from "../../lib/handles";
import { formatINR } from "../../lib/money";
import { QrShareButtons } from "./QrShareButtons";

const Field = ({ label, testId, ...props }) => (
  <label className="block">
    <span className="eyebrow">{label}</span>
    <Input
      className="mt-2 h-12 bg-slate-50 dark:bg-[#0A0F1A] text-foreground border-border font-mono text-base"
      data-testid={testId}
      {...props}
    />
  </label>
);

const read = ({ id, amount }) => {
  const f = lineFacts(id);
  // Only accept actual UPI IDs (VPA with @bank), not plain numbers
  const target =
    f.ids.length === 1 && !f.digitsLeft && !f.hasAt && f.ids[0].kind === "vpa"
      ? f.ids[0]
      : null;
  const paise = amount.trim() ? parseAmountString(amount) : null;
  return { target, paise, amountBad: !!amount.trim() && !paise };
};

const Result = ({ target, paise, name, note }) => {
  const uri = buildUpiUri({ identifier: target.identifier, name, amountPaise: paise }, note);
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div
        className="shrink-0 rounded-lg bg-white p-4 shadow-md rise"
        data-testid="quick-qr"
        role="img"
        aria-label={`QR code to pay ${target.identifier}`}
      >
        <QRCodeSVG value={uri} size={220} level="M" />
      </div>
      <div className="min-w-0 w-full space-y-3">
        <p
          className="font-mono text-3xl sm:text-4xl font-semibold text-emerald-600 dark:text-emerald-300"
          data-testid="quick-amount"
        >
          {paise ? formatINR(paise) : "Any amount"}
        </p>
        <p className="font-mono text-sm text-slate-700 dark:text-slate-300 break-all">
          {target.identifier} · last 4{" "}
          <span className="text-lg font-bold tracking-widest text-foreground">
            {lastFour(target.identifier)}
          </span>
        </p>
        {isUnusualHandle(target.identifier) && (
          <p
            className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300"
            data-testid="quick-handle-warning"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Unusual bank handle — double-check the spelling
          </p>
        )}
        <QrShareButtons
          uri={uri}
          card={{
            amount: paise ? formatINR(paise) : null,
            amountPaise: paise,
            name,
            identifier: target.identifier,
            note,
          }}
        />
      </div>
    </div>
  );
};

export const QuickQr = () => {
  const [f, setF] = useState({ id: "", name: "", amount: "", note: "" });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const { target, paise, amountBad } = read(f);
  const showQr = !!target && !amountBad;

  return (
    <div className="mx-auto max-w-3xl space-y-6 rise">
      <div>
        <p className="eyebrow">Quick QR</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          One-off payment
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Type a UPI ID. The QR updates as you type.
        </p>
      </div>
      <div className="panel space-y-5 p-6">
        <Field
          label="UPI ID *"
          value={f.id}
          onChange={set("id")}
          placeholder="rahul@okaxis"
          autoFocus
          testId="quick-id-input"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Recipient name (optional)"
            value={f.name}
            onChange={set("name")}
            placeholder="Rahul Verma"
            testId="quick-name-input"
          />
          <div>
            <Field
              label="Amount in ₹ (optional)"
              value={f.amount}
              onChange={set("amount")}
              placeholder="4,250"
              testId="quick-amount-input"
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground mr-0.5">Quick:</span>
              {[100, 200, 500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setF((s) => ({ ...s, amount: String(amt) }))}
                  className="rounded-md border border-border/70 bg-slate-100/60 dark:bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Field
          label="Description (optional)"
          value={f.note}
          onChange={set("note")}
          placeholder="Dinner share"
          testId="quick-note-input"
        />
        {amountBad && (
          <p className="text-xs text-red-500 dark:text-red-300" data-testid="quick-amount-error">
            Can't read that amount. Try digits like 4250 or 4,250.00.
          </p>
        )}
      </div>
      {showQr ? (
        <div className="panel p-6" data-testid="quick-result">
          <Result
            target={target}
            paise={paise}
            name={f.name.trim() || null}
            note={f.note.trim() || null}
          />
        </div>
      ) : (
        <div
          className="panel flex h-48 flex-col items-center justify-center text-center text-muted-foreground"
          data-testid="quick-placeholder"
        >
          <QrCode className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm">Enter a valid UPI ID above</p>
        </div>
      )}
    </div>
  );
};
