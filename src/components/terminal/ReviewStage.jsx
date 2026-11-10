import { Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { ReconCard } from "./ReconCard";
import { UnclearLines } from "./UnclearLines";
import { RowsTable } from "./RowsTable";
import { PlanCard } from "./PlanCard";
import { VerifyPanel } from "./VerifyPanel";

export const ReviewStage = ({ store }) => {
  const { batch, rows, recon, settings } = store;
  const canStart = recon.openLines === 0 && (recon.balanced || batch.mismatchAccepted) && rows.length > 0;
  return (
    <div className="space-y-6 rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Step 2</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Check before you pay</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {settings.aiOffered && rows.length > 0 && <VerifyPanel batch={batch} rows={rows} onResult={store.setVerify} />}
          <Button variant="outline" onClick={store.editText} data-testid="edit-text-button"><Pencil className="mr-2 h-4 w-4" />{batch.origin === "sheet" ? "Edit as text" : "Edit pasted text"}</Button>
        </div>
      </div>
      <ReconCard recon={recon} accepted={batch.mismatchAccepted} onAccept={store.acceptMismatch} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <UnclearLines unclear={batch.unclear} onIgnore={store.ignoreLine} onAcceptAi={store.acceptAi} aiOffered={settings.aiOffered} />
          <RowsTable rows={rows} settings={settings} merged={recon.merged} />
        </div>
        <PlanCard rows={rows} canStart={canStart} recon={recon} onStart={store.lock} />
      </div>
    </div>
  );
};
