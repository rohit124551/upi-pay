import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { formatINR } from "../../lib/money";

const Cell = ({ label, value, tone = "text-foreground", testId }) => (
  <div className="px-5 py-4">
    <p className="eyebrow">{label}</p>
    <p className={`mt-2 font-mono text-2xl font-semibold tracking-tight ${tone}`} data-testid={testId}>{value}</p>
  </div>
);

export const ReconCard = ({ recon, accepted, onAccept }) => {
  const { sourcePaise, finalPaise, unreadPaise, declaredTotalPaise, declaredDiff, balanced, openLines } = recon;
  return (
    <section className={`panel overflow-hidden ${balanced ? "ring-1 ring-emerald-500/30" : "ring-1 ring-amber-500/40"}`} data-testid="recon-card">
      <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
        <Cell label="Found in pasted text" value={formatINR(sourcePaise)} testId="recon-source-total" />
        <Cell label="Final list to pay" value={formatINR(finalPaise)} tone="text-emerald-600 dark:text-emerald-300" testId="recon-final-total" />
        <Cell label="In unread lines" value={formatINR(unreadPaise)} tone={unreadPaise ? "text-amber-600 dark:text-amber-300" : "text-muted-foreground"} testId="recon-unread-total" />
        <Cell label="Total written in text" value={declaredTotalPaise == null ? "—" : formatINR(declaredTotalPaise)} tone={declaredDiff ? "text-red-500 dark:text-red-400" : "text-muted-foreground"} testId="recon-declared-total" />
      </div>
      <div className={`flex flex-wrap items-center gap-3 border-t border-border px-5 py-3 text-sm ${balanced ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200" : "bg-amber-500/10 text-amber-900 dark:text-amber-200"}`} data-testid="recon-status">
        {balanced ? (
          <><CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" /><span>Totals match. Every rupee in the text is in the list.</span></>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <span>
              {unreadPaise > 0 && `Numbers worth ${formatINR(unreadPaise)} sit in lines the rules couldn't read. `}
              {declaredDiff !== 0 && `The text says ${formatINR(declaredTotalPaise)} but the list adds up to ${formatINR(finalPaise)} — the list is ${formatINR(Math.abs(declaredDiff))} ${declaredDiff < 0 ? "more" : "less"} than the written total. `}
              {openLines > 0 && `${openLines} line(s) still need a decision.`}
            </span>
            <label className="ml-auto flex cursor-pointer items-center gap-2 font-medium">
              <Checkbox checked={accepted} onCheckedChange={(v) => onAccept(!!v)} data-testid="accept-mismatch-checkbox" />
              I've checked the difference and accept it
            </label>
          </>
        )}
      </div>
    </section>
  );
};
