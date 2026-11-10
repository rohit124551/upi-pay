import { useMemo } from "react";
import { useLocalState } from "./useLocalState";
import { parseText, mergeEntries, reconcile } from "../lib/parser";
import { planLite } from "../lib/lite";

export const DEFAULT_SETTINGS = { highValuePaise: 1000000, liteTxMaxPaise: 100000, liteWalletPaise: 500000, aiOffered: true };

export function useBatch() {
  const [batch, setBatch] = useLocalState("upi-terminal:batch:v1", null);
  const [saved, setSettings] = useLocalState("upi-terminal:settings:v1", DEFAULT_SETTINGS);
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...saved }), [saved]);
  const [draft, setDraft] = useLocalState("upi-terminal:draft:v1", "");

  const rows = useMemo(() => {
    if (!batch) return [];
    const list = batch.locked ? batch.rows : mergeEntries(batch.entries);
    return planLite(list, settings);
  }, [batch, settings]);

  const recon = useMemo(() => (batch ? reconcile(batch, rows) : null), [batch, rows]);

  const patch = (fn) => setBatch((b) => ({ ...b, ...fn(b) }));

  return {
    batch, rows, recon, settings, setSettings, draft, setDraft,
    clean: (raw) => setBatch({ raw, ...parseText(raw), mismatchAccepted: false, locked: false, createdAt: new Date().toISOString() }),
    importSheet: (result) => setBatch({ ...result, origin: "sheet", mismatchAccepted: false, locked: false, createdAt: new Date().toISOString() }),
    setVerify: (verify) => patch(() => ({ verify })),
    editText: () => { setDraft(batch.raw); setBatch(null); },
    ignoreLine: (lineNo, ignored) => patch((b) => ({ unclear: b.unclear.map((u) => (u.lineNo === lineNo ? { ...u, ignored } : u)) })),
    acceptAi: (entry) => patch((b) => ({
      entries: [...b.entries, entry],
      unclear: b.unclear.filter((u) => u.lineNo !== entry.lines[0]),
      mismatchAccepted: false,
      verify: null,
    })),
    acceptMismatch: (v) => patch(() => ({ mismatchAccepted: v })),
    lock: () => patch(() => ({
      locked: true,
      lockedAt: new Date().toISOString(),
      rows: rows.map((r) => ({ ...r, status: "pending", failReason: null, doneAt: null })),
    })),
    updateRow: (id, change) => patch((b) => ({ rows: b.rows.map((r) => (r.id === id ? { ...r, ...change } : r)) })),
    clear: () => { setBatch(null); setDraft(""); },
  };
}
