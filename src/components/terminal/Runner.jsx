import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { PayTarget } from "./PayTarget";
import { FailDialog } from "./OutcomeDialogs";
import { RunnerActions } from "./RunnerActions";

const RESET = { status: "pending", failReason: null, doneAt: null };

const firstPending = (rows, from = 0) => {
  const i = rows.findIndex((r, idx) => idx >= from && r.status === "pending");
  return i === -1 ? rows.findIndex((r) => r.status === "pending") : i;
};

export const Runner = ({ rows, settings, onUpdate }) => {
  const [idx, setIdx] = useState(() => Math.max(0, firstPending(rows)));
  const [failOpen, setFailOpen] = useState(false);
  const [checked, setChecked] = useState({});
  const cooldown = useRef(0);

  if (!rows || rows.length === 0) {
    return (
      <div className="panel p-8 text-center text-muted-foreground font-mono text-sm">
        No recipients in this view.
      </div>
    );
  }

  const safeIdx = Math.min(Math.max(0, idx), rows.length - 1);
  const row = rows[safeIdx];
  const high = row ? row.amountPaise >= settings.highValuePaise : false;
  const ready = row ? row.status === "pending" && (!high || checked[row.id]) : false;

  const doneCount = rows.filter((r) => r.status !== "pending").length;
  const progressPct = rows.length > 0 ? Math.round((doneCount / rows.length) * 100) : 0;

  const finish = (change, msg) => {
    const id = row.id;
    onUpdate(id, { ...change, doneAt: new Date().toISOString() });
    cooldown.current = Date.now() + 800;
    setFailOpen(false);
    toast.success(msg, { action: { label: "Undo", onClick: () => onUpdate(id, RESET) } });
    const next = firstPending(rows.map((r) => (r.id === id ? { ...r, status: "done" } : r)), idx + 1);
    if (next !== -1) setIdx(next);
  };
  const markPaid = () => {
    if (Date.now() < cooldown.current) return;
    document.activeElement?.blur();
    finish({ status: "paid" }, `Marked paid: ${row.identifier}`);
  };
  const undo = () => {
    onUpdate(row.id, RESET);
    setChecked((c) => ({ ...c, [row.id]: false }));
    toast(`Undone: ${row.identifier} is pending again`);
  };
  const go = (d) => setIdx((i) => Math.min(rows.length - 1, Math.max(0, i + d)));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter" && Date.now() < cooldown.current) { e.preventDefault(); return; }
      if (failOpen || Date.now() < cooldown.current || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector("[role=dialog],[role=alertdialog]")) return;
      if (e.key === "Enter" && ready) { e.preventDefault(); markPaid(); }
      else if (e.key.toLowerCase() === "e" && row.status === "pending") setFailOpen(true);
      else if (e.key.toLowerCase() === "u" && row.status !== "pending") undo();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <section className="panel overflow-hidden" data-testid="runner">
      {/* Visual progress bar across top */}
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800/80 overflow-hidden" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400" data-testid="runner-position">
          Recipient {idx + 1} of {rows.length} <span className="text-slate-300 dark:text-slate-600">·</span>{" "}
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{doneCount}/{rows.length} done ({progressPct}%)</span>
        </span>
        <div className="ml-auto flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => go(-1)} disabled={idx === 0} data-testid="runner-prev-button"><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" onClick={() => go(1)} disabled={idx === rows.length - 1} data-testid="runner-next-button"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <PayTarget row={row} high={high} checked={!!checked[row.id]} onCheck={() => setChecked((c) => ({ ...c, [row.id]: true }))} />
      <RunnerActions row={row} ready={ready} onPaid={markPaid} onFail={() => setFailOpen(true)} onUndo={undo} />
      <FailDialog open={failOpen} row={row} onClose={() => setFailOpen(false)} onConfirm={(failReason) => finish({ status: "failed", failReason }, `Marked failed: ${row.identifier}`)} />
    </section>
  );
};
