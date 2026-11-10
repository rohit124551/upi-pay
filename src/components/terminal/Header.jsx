import { Layers, QrCode, Settings, Trash2, Sun, Moon, HelpCircle } from "lucide-react";
import { Button } from "../ui/button";
import { ConfirmButton } from "./ConfirmButton";
import { useTheme } from "../../hooks/useTheme";
import { UpiPayLogo } from "../common/UpiPayLogo";

const STEPS = [["paste", "Paste"], ["review", "Check"], ["pay", "Pay"]];

export const Header = ({ stage, mode, onMode, onSettings, onClear, hasBatch, onInfo }) => {
  const { theme, toggleTheme } = useTheme();
  const idx = mode === "quick" ? -1 : STEPS.findIndex(([k]) => k === stage);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 px-3 sm:gap-6 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl bg-white dark:bg-slate-900 border border-border shadow-xs hover:scale-105 transition-transform shrink-0">
            <UpiPayLogo size={20} />
          </div>
          <div>
            <p className="whitespace-nowrap font-semibold leading-none tracking-tight text-sm sm:text-base">
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent font-extrabold">UPI</span>
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent font-extrabold ml-1">Pay</span>
            </p>
            <p className="mt-1 hidden font-mono text-[11px] text-muted-foreground sm:block">
              bulk UPI & batch pay - zero backend
            </p>
          </div>
        </div>
        <div className="flex rounded-md border border-border p-0.5 shrink-0" data-testid="mode-switch">
          {[["batch", "Batch", Layers], ["quick", "Quick QR", QrCode]].map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => onMode(key)}
              data-testid={`mode-${key}`}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === key
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        <ol className={`ml-4 hidden items-center gap-1 ${mode === "quick" ? "" : "md:flex"}`} data-testid="stage-steps">
          {STEPS.map(([key, label], i) => (
            <li
              key={key}
              data-testid={`stage-step-${key}`}
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                i === idx
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold"
                  : i < idx
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
              }`}
            >
              <span className="font-mono">{i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            data-testid="theme-toggle-button"
            className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-300 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onInfo?.("faq")}
            data-testid="open-info-button"
            aria-label="Open FAQ, About Us and Privacy Policy"
            className="px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4 sm:mr-1.5 text-emerald-500" />
            <span className="hidden sm:inline">FAQ</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettings}
            data-testid="open-settings-button"
            aria-label="Open settings"
            className="px-2 sm:px-3 text-xs sm:text-sm"
          >
            <Settings className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          {hasBatch && mode === "batch" && (
            <ConfirmButton
              testId="clear-batch-button"
              title="Clear this batch?"
              body="This removes the list and all paid / failed marks from this browser. Export first if you need a record."
              confirm="Clear batch"
              onConfirm={onClear}
              variant="ghost"
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-2 sm:px-3"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Clear batch</span>
            </ConfirmButton>
          )}
        </div>
      </div>
    </header>
  );
};
