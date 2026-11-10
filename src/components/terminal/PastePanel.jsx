import { ClipboardPaste, FlaskConical, Lock, Merge, ScanLine, Sigma } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { SAMPLE_TEXT } from "../../lib/sample";
import { SheetImport } from "./SheetImport";

const PROMISES = [
  [Sigma, "Totals must add up", "What you pasted is compared with what you'll pay. Any gap stops you."],
  [Merge, "Duplicates merged", "Same UPI ID twice becomes one payment, with the history kept."],
  [ScanLine, "No guessing", "Unclear lines are highlighted, never dropped. Plain numbers get no made-up @bank."],
  [Lock, "Private by default", "Everything stays in this browser. Zero server transmission."],
];

export const PastePanel = ({ draft, setDraft, onClean, onImport }) => (
  <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] rise">
    <section>
      <p className="eyebrow">Step 1</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Paste your payout list</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
        From a chat, email or sheet. UPI IDs, 10-digit numbers, names in brackets and amounts like ₹1,200, Rs 404 or 1634/- are all fine.
      </p>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={"rahul.verma42@okaxis (Rahul Verma) ₹4,250\n9999991811@ybl - 1,200/-\n..."}
        spellCheck={false}
        className="mt-6 h-[400px] resize-y bg-slate-50 dark:bg-[#0A0F1A] text-foreground font-mono text-sm leading-7 border-border shadow-inner focus-visible:ring-emerald-500"
        data-testid="paste-input"
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="lg" disabled={!draft.trim()} onClick={() => onClean(draft)} data-testid="clean-up-button">
          <ClipboardPaste className="mr-2 h-4 w-4" />Clean up
        </Button>
        <Button size="lg" variant="outline" onClick={() => setDraft(SAMPLE_TEXT)} data-testid="load-sample-button">
          <FlaskConical className="mr-2 h-4 w-4" />Load fake sample
        </Button>
        <SheetImport onImport={onImport} />
        <span className="font-mono text-xs text-muted-foreground ml-auto" data-testid="paste-line-count">
          {draft.split("\n").filter((l) => l.trim()).length} lines
        </span>
      </div>
    </section>
    <aside className="space-y-3 lg:pt-24">
      {PROMISES.map(([Icon, title, body], i) => (
        <div key={title} className="panel p-4 rise" style={{ animationDelay: `${i * 70}ms` }}>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            {title}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
        </div>
      ))}
    </aside>
  </div>
);
