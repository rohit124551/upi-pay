import { useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FIELDS, guessMapping, rowsFromSheet, TEMPLATE } from "../../lib/sheet";

const NONE = "none";

const downloadTemplate = (type) => {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(TEMPLATE), "Payouts");
  XLSX.writeFile(wb, `upi-payout-template.${type}`, { bookType: type });
};

const MapField = ({ f, headers, value, onChange }) => (
  <label className="grid grid-cols-[140px_1fr] items-center gap-3 text-sm">
    <span>{f.label}{f.required && <span className="text-red-400"> *</span>}</span>
    <Select value={value === "" ? NONE : value} onValueChange={(v) => onChange(v === NONE ? "" : v)}>
      <SelectTrigger data-testid={`map-${f.key}`}><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>— not in sheet —</SelectItem>
        {headers.map((h, i) => <SelectItem key={i} value={String(i)} data-testid={`map-${f.key}-opt-${i}`}>{String(h || `Column ${i + 1}`)}</SelectItem>)}
      </SelectContent>
    </Select>
  </label>
);

const Preview = ({ table, map }) => (
  <div className="overflow-x-auto rounded-md border border-border">
    <table className="w-full font-mono text-xs" data-testid="sheet-preview">
      <thead className="text-slate-500"><tr>{FIELDS.map((f) => <th key={f.key} className="px-3 py-2 text-left">{f.label}</th>)}</tr></thead>
      <tbody className="divide-y divide-border">
        {table.slice(1, 6).map((row, i) => (
          <tr key={i}>{FIELDS.map((f) => <td key={f.key} className="px-3 py-1.5 text-slate-300">{map[f.key] === "" ? "—" : String(row[+map[f.key]] ?? "")}</td>)}</tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SheetImport = ({ onImport }) => {
  const [open, setOpen] = useState(false);
  const [table, setTable] = useState(null);
  const [map, setMap] = useState({});

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const wb = XLSX.read(await file.arrayBuffer());
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: "" });
      if (rows.length < 2) throw new Error("empty");
      setTable(rows);
      setMap(guessMapping(rows[0]));
    } catch {
      toast.error("Couldn't read that file. Use .xlsx, .xls or .csv with a header row.");
    }
    e.target.value = "";
  };
  const ready = table && FIELDS.every((f) => !f.required || map[f.key] !== "");
  const doImport = () => {
    onImport(rowsFromSheet(table, map));
    setOpen(false);
    setTable(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setTable(null); }}>
      <DialogTrigger asChild>
        <Button size="lg" variant="outline" data-testid="import-sheet-button"><FileSpreadsheet className="mr-2 h-4 w-4" />Import sheet</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl" data-testid="sheet-dialog">
        <DialogHeader>
          <DialogTitle>Import from Excel or CSV</DialogTitle>
          <DialogDescription>The file is read in your browser only. First sheet, first row = column names.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Upload className="mr-2 h-4 w-4" />Choose file
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} data-testid="sheet-file-input" />
          </label>
          <span className="ml-2 text-xs text-slate-500">Template:</span>
          <Button size="sm" variant="ghost" onClick={() => downloadTemplate("xlsx")} data-testid="template-xlsx-button">Excel</Button>
          <Button size="sm" variant="ghost" onClick={() => downloadTemplate("csv")} data-testid="template-csv-button">CSV</Button>
        </div>
        {table && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400" data-testid="sheet-row-count">{table.length - 1} rows found. Tell us which column is which:</p>
            <div className="grid gap-2">{FIELDS.map((f) => <MapField key={f.key} f={f} headers={table[0]} value={map[f.key] ?? ""} onChange={(v) => setMap((m) => ({ ...m, [f.key]: v }))} />)}</div>
            <Preview table={table} map={map} />
          </div>
        )}
        <DialogFooter>
          <Button disabled={!ready} onClick={doImport} data-testid="sheet-import-confirm">Import and check</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
