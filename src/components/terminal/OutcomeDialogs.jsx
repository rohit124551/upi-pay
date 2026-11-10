import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { formatINR } from "../../lib/money";

const REASONS = ["Bank timeout / server down", "Daily limit reached", "Wrong or inactive UPI ID", "Name didn't match", "Recipient asked to skip", "Other"];

export const FailDialog = ({ open, row, onClose, onConfirm }) => {
  const [reason, setReason] = useState(REASONS[0]);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-testid="fail-dialog">
        <DialogHeader>
          <DialogTitle>Why did it fail?</DialogTitle>
          <DialogDescription>{row.identifier} · {formatINR(row.amountPaise)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {REASONS.map((r, i) => (
            <button key={r} type="button" onClick={() => setReason(r)} data-testid={`fail-reason-${i}`}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${reason === r ? "border-red-500/50 bg-red-500/10 text-red-200" : "border-border hover:bg-white/[0.03]"}`}>{r}</button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} data-testid="fail-cancel-button">Cancel</Button>
          <Button variant="destructive" onClick={() => onConfirm(reason)} data-testid="fail-confirm-button">Mark failed</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
