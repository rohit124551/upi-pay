import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "../ui/button";

const Hint = ({ k, children }) => <span className="flex items-center gap-1.5"><kbd className="kbd">{k}</kbd>{children}</span>;

export const RunnerActions = ({ row, ready, onPaid, onFail, onUndo }) => (
  <div className="flex flex-wrap items-center gap-3 border-t border-border bg-slate-50/80 dark:bg-[#0A0F1A] px-4 py-3 sm:px-5 sm:py-4">
    {row.status === "pending" ? (
      <>
        <Button
          onClick={onPaid}
          disabled={!ready}
          data-testid="mark-paid-button"
          aria-label="Mark current payment as paid"
        >
          <Check className="mr-2 h-4 w-4" aria-hidden="true" />I paid this
        </Button>
        <Button
          variant="outline"
          onClick={onFail}
          className="border-red-500/40 text-red-600 dark:text-red-300 hover:bg-red-500/10"
          data-testid="mark-failed-button"
          aria-label="Mark current payment as failed"
        >
          <X className="mr-2 h-4 w-4" aria-hidden="true" />Failed
        </Button>
      </>
    ) : (
      <Button
        variant="outline"
        onClick={onUndo}
        data-testid="undo-button"
        aria-label="Undo payment status"
      >
        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />Undo
      </Button>
    )}
    <div className="hidden sm:flex ml-auto flex-wrap gap-3 text-xs text-muted-foreground" aria-hidden="true">
      <Hint k="Enter">mark paid</Hint>
      <Hint k="E">failed</Hint>
      <Hint k="U">undo</Hint>
      <Hint k="← →">move</Hint>
    </div>
  </div>
);
