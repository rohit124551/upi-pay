import { useMemo, useState } from "react";
import { aiPost, aiLabel } from "../../lib/gemini";
import { toast } from "sonner";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { maskLines, validateSuggestion } from "../../lib/mask";
import { formatINR } from "../../lib/money";


const Suggestion = ({ s, line, onAccept, onReject }) => (
  <li className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 py-3" data-testid={`ai-suggestion-${s.line_no}`}>
    <p className="font-mono text-xs text-slate-400">L{s.line_no} · {line?.text}</p>
    {s.ok ? (
      <p className="font-mono text-sm"><span className="text-slate-100">{s.entry.identifier}</span> <span className="text-emerald-300">{formatINR(s.entry.paise)}</span>{s.entry.name && <span className="text-slate-400"> · {s.entry.name}</span>}</p>
    ) : <p className="text-xs text-red-300">Rejected: {s.reason}</p>}
    <div className="flex gap-1">
      {s.ok && <Button size="sm" onClick={onAccept} data-testid={`ai-accept-${s.line_no}`}><Check className="h-4 w-4" /></Button>}
      <Button size="sm" variant="ghost" onClick={onReject} data-testid={`ai-reject-${s.line_no}`}><X className="h-4 w-4" /></Button>
    </div>
  </li>
);

export const AiAssist = ({ lines, onAccept }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);
  const { masked, tokens } = useMemo(() => maskLines(lines), [lines]);

  const send = async () => {
    setBusy(true);
    try {
      const { data } = await aiPost("/ai/resolve", { lines: masked });
      setResults(data.entries.map((s) => ({ ...s, ...validateSuggestion(s, masked, tokens) })));
    } catch (e) {
      toast.error(e.response?.data?.detail || "AI helper failed. Fix the lines by hand.");
    } finally {
      setBusy(false);
    }
  };
  const drop = (lineNo) => setResults((r) => r.filter((x) => x.line_no !== lineNo));

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setResults(null); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-cyan-500/40 text-cyan-300" data-testid="ai-fix-button"><Sparkles className="mr-2 h-4 w-4" />Fix unclear lines with AI</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl" data-testid="ai-dialog">
        <DialogHeader>
          <DialogTitle>Masked AI help</DialogTitle>
          <DialogDescription>Only the text below is sent, using {aiLabel()} (Google Gemini). Real UPI IDs and numbers stay on your computer. Every answer is checked against your text before you can accept it.</DialogDescription>
        </DialogHeader>
        {!results ? (
          <>
            <pre className="max-h-64 overflow-auto rounded-md border border-border bg-[#0A0F1A] p-4 font-mono text-xs leading-6 text-slate-300" data-testid="ai-masked-preview">{masked.map((m) => `${m.line_no}: ${m.text}`).join("\n")}</pre>
            <Button onClick={send} disabled={busy} data-testid="ai-send-button">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Send masked lines</Button>
          </>
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-auto" data-testid="ai-results">
            {results.length === 0 && <li className="py-6 text-center text-sm text-slate-400">No more suggestions.</li>}
            {results.map((s) => (
              <Suggestion key={s.line_no} s={s} line={masked.find((m) => m.line_no === s.line_no)}
                onAccept={() => { onAccept(s.entry); drop(s.line_no); toast.success(`Line ${s.line_no} added`); }}
                onReject={() => drop(s.line_no)} />
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};
