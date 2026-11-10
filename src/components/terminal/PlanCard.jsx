import { Lock, Play } from "lucide-react";
import { Button } from "../ui/button";
import { formatINR } from "../../lib/money";

export const PlanCard = ({ rows, canStart, recon, onStart }) => (
  <aside className="panel h-fit p-5 xl:sticky xl:top-24" data-testid="plan-card">
    <p className="eyebrow">Ready to pay</p>
    <p className="mt-2 font-mono text-3xl font-semibold text-emerald-300" data-testid="plan-total">{formatINR(recon.finalPaise)}</p>
    <p className="mt-1 font-mono text-sm text-slate-400" data-testid="plan-count">{rows.length} recipients</p>
    <Button size="lg" className="mt-5 w-full" disabled={!canStart} onClick={onStart} data-testid="start-paying-button"><Play className="mr-2 h-4 w-4" />Start paying</Button>
    <p className="mt-3 flex items-start gap-2 text-xs text-slate-500"><Lock className="mt-0.5 h-3 w-3 shrink-0" />
      {canStart ? "The list locks when you start, so nothing changes mid-run." : recon.openLines > 0 ? "Decide on every unclear line first." : "Accept the totals difference first."}
    </p>
  </aside>
);
