import { EyeOff, Undo2 } from "lucide-react";
import { Button } from "../ui/button";
import { AiAssist } from "./AiAssist";

const Line = ({ u, onIgnore }) => (
  <li className={`flex items-center gap-4 px-5 py-3 transition-opacity ${u.ignored ? "opacity-45" : ""}`} data-testid={`unclear-line-${u.lineNo}`}>
    <span className="w-10 shrink-0 font-mono text-xs text-slate-500">L{u.lineNo}</span>
    <div className="min-w-0 flex-1">
      <p className="truncate font-mono text-sm text-slate-100">{u.raw}</p>
      <p className="mt-0.5 text-xs text-amber-300/90">{u.ignored ? "Ignored — not a payment" : u.reason}</p>
    </div>
    <Button variant="ghost" size="sm" onClick={() => onIgnore(u.lineNo, !u.ignored)} data-testid={`unclear-ignore-${u.lineNo}`}>
      {u.ignored ? <><Undo2 className="mr-1.5 h-3.5 w-3.5" />Restore</> : <><EyeOff className="mr-1.5 h-3.5 w-3.5" />Not a payment</>}
    </Button>
  </li>
);

export const UnclearLines = ({ unclear, onIgnore, onAcceptAi, aiOffered }) => {
  if (!unclear.length) return null;
  const open = unclear.filter((u) => !u.ignored);
  return (
    <section className="panel ring-1 ring-amber-500/25" data-testid="unclear-lines-panel">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-base font-semibold md:text-lg">Lines the rules couldn't read <span className="font-mono text-amber-300">({unclear.length})</span></h2>
          <p className="text-xs text-slate-400">Mark each as "not a payment", get masked AI help, or edit the text and clean up again.</p>
        </div>
        {aiOffered && open.length > 0 && <div className="ml-auto"><AiAssist lines={open} onAccept={onAcceptAi} /></div>}
      </div>
      <ul className="divide-y divide-border">{unclear.map((u) => <Line key={u.lineNo} u={u} onIgnore={onIgnore} />)}</ul>
    </section>
  );
};
