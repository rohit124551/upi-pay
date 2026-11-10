/**
 * InfoModal — Comprehensive FAQ, About Us, NPCI Disclaimers & Privacy Terms
 *
 * Implements:
 *  - Official NPCI brand & regulatory disclaimers (UPI / BHIM non-affiliation)
 *  - Project mission, architecture & author attribution (Rohit Kumar Ranjan)
 *  - Frequently Asked Questions (FAQ)
 *  - 100% Client-side Privacy Policy & Terms of Use
 */
import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Info,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  Github,
  Heart,
  Lock,
  AlertTriangle,
  Scale,
  Sparkles,
  Zap,
  Bug,
  Lightbulb,
  Mail,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { UpiPayLogo } from "../common/UpiPayLogo";

export const InfoModal = ({ open, onOpenChange, defaultTab = "faq" }) => {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) setTab(defaultTab);
  }, [defaultTab, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-4 sm:p-6" data-testid="info-modal">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-white dark:bg-slate-900 border border-border shadow-xs shrink-0">
              <UpiPayLogo size={18} />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-1.5">
                <span>
                  <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">UPI</span>
                  <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent ml-1">Pay</span>
                </span>
                <span className="text-xs font-mono font-normal text-muted-foreground ml-1.5">v2.0</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Zero-backend bulk UPI payout terminal & dynamic QR generator
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Navigation Tabs: FAQ | About & NPCI | Privacy & Terms */}
        <Tabs value={tab} onValueChange={setTab} className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted/60">
            <TabsTrigger value="faq" className="text-xs sm:text-sm flex items-center justify-center gap-1.5 font-medium">
              <HelpCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs sm:text-sm flex items-center justify-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span>About & NPCI</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Privacy & Terms</span>
            </TabsTrigger>
          </TabsList>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: FAQ                                                        */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <TabsContent value="faq" className="mt-4 space-y-3.5 text-xs sm:text-sm">
            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-3.5 space-y-1">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">1</span>
                What is UPI Pay and how does it work?
              </h4>
              <p className="text-muted-foreground leading-relaxed pl-7">
                UPI Pay is an open-source, client-side web suite for making multiple UPI payments safely. It cleans pasted lists or uploaded spreadsheets, merges duplicate entries for the same UPI ID, balances your totals, and generates individual QR codes for each recipient so you can pay them one-by-one from your mobile banking app without typing errors.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-3.5 space-y-1">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">2</span>
                Does UPI Pay ever ask for my UPI PIN or bank password?
              </h4>
              <p className="text-muted-foreground leading-relaxed pl-7">
                <strong>Never.</strong> UPI Pay never asks for, receives, or has access to your UPI PIN, MPIN, OTP, or bank login. Your UPI PIN is entered solely on your own phone inside your official, certified UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.).
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-3.5 space-y-1">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">3</span>
                Does UPI Pay touch, hold, or route my money?
              </h4>
              <p className="text-muted-foreground leading-relaxed pl-7">
                <strong>No.</strong> UPI Pay is not a payment intermediary, wallet, or payment aggregator. It only creates standard NPCI-compliant payment intent deep links (<code className="font-mono text-emerald-600 dark:text-emerald-400">upi://pay</code>). The actual money transfer happens directly from your bank account to the recipient's bank account via the NPCI payment network.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-3.5 space-y-1">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">4</span>
                How does duplicate detection protect me?
              </h4>
              <p className="text-muted-foreground leading-relaxed pl-7">
                If the same recipient appears multiple times across your list (for example, ₹400 for lunch and ₹1,200 for supplies), UPI Pay automatically merges them into a single payment of ₹1,600, preserving audit history so you don't accidentally pay them twice.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-3.5 space-y-1">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">5</span>
                Are shareable payment links (/pay/) public or crawled by search engines?
              </h4>
              <p className="text-muted-foreground leading-relaxed pl-7">
                <strong>No.</strong> Payment details are encoded entirely in the URL parameters. No link data is stored on any server. Furthermore, search engine crawlers (Google, Bing, Apple) are strictly forbidden from indexing payment links via <code className="font-mono text-xs">robots.txt Disallow</code> and dynamic <code className="font-mono text-xs">noindex, nofollow, noarchive</code> robot directives.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-3.5 space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">6</span>
                What are the official NPCI transaction limits & frequency caps?
              </h4>
              <div className="text-muted-foreground leading-relaxed pl-7 space-y-2 text-xs sm:text-sm">
                <p>
                  The National Payments Corporation of India (NPCI) and Reserve Bank of India (RBI) establish standard transaction and velocity limits across the UPI network:
                </p>
                <div className="grid gap-2 sm:grid-cols-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg border border-border/70 bg-background/60 space-y-1">
                    <span className="font-semibold text-foreground block text-xs">Standard UPI (P2P Transfers):</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-[11px]">
                      <li><strong>20 transactions/day</strong> count cap per bank account (rolling 24h).</li>
                      <li><strong>₹1,00,000/day</strong> standard peer-to-peer monetary limit.</li>
                      <li><strong>₹5,000 cap</strong> for first 24 hours on new registration or PIN reset.</li>
                    </ul>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border/70 bg-background/60 space-y-1">
                    <span className="font-semibold text-foreground block text-xs">UPI Lite (Small-Value Payments):</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-[11px]">
                      <li><strong>Up to ₹1,000</strong> per transaction (PIN-less instant pay).</li>
                      <li><strong>Up to ₹5,000</strong> maximum wallet balance at any point.</li>
                      <li><strong>Up to ₹10,000</strong> cumulative daily spend/top-up limit.</li>
                    </ul>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/90 pt-1">
                  <em>Note: Verified merchants (P2M) for capital markets, insurance, government taxes, educational institutions, and hospitals support higher per-transaction limits ranging from ₹2,00,000 to ₹5,00,000.</em>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-3.5 space-y-1">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">7</span>
                Can I process batches with more than 20 people using UPI Pay?
              </h4>
              <p className="text-muted-foreground leading-relaxed pl-7">
                Yes! UPI Pay allows you to paste, clean, and reconcile batches of any size (e.g. 50 or 100 payees). If you encounter your bank's 20-transaction daily velocity limit, you can complete the first 20 transactions today, and complete the remaining payments the next day or from a secondary linked bank account. You can export an updated CSV run log at any stage.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-3.5 space-y-1">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">8</span>
                What should I do if a payment fails or is declined?
              </h4>
              <p className="text-muted-foreground leading-relaxed pl-7">
                Press <strong>E</strong> on your keyboard or tap <strong>Mark Error</strong>. You can enter the failure reason (such as "Bank server down" or "Daily limit reached"). The item will be tagged with a red warning badge, and you can click <strong>Copy Errors</strong> to isolate and retry only the failed recipients later.
              </p>
            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: ABOUT US & NPCI DISCLAIMER                                 */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <TabsContent value="about" className="mt-4 space-y-3.5 text-xs sm:text-sm">
            {/* Mission Statement */}
            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-4 space-y-2.5">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                Why UPI Pay Exists
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Personal and retail bank accounts in India do not have access to bulk-payout APIs. Small businesses, freelance collectives, event organizers, and student teams are often forced to manually re-type 20 to 50 UPI IDs and amounts on a mobile keyboard—a tedious process where a single misplaced digit can send money to an unintended stranger.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>UPI Pay</strong> solves this with an open-source, keyboard-driven, verified workflow that guarantees totals reconcile before a single rupee is sent.
              </p>
            </div>

            {/* Official NPCI Compliance & Non-Affiliation Disclaimer */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Scale className="h-4 w-4 shrink-0" />
                NPCI & Trademark Disclaimer
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>UPI Pay</strong> is an independent open-source software project. It is <strong>not affiliated with, endorsed by, sponsored by, or partner of the National Payments Corporation of India (NPCI)</strong>, Reserve Bank of India (RBI), or any commercial bank.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                • <strong>BHIM</strong> and <strong>UPI</strong> are registered trademarks of the National Payments Corporation of India (NPCI).<br />
                • Google Pay, PhonePe, Paytm, Cred, and bank handles are trademarks of their respective owners, referenced solely for user convenience and compatibility.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All QR codes generated strictly adhere to the public NPCI UPI Linking Specifications and Common QR Code Standards.
              </p>
            </div>

            {/* Creator / Maintainer Box */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500 shrink-0" />
                Open Source Maintainer & Author
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <a
                    href="https://rohitkumarranjan.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-bold text-foreground hover:text-emerald-500 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Rohit Kumar Ranjan</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Portfolio: <a href="https://rohitkumarranjan.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">rohitkumarranjan.in</a>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://github.com/rohit124551/upi-pay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>GitHub</span>
                  </a>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground">MIT License</span>
                </div>
              </div>
            </div>

            {/* Community, Feedback & Bug Reports */}
            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  Bug Reports & Feature Suggestions
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Zero-Backend Tracking
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Found an issue with a bank handle, total reconciliation, or want to suggest an improvement? Submit directly via our quick Google Form, open a GitHub Issue, or reach out to the maintainer.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://forms.gle/eynzCQDh8v3Puosx7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Google Form (Feedback & Bugs)</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <a
                  href="https://github.com/rohit124551/upi-pay/issues/new?template=bug_report.md&title=%5BBug%5D%3A+"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Bug className="h-3.5 w-3.5" />
                  <span>Report on GitHub</span>
                </a>
                <a
                  href="https://github.com/rohit124551/upi-pay/issues/new?template=feature_request.md&title=%5BFeature%5D%3A+"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Suggest Feature</span>
                </a>
                <a
                  href="mailto:contact@rohitkumarranjan.in?subject=%5BUPI%20Pay%5D%20Feedback%20%2F%20Bug%20Report&body=Hi%20Rohit%2C%0A%0AHere%20is%20my%20feedback%20%2F%20bug%20report%20for%20UPI%20Pay%3A%0A"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Maintainer</span>
                </a>
              </div>
            </div>
          </TabsContent>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: PRIVACY POLICY & TERMS                                     */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <TabsContent value="privacy" className="mt-4 space-y-3.5 text-xs sm:text-sm">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex items-start gap-3">
              <Lock className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground text-sm">Privacy by Architecture</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                  UPI Pay is architected with zero backend servers. We cannot collect, store, view, or sell your financial data because it never leaves your browser sandbox.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <h5 className="font-semibold text-foreground">1. Zero Data Collection & Storage</h5>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  We collect no personal data, payment lists, recipient UPI IDs, phone numbers, or financial amounts. No analytics, tracking pixels, or cross-site telemetry are included.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-semibold text-foreground">2. Local Browser Storage Use</h5>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  Your browser's <code className="font-mono">localStorage</code> is utilized solely for your convenience:
                </p>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-0.5 pt-0.5">
                  <li>Remembering Light/Dark theme selection.</li>
                  <li>Saving threshold limit preferences (e.g. high-value warnings).</li>
                  <li>Optional: Your personal Gemini API key if you opt into experimental masked AI assistance.</li>
                </ul>
              </div>

              <div className="space-y-1">
                <h5 className="font-semibold text-foreground">3. User Responsibility & Safety Warning</h5>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  UPI transactions are instantaneous and irreversible. You are solely responsible for verifying the payee name and bank handle displayed on your phone's banking screen before entering your UPI PIN. We strongly recommend sending a ₹1 test payment to new payees first.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-semibold text-foreground">4. Terms of Use & Warranty Disclaimer</h5>
                <p className="text-muted-foreground leading-relaxed text-xs">
                  This tool is provided free of charge under the open-source MIT License on an "AS IS" basis, without warranty of any kind, express or implied. The author and contributors are not liable for any transaction errors, banking downtime, or unauthorized transfers.
                </p>
              </div>
            </div>

            {/* Community, Feedback & Bug Reports */}
            <div className="rounded-xl border border-border/80 bg-slate-500/5 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  Bug Reports & Feature Suggestions
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Zero-Backend Tracking
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Found an issue with a bank handle, total reconciliation, or want to suggest an improvement? Submit directly via our quick Google Form, open a GitHub Issue, or reach out to the maintainer.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://forms.gle/eynzCQDh8v3Puosx7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Google Form (Feedback & Bugs)</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <a
                  href="https://github.com/rohit124551/upi-pay/issues/new?template=bug_report.md&title=%5BBug%5D%3A+"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Bug className="h-3.5 w-3.5" />
                  <span>Report on GitHub</span>
                </a>
                <a
                  href="https://github.com/rohit124551/upi-pay/issues/new?template=feature_request.md&title=%5BFeature%5D%3A+"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>Suggest Feature</span>
                </a>
                <a
                  href="mailto:contact@rohitkumarranjan.in?subject=%5BUPI%20Pay%5D%20Feedback%20%2F%20Bug%20Report&body=Hi%20Rohit%2C%0A%0AHere%20is%20my%20feedback%20%2F%20bug%20report%20for%20UPI%20Pay%3A%0A"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email Maintainer</span>
                </a>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InfoModal;
