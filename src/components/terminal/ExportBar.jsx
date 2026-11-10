import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { toCSV, toTSV, downloadFile } from "../../lib/csv";

const SETS = { paid: (r) => r.status === "paid", failed: (r) => r.status === "failed", all: () => true };

const LABELS = {
  paid: "Copy paid (UPI ID, Amount, Status)",
  failed: "Copy errors / failed",
  all: "Copy all rows",
};

export const ExportBar = ({ rows }) => {
  const stamp = new Date().toISOString().slice(0, 10);
  const pick = (k) => rows.filter(SETS[k]);

  const copy = (k) => {
    const list = pick(k);
    if (!list.length) {
      toast.info(`No ${k} rows to copy`);
      return;
    }
    navigator.clipboard
      .writeText(toTSV(list))
      .then(
        () => toast.success(`Copied ${list.length} ${k} rows (UPI ID, Amount, Status)`),
        () => toast.error("Copy failed")
      );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" data-testid="export-menu-button">
          <Download className="mr-2 h-4 w-4" />Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Copy 3 Columns (UPI ID, Amount, Status)</DropdownMenuLabel>
        {Object.keys(SETS).map((k) => (
          <DropdownMenuItem key={`c-${k}`} onClick={() => copy(k)} data-testid={`copy-${k}`}>
            <Copy className="mr-2 h-4 w-4" />
            {LABELS[k] || `Copy ${k}`}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Download CSV (Starts with 3 cols)</DropdownMenuLabel>
        {Object.keys(SETS).map((k) => (
          <DropdownMenuItem
            key={`d-${k}`}
            onClick={() => downloadFile(`payouts-${k}-${stamp}.csv`, toCSV(pick(k)))}
            data-testid={`download-${k}`}
          >
            <Download className="mr-2 h-4 w-4" />
            Download {k} CSV
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
