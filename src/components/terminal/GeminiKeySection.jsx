import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FREE_MODELS, getGemini, saveGemini, aiPost } from "../../lib/gemini";

export const GeminiKeySection = ({ open }) => {
  const [cfg, setCfg] = useState(getGemini);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setCfg(getGemini()); }, [open]);

  const save = (next) => { setCfg(next); saveGemini(next); };
  const test = async () => {
    setBusy(true);
    try {
      await aiPost("/ai/test-key", {}, cfg);
      saveGemini(cfg);
      toast.success("Gemini key works and is saved in this browser");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Key test failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-border p-3" data-testid="gemini-key-section">
      <p className="flex items-center gap-2 text-sm font-medium"><KeyRound className="h-4 w-4 text-cyan-300" />Your own Gemini API key (free)</p>
      <p className="text-xs text-slate-400">
        Get a free key at{" "}
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-cyan-300 underline" data-testid="gemini-key-link">aistudio.google.com <ExternalLink className="h-3 w-3" /></a>.
        Saved only in this browser. Sent with each AI request and never stored on the server. Leave it empty to use the built-in AI.
      </p>
      <div className="flex gap-2">
        <Input type={show ? "text" : "password"} value={cfg.key} onChange={(e) => save({ ...cfg, key: e.target.value.trim() })} placeholder="AIza…" className="font-mono" autoComplete="off" data-testid="gemini-key-input" />
        <Button type="button" size="icon" variant="ghost" onClick={() => setShow((s) => !s)} data-testid="gemini-key-toggle">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
      </div>
      <Select value={cfg.model} onValueChange={(model) => save({ ...cfg, model })}>
        <SelectTrigger data-testid="gemini-model-select"><SelectValue /></SelectTrigger>
        <SelectContent>{FREE_MODELS.map(([v, l]) => <SelectItem key={v} value={v} data-testid={`gemini-model-${v}`}>{l}</SelectItem>)}</SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" disabled={!cfg.key || busy} onClick={test} data-testid="gemini-key-test">{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Test key</Button>
        {cfg.key && <Button type="button" size="sm" variant="ghost" className="text-red-300" onClick={() => save({ ...cfg, key: "" })} data-testid="gemini-key-remove">Remove key</Button>}
        <span className="ml-auto self-center text-xs text-slate-500" data-testid="gemini-key-status">{cfg.key ? "Using your key" : "Using built-in AI"}</span>
      </div>
    </div>
  );
};
