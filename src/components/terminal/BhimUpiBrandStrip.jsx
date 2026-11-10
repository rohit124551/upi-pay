/**
 * Official UPI & Supported App Logos
 *
 * Uses official authorized SVG assets:
 *  - BHIM (bhim.svg)
 *  - UPI (upi.svg)
 *  - Google Pay (gpay.svg)
 *  - PhonePe (phonepe.svg)
 *  - Paytm (paytm.svg)
 */

export const BhimUpiBrandStrip = () => {
  const publicUrl = process.env.PUBLIC_URL || "";

  return (
    <div className="rounded-xl border border-border/80 bg-slate-50/70 dark:bg-card/70 p-4 space-y-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Scan & pay with any UPI app
      </p>

      {/* Primary: BHIM & UPI official brand marks */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 py-1">
        <img
          src={`${publicUrl}/bhim.svg`}
          alt="BHIM"
          className="h-6 sm:h-7 w-auto max-w-[120px] object-contain"
        />
        <div className="h-6 w-px bg-border" />
        <img
          src={`${publicUrl}/upi.svg`}
          alt="UPI"
          className="h-6 sm:h-7 w-auto max-w-[120px] object-contain"
        />
      </div>

      {/* Secondary: Supported apps (GPay, PhonePe, Paytm) */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <div className="flex h-8 items-center justify-center rounded-lg border border-border bg-white dark:bg-slate-900 px-3 py-1 shadow-xs transition-transform hover:scale-105" title="Google Pay">
          <img
            src={`${publicUrl}/gpay.svg`}
            alt="Google Pay"
            className="h-4 sm:h-5 w-auto object-contain"
          />
        </div>
        <div className="flex h-8 items-center justify-center rounded-lg border border-border bg-white dark:bg-slate-900 px-3 py-1 shadow-xs transition-transform hover:scale-105" title="PhonePe">
          <img
            src={`${publicUrl}/phonepe.svg`}
            alt="PhonePe"
            className="h-4 sm:h-5 w-auto object-contain"
          />
        </div>
        <div className="flex h-8 items-center justify-center rounded-lg border border-border bg-white dark:bg-slate-900 px-3 py-1 shadow-xs transition-transform hover:scale-105" title="Paytm">
          <img
            src={`${publicUrl}/paytm.svg`}
            alt="Paytm"
            className="h-4 sm:h-5 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};
