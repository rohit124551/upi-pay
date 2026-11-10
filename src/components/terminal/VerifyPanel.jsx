import { useMemo, useState } from "react";
import { aiPost, aiLabel } from "../../lib/gemini";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldQuestion, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { maskForVerify, textToSourceLines } from "../../lib/mask";


const PassResult = ({ p, i, unmask }) => (
  <div className={`rounded-md border px-4 py-3 ${p.all_correct ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"}`} data-testid={`verify-pass-${i + 1}`}>
    <p className="flex items-center gap-2 text-sm font-medium">
      {p.all_correct ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
      AI check {i + 1}: {p.all_correct ? "everything matches" : `${p.issues.length} issue(s)`}
    </p>
    {p.issues.map((x, j) => (
      <p key={j} className="mt-1.5 font-mono text-xs text-red-200">{x.line_no ? `L${x.line_no} ` : ""}{x.row_ref ? `${unmask(x.row_ref)} · ` : ""}{unmask(x.problem)}</p>
    ))}
  </div>
);

export const VerifyStatus = ({ verify }) => {
  if (!verify) return <span className="text-xs text-slate-500" data-testid="verify-status">Not double-checked yet</span>;
  const ok = verify.passes.every((p) => p.all_correct);
  return <span className={`text-xs ${ok ? "text-emerald-300" : "text-red-300"}`} data-testid="verify-status">{ok ? "AI checked twice: all correct" : "AI found issues — review them"}</span>;
};

export const VerifyPanel = ({ batch, rows, onResult }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const sourceLines = batch.sourceLines || textToSourceLines(batch.raw);
  const payload = useMemo(() => maskForVerify(sourceLines, rows), [sourceLines, rows]);
  const ignored = batch.unclear.filter((u) => u.ignored).map((u) => u.lineNo);

  const run = async () => {
    setBusy(true);
    try {
      const { data } = await aiPost("/ai/verify", { source: payload.source, rows: payload.rows, ignored_lines: ignored });
      onResult({ passes: data.passes, at: new Date().toISOString() });
    } catch (e) {
      toast.error(e.response?.data?.detail || "AI check failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="border-cyan-500/40 text-cyan-300" data-testid="verify-ai-button"><ShieldQuestion className="mr-2 h-4 w-4" />Double-check with AI</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl" data-testid="verify-dialog">
          <DialogHeader>
            <DialogTitle>AI double-check (2 independent passes)</DialogTitle>
            <DialogDescription>Using {aiLabel()}, the AI compares your pasted text with the final list twice. Personal parts of UPI IDs and numbers are hidden; bank handles (like @okaxis) are kept so spelling mistakes can be caught.</DialogDescription>
          </DialogHeader>
          <pre className="max-h-48 overflow-auto rounded-md border border-border bg-[#0A0F1A] p-3 font-mono text-[11px] leading-5 text-slate-400" data-testid="verify-masked-preview">
            {payload.source.map((l) => `${l.line_no}: ${l.text}`).join("\n")}{"\n\n"}{payload.rows.map((r) => `${r.ref}: ${r.identifier} ${r.amount}`).join("\n")}
          </pre>
          <Button onClick={run} disabled={busy} data-testid="verify-send-button">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldQuestion className="mr-2 h-4 w-4" />}{busy ? "Checking twice…" : "Run both checks"}</Button>
          {batch.verify && <div className="space-y-2">{batch.verify.passes.map((p, i) => <PassResult key={i} p={p} i={i} unmask={payload.unmask} />)}</div>}
        </DialogContent>
      </Dialog>
      <VerifyStatus verify={batch.verify} />
    </div>
  );
};
