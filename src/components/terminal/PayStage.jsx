import { useState } from "react";
import { CheckCircle2, Copy, Download, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Runner } from "./Runner";
import { StatusBoard } from "./StatusBoard";
import { groupRows } from "./RowsTable";
import { formatINR, sumPaise } from "../../lib/money";
import { toCSV, toTSV, downloadFile } from "../../lib/csv";

const GroupTabs = ({ groups, active, onPick }) => (
  <div className="flex flex-wrap gap-2" data-testid="group-tabs">
    {groups.map((g) => {
      const done = g.rows.filter((r) => r.status !== "pending").length;
      const on = active === g.key;
      const lite = g.key === "lite";
      return (
        <button
          key={g.key}
          onClick={() => onPick(g.key)}
          data-testid={`group-tab-${g.key}`}
          className={`rounded-md border px-4 py-2 text-left transition-colors ${
            on
              ? lite
                ? "border-violet-500/50 bg-violet-500/10"
                : "border-emerald-500/50 bg-emerald-500/10"
              : "border-border hover:bg-white/[0.03]"
          }`}
        >
          <p className={`flex items-center gap-1.5 text-sm font-medium ${lite ? "text-violet-200" : ""}`}>
            {lite && <Zap className="h-3.5 w-3.5" />}
            {g.title}
          </p>
          <p className="font-mono text-[11px] text-slate-400">
            {done}/{g.rows.length} done · {formatINR(sumPaise(g.rows, (r) => r.amountPaise))}
          </p>
        </button>
      );
    })}
  </div>
);

const BatchCompletionCard = ({ rows, onClear }) => {
  const stamp = new Date().toISOString().slice(0, 10);
  const paidRows = rows.filter((r) => r.status === "paid");
  const failedRows = rows.filter((r) => r.status === "failed");
  const paidPaise = sumPaise(paidRows, (r) => r.amountPaise);
  const failedPaise = sumPaise(failedRows, (r) => r.amountPaise);
  const successPct = rows.length > 0 ? Math.round((paidRows.length / rows.length) * 100) : 0;

  const copyPaid = () => {
    if (!paidRows.length) {
      toast.info("No paid rows to copy");
      return;
    }
    navigator.clipboard.writeText(toTSV(paidRows)).then(
      () => toast.success(`Copied ${paidRows.length} paid rows to clipboard`),
      () => toast.error("Copy failed")
    );
  };

  const downloadFinalCsv = () => {
    downloadFile(`payouts-final-${stamp}.csv`, toCSV(rows));
    toast.success("Final payouts CSV downloaded");
  };

  return (
    <div
      className="panel border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-background to-amber-500/5 p-6 sm:p-7 space-y-5 shadow-lg rise"
      data-testid="batch-completion-card"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              All {rows.length} Payouts Resolved!
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                100% Processed
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Every recipient in this batch has been scanned and marked. Review summary below or export reports.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            onClick={downloadFinalCsv}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs"
            data-testid="completion-download-csv"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Download Final CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={copyPaid}
            className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
            data-testid="completion-copy-paid"
          >
            <Copy className="mr-1.5 h-4 w-4" />
            Copy Paid ({paidRows.length})
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
            data-testid="completion-start-new"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Start New Batch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/80 pt-4 font-mono">
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <p className="eyebrow">Paid Volume</p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatINR(paidPaise)}
          </p>
          <p className="text-[11px] text-muted-foreground">{paidRows.length} successful</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <p className="eyebrow">Success Rate</p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-foreground">{successPct}%</p>
          <p className="text-[11px] text-muted-foreground">{paidRows.length} of {rows.length} cleared</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <p className="eyebrow">Errors / Declined</p>
          <p className={`mt-1 text-lg sm:text-xl font-bold ${failedRows.length > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
            {formatINR(failedPaise)}
          </p>
          <p className="text-[11px] text-muted-foreground">{failedRows.length} failed</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/50 p-3">
          <p className="eyebrow">Total Batch Size</p>
          <p className="mt-1 text-lg sm:text-xl font-bold text-foreground">{rows.length} recipients</p>
          <p className="text-[11px] text-muted-foreground">{formatINR(paidPaise + failedPaise)} total</p>
        </div>
      </div>
    </div>
  );
};

export const PayStage = ({ store }) => {
  const { rows } = store;
  const groups = [{ key: "all", title: "Everyone", rows }, ...groupRows(rows)];
  const [active, setActive] = useState("all");
  const current = groups.find((g) => g.key === active) || groups[0];

  const allResolved = rows.length > 0 && rows.every((r) => r.status !== "pending");

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="eyebrow">Step 3 · list locked</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Pay one at a time</h1>
        <p className="mt-2 text-sm text-slate-400">
          Payments up to ₹1,000 can go from your UPI Lite wallet (max ₹5,000 balance, so top up when prompted). Everything else goes through regular UPI.
        </p>
      </div>

      {allResolved && <BatchCompletionCard rows={rows} onClear={store.clear} />}

      <GroupTabs groups={groups} active={current.key} onPick={setActive} />
      <Runner key={current.key} rows={current.rows} settings={store.settings} onUpdate={store.updateRow} />
      <StatusBoard rows={rows} />
    </div>
  );
};
