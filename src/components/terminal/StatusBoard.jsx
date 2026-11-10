import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "./Badge";
import { ExportBar } from "./ExportBar";
import { formatINR, sumPaise } from "../../lib/money";

const FILTERS = { all: () => true, lite: (r) => r.lite, pending: (r) => r.status === "pending", paid: (r) => r.status === "paid", failed: (r) => r.status === "failed" };
const SORTS = { order: null, "amount-desc": (a, b) => b.amountPaise - a.amountPaise, "amount-asc": (a, b) => a.amountPaise - b.amountPaise, name: (a, b) => (a.name || a.identifier).localeCompare(b.name || b.identifier), status: (a, b) => a.status.localeCompare(b.status) };
const TONE = { pending: "slate", paid: "green", failed: "red" };

const Stat = ({ k, rows, tone }) => {
  const list = rows.filter(FILTERS[k]);
  return (
    <div className="px-5 py-4" data-testid={`stat-${k}`}>
      <p className="eyebrow">{k === "lite" ? "UPI Lite" : k}</p>
      <p className={`mt-1 font-mono text-xl font-semibold ${tone}`}>{formatINR(sumPaise(list, (r) => r.amountPaise))}</p>
      <p className="font-mono text-xs text-muted-foreground">{list.length} rows</p>
    </div>
  );
};

export const StatusBoard = ({ rows }) => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("order");
  const shown = rows.filter(FILTERS[filter]);
  if (SORTS[sort]) shown.sort(SORTS[sort]);
  return (
    <section className="panel overflow-hidden" data-testid="status-board">
      <div className="grid grid-cols-2 divide-border border-b border-border md:grid-cols-5 md:divide-x">
        <Stat k="all" rows={rows} tone="text-foreground" />
        <Stat k="paid" rows={rows} tone="text-emerald-600 dark:text-emerald-300" />
        <Stat k="pending" rows={rows} tone="text-muted-foreground" />
        <Stat k="failed" rows={rows} tone="text-red-600 dark:text-red-300" />
        <Stat k="lite" rows={rows} tone="text-violet-600 dark:text-violet-300" />
      </div>
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 bg-slate-50/50 dark:bg-card">
        {Object.keys(FILTERS).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            data-testid={`filter-${f}`}
            className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
              filter === f
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "lite" ? "UPI Lite" : f}
          </button>
        ))}
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="ml-2 h-8 w-44 text-xs" data-testid="sort-select"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.keys(SORTS).map((s) => <SelectItem key={s} value={s} data-testid={`sort-${s}`}>{s.replace("-", " ")}</SelectItem>)}</SelectContent>
        </Select>
        <div className="ml-auto"><ExportBar rows={rows} /></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border border-t border-border">
            {shown.map((r) => (
              <tr key={r.id} data-testid={`status-row-${r.id}`} className="hover:bg-slate-100/50 dark:hover:bg-white/[0.02]">
                <td className="px-5 py-2.5 font-mono text-foreground font-medium">{r.identifier}</td>
                <td className="py-2.5 text-muted-foreground">{r.name || "—"}</td>
                <td className="py-2.5 text-right font-mono text-foreground font-semibold">{formatINR(r.amountPaise)}</td>
                <td className="px-3 py-2.5">{r.lite && <Badge tone="violet">UPI Lite</Badge>}</td>
                <td className="px-5 py-2.5 text-right"><Badge tone={TONE[r.status]}>{r.status === "paid" ? "paid ✅" : r.status}</Badge></td>
                <td className="pr-5 font-mono text-xs text-muted-foreground">{r.failReason || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
