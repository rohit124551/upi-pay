import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { DEFAULT_SETTINGS } from "../../hooks/useBatch";
import { GeminiKeySection } from "./GeminiKeySection";

const Field = ({ label, value, onChange, testId }) => (
  <label className="block">
    <span className="text-xs text-slate-400">{label}</span>
    <Input type="number" min="1" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 font-mono" data-testid={testId} />
  </label>
);

export const SettingsDialog = ({ open, onOpenChange, settings, onSave }) => {
  const [f, setF] = useState({});
  useEffect(() => {
    if (open) setF({ high: settings.highValuePaise / 100, liteTx: settings.liteTxMaxPaise / 100, wallet: settings.liteWalletPaise / 100, aiOffered: settings.aiOffered });
  }, [open, settings]);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const high = Math.floor(+f.high);
  const liteTx = Math.floor(+f.liteTx);
  const wallet = Math.floor(+f.wallet);
  const valid = high >= 1 && liteTx >= 1 && wallet >= liteTx;
  const save = () => {
    onSave({ highValuePaise: high * 100, liteTxMaxPaise: liteTx * 100, liteWalletPaise: wallet * 100, aiOffered: f.aiOffered });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="settings-dialog">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Saved in this browser.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Ask twice at or above (₹)" value={f.high ?? ""} onChange={set("high")} testId="settings-high-value" />
          <Field label="UPI Lite: max per payment (₹)" value={f.liteTx ?? ""} onChange={set("liteTx")} testId="settings-lite-tx-max" />
          <Field label="UPI Lite: max wallet balance (₹)" value={f.wallet ?? ""} onChange={set("wallet")} testId="settings-lite-wallet" />
          {!valid && <p className="text-xs text-red-300" data-testid="settings-amount-error">Use amounts of at least ₹1, and a wallet no smaller than the per-payment max.</p>}
          <label className="flex items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm">
            Offer masked AI help for unclear lines
            <Switch checked={!!f.aiOffered} onCheckedChange={set("aiOffered")} data-testid="settings-ai-switch" />
          </label>
          <GeminiKeySection open={open} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onSave(DEFAULT_SETTINGS) || onOpenChange(false)} data-testid="settings-reset-button">Reset</Button>
          <Button onClick={save} disabled={!valid} data-testid="settings-save-button">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
