const TONES = {
  slate: "bg-slate-500/10 text-slate-700 dark:text-slate-300 ring-slate-500/25",
  cyan: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-cyan-500/30",
  amber: "bg-amber-500/10 text-amber-800 dark:text-amber-300 ring-amber-500/30",
  red: "bg-red-500/10 text-red-700 dark:text-red-300 ring-red-500/30",
  violet: "bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/30",
  green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/30",
};

export const Badge = ({ tone = "slate", children, testId }) => (
  <span
    data-testid={testId}
    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ${TONES[tone] || TONES.slate}`}
  >
    {children}
  </span>
);
