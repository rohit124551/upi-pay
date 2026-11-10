import { Merge, Zap } from "lucide-react";
import { Badge } from "./Badge";
import { formatINR, sumPaise } from "../../lib/money";
import { isUnusualHandle } from "../../lib/handles";

export const groupRows = (rows) => [
  { key: "lite", title: "UPI Lite", rows: rows.filter((r) => r.lite) },
  { key: "regular", title: "Regular UPI", rows: rows.filter((r) => !r.lite) },
].filter((g) => g.rows.length);

const Flags = ({ r, settings }) => (
  <div className="flex flex-wrap gap-1">
    {r.lite && <Badge tone="violet">UPI Lite · top-up {r.liteLoad}</Badge>}
    {r.kind === "phone" && <Badge tone="cyan">Mobile · pay in app</Badge>}
    {r.parts.length > 1 && <Badge tone="slate">Merged {r.parts.length}</Badge>}
    {r.amountPaise >= settings.highValuePaise && <Badge tone="amber">High value</Badge>}
    {r.nameConflict && <Badge tone="red">Different names</Badge>}
    {isUnusualHandle(r.identifier) && <Badge tone="amber" testId={`unusual-handle-${r.id}`}>Unusual bank handle</Badge>}
    {r.note && <Badge tone="slate">{r.note}</Badge>}
    {r.parts.some((p) => p.source === "ai") && <Badge tone="cyan">From AI</Badge>}
  </div>
);

const GroupHead = ({ g, settings }) => (
  <tr className={g.key === "lite" ? "bg-violet-500/[0.08]" : "bg-slate-100/60 dark:bg-white/[0.02]"} data-testid={`group-head-${g.key}`}>
    <td colSpan={4} className="px-5 py-2.5">
      <span className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${g.key === "lite" ? "text-violet-700 dark:text-violet-300" : "text-muted-foreground"}`}>
        {g.key === "lite" && <Zap className="h-3.5 w-3.5" />}
        {g.title} {g.key === "lite"
          ? `· up to ${formatINR(settings.liteTxMaxPaise)} each · ${Math.max(...g.rows.map((r) => r.liteLoad))} wallet top-up(s) of max ${formatINR(settings.liteWalletPaise)}`
          : `· above ${formatINR(settings.liteTxMaxPaise)}`}
        <span className="ml-auto font-mono normal-case tracking-normal">{g.rows.length} · {formatINR(sumPaise(g.rows, (r) => r.amountPaise))}</span>
      </span>
    </td>
  </tr>
);

const Row = ({ r, settings }) => (
  <tr className={`transition-colors hover:bg-slate-100/50 dark:hover:bg-white/[0.02] ${r.lite ? "border-l-2 border-l-violet-500/60" : ""}`} data-testid={`row-${r.id}`}>
    <td className="px-5 py-3 font-mono text-foreground font-medium">{r.identifier}</td>
    <td className="py-3 text-muted-foreground">{r.name || <span className="text-muted-foreground/40">—</span>}</td>
    <td className="py-3 text-right font-mono">
      <span className="font-semibold text-foreground" data-testid={`row-amount-${r.id}`}>{formatINR(r.amountPaise)}</span>
      {r.parts.length > 1 && <p className="text-[11px] text-muted-foreground">{r.parts.map((p) => formatINR(p.paise)).join(" + ")}</p>}
    </td>
    <td className="px-5 py-3"><Flags r={r} settings={settings} /></td>
  </tr>
);

export const RowsTable = ({ rows, settings, merged }) => (
  <section className="panel overflow-hidden" data-testid="rows-table">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
      <div>
        <h2 className="text-base font-semibold md:text-lg text-foreground">Final list to pay ({rows.length})</h2>
        <p className="text-xs text-muted-foreground">Each row will get one QR code to scan. Duplicates are already merged.</p>
      </div>
      {merged > 0 && <span className="inline-flex items-center gap-1.5 font-mono text-xs text-emerald-600 dark:text-emerald-300" data-testid="merged-count"><Merge className="h-3.5 w-3.5" />{merged} duplicate(s) merged</span>}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground bg-slate-50 dark:bg-card">
          <tr>
            <th className="px-5 py-2.5">Recipient</th>
            <th className="py-2.5">Name</th>
            <th className="py-2.5 text-right">Amount</th>
            <th className="px-5 py-2.5">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {groupRows(rows).map((g) => [
            <GroupHead key={`h-${g.key}`} g={g} settings={settings} />,
            ...g.rows.map((r) => <Row key={r.id} r={r} settings={settings} />),
          ])}
        </tbody>
      </table>
    </div>
  </section>
);
