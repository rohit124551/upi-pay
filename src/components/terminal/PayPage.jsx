/**
 * PayPage — Modern Payment Gateway-style Shareable Payment Screen
 *
 * Route: /#/pay/:upiId/:amount?/:desc?
 *
 * Highlights:
 *  - Gateway-style compact header: "Paying to {upiId}" & amount directly below (no bulky container boxes)
 *  - Real-time NPCI-compliant QR code for scanning
 *  - Single prominent "Pay Now" button that triggers native UPI app selection
 *  - Official authorized logos for supported UPI apps (GPay, PhonePe, Paytm, BHIM, UPI)
 *  - Quick CTA button to "Create your own dynamic UPI QR code"
 *  - Open source project attribution by Rohit
 */

import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Github,
  HelpCircle,
  ImageIcon,
  Plus,
  Share2,
} from "lucide-react";
import { Button } from "../ui/button";
import { buildUpiUri, lastFour } from "../../lib/upi";
import { useTheme } from "../../hooks/useTheme";
import { BhimUpiBrandStrip } from "./BhimUpiBrandStrip";
import { UpiPayLogo } from "../common/UpiPayLogo";
import { Footer } from "../common/Footer";
import { InfoModal } from "./InfoModal";
import { composeQrCard, canvasToJpegFile, canvasToPngFile, downloadBlob } from "../../lib/qrImage";
import { exportCanvasAsPdf } from "../../lib/pdfExport";

/* ─── Copy Helper ─────────────────────────────────────────────────────────── */
const copyText = (text, label) =>
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied`), () => toast.error("Copy failed"));

/* ─── Invalid / Error State ───────────────────────────────────────────────── */
const InvalidLink = () => (
  <div className="flex min-h-screen items-center justify-center bg-background p-6">
    <div className="panel max-w-sm w-full p-8 text-center space-y-4">
      <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
      <h1 className="text-lg font-semibold text-foreground">Invalid payment link</h1>
      <p className="text-sm text-muted-foreground">
        This link is missing a valid UPI ID. Ask the sender for a verified link.
      </p>
      <Link to="/quickqr" className="inline-block text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
        ← Go to UPI Pay
      </Link>
    </div>
  </div>
);

/* ─── Main PayPage Component ──────────────────────────────────────────────── */
export const PayPage = () => {
  const { upiId: rawUpiId, amount: rawAmount, desc: rawDesc } = useParams();
  const { theme, toggleTheme } = useTheme();
  const qrCanvasRef = useRef(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [infoModal, setInfoModal] = useState({ open: false, tab: "faq" });

  const openInfo = (tab = "faq") => setInfoModal({ open: true, tab });

  // Decode URL-encoded params
  const upiId = rawUpiId ? decodeURIComponent(rawUpiId) : null;
  const amount = rawAmount ? decodeURIComponent(rawAmount) : null;
  const desc = rawDesc ? decodeURIComponent(rawDesc) : null;

  if (!upiId || !upiId.includes("@")) {
    return <InvalidLink />;
  }

  const amountNum = amount ? parseFloat(amount) : null;
  const displayAmount = amountNum && !isNaN(amountNum) && amountNum > 0
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amountNum)
    : null;

  // Dynamic in-browser title & strict privacy protection against search crawler indexing
  useEffect(() => {
    const origTitle = document.title;
    const origRobots = document.querySelector('meta[name="robots"]')?.getAttribute("content") || "index, follow";
    const pageTitle = `Pay ${displayAmount ? `${displayAmount} ` : ""}to ${upiId} | UPI Pay`;
    const metaDesc = `Scan QR code or click to pay ${displayAmount ? `${displayAmount} ` : ""}to ${upiId} securely with zero backend. Built by Rohit Kumar Ranjan.`;

    document.title = pageTitle;

    const setMeta = (name, prop, val) => {
      let el = document.querySelector(`meta[${name}="${prop}"]`);
      if (el) el.setAttribute("content", val);
    };

    // STRICT PRIVACY: Tell all search engine crawlers NEVER to index, archive or follow this private payment link
    setMeta("name", "robots", "noindex, nofollow, noarchive, nosnippet");
    setMeta("name", "googlebot", "noindex, nofollow, noarchive, nosnippet");
    setMeta("name", "description", metaDesc);
    setMeta("property", "og:title", pageTitle);
    setMeta("property", "og:description", metaDesc);
    setMeta("name", "twitter:title", pageTitle);
    setMeta("name", "twitter:description", metaDesc);

    return () => {
      document.title = origTitle;
      setMeta("name", "robots", origRobots);
      setMeta("name", "googlebot", origRobots);
    };
  }, [upiId, displayAmount, desc]);

  // Build the standard NPCI UPI URI
  const upiUri = buildUpiUri(
    { identifier: upiId, name: upiId, amountPaise: amountNum && !isNaN(amountNum) && amountNum > 0 ? Math.round(amountNum * 100) : null },
    desc
  );

  const shareLink = window.location.href;
  const copyShareLink = () => copyText(shareLink, "Payment link");

  const handleShare = async () => {
    const title = `Pay ${displayAmount || "via UPI"} to ${upiId}`;
    const text = `Scan the QR code or tap this link to pay ${displayAmount ? `${displayAmount} ` : ""}to ${upiId}${desc ? ` (${desc})` : ""}:\n${shareLink}`;

    // Generate the branded standee image to share together with the /pay/ link
    if (qrCanvasRef.current) {
      try {
        const safe = upiId.replace(/[^a-z0-9]+/gi, "-");
        const cardData = {
          amount: displayAmount,
          amountPaise: amountNum && !isNaN(amountNum) && amountNum > 0 ? Math.round(amountNum * 100) : null,
          name: "",
          identifier: upiId,
          note: desc,
        };
        const canvas = await composeQrCard(qrCanvasRef.current, cardData);
        const imageFile = await canvasToPngFile(canvas, `upi-pay-${safe}.png`);

        // Check if browser/OS supports sharing files + text/url via Web Share API
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
          await navigator.share({
            title,
            text,
            url: shareLink,
            files: [imageFile],
          });
          toast.success("Payment QR image and link shared!");
          return;
        }

        // Fallback to text & link share if files not supported by share sheet
        if (navigator.share) {
          await navigator.share({
            title,
            text,
            url: shareLink,
          });
          toast.success("Payment link shared!");
          return;
        }
      } catch (err) {
        if (err.name === "AbortError") return; // User cancelled share sheet
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareLink,
        });
        toast.success("Payment link shared!");
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }

    // Ultimate fallback for desktop browsers without Web Share: copy link
    copyShareLink();
  };

  const handlePayNow = () => {
    // Standard UPI intent invocation (Android/iOS opens native UPI app selector)
    window.location.href = upiUri;
  };

  const handleDownload = async (format = "pdf") => {
    if (!qrCanvasRef.current) {
      toast.error("QR canvas not ready");
      return;
    }
    setDownloading(true);
    const safe = upiId.replace(/[^a-z0-9]+/gi, "-");
    const cardData = {
      amount: displayAmount,
      amountPaise: amountNum && !isNaN(amountNum) && amountNum > 0 ? Math.round(amountNum * 100) : null,
      name: "",
      identifier: upiId,
      note: desc,
    };

    try {
      const canvas = await composeQrCard(qrCanvasRef.current, cardData);
      if (format === "pdf") {
        await exportCanvasAsPdf(canvas, `upi-pay-${safe}.pdf`);
        toast.success("PDF standee downloaded");
      } else if (format === "jpg" || format === "jpeg") {
        const file = await canvasToJpegFile(canvas, `upi-pay-${safe}.jpg`, 0.95);
        downloadBlob(file);
        toast.success("JPG card downloaded");
      } else {
        const file = await canvasToPngFile(canvas, `upi-pay-${safe}.png`);
        downloadBlob(file);
        toast.success("PNG card downloaded");
      }
    } catch (err) {
      toast.error(`Could not download ${format.toUpperCase()}: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hidden high-res canvas for image & PDF generation */}
      <div className="hidden" aria-hidden="true">
        <QRCodeCanvas ref={qrCanvasRef} value={upiUri} size={520} level="M" marginSize={2} />
      </div>

      {/* Top Bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-3 sm:px-4 gap-2">
          <Link to="/quickqr" className="flex items-center gap-2.5 font-semibold text-xs sm:text-sm hover:opacity-80 transition-opacity shrink-0">
            <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-white dark:bg-slate-900 border border-border shadow-xs shrink-0">
              <UpiPayLogo size={16} />
            </div>
            <span className="font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent font-extrabold">UPI</span>
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent font-extrabold ml-1">Pay</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Innovative + New QR Creator */}
            <Link
              to="/quickqr"
              className="group inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1.5 sm:px-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0"
              title="Create your own dynamic UPI QR"
              aria-label="Create your own dynamic UPI QR"
            >
              <Plus className="h-4 w-4 stroke-[2.5] text-emerald-500 transition-transform group-hover:rotate-90" />
              <span className="hidden sm:inline">New QR</span>
            </Link>

            {/* Download Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu((v) => !v)}
                disabled={downloading}
                aria-label="Download payment info options"
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 sm:px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                title="Download standee (PDF, JPG, PNG)"
              >
                <Download className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="hidden sm:inline">Download</span>
                <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
              </button>
              {showDownloadMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDownloadMenu(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-1.5 w-38 rounded-lg border border-border bg-popover p-1 shadow-lg z-50 text-xs">
                    <button
                      onClick={() => { setShowDownloadMenu(false); handleDownload("pdf"); }}
                      className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-muted font-medium transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-red-500" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => { setShowDownloadMenu(false); handleDownload("jpg"); }}
                      className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-muted font-medium transition-colors"
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
                      Download JPG
                    </button>
                    <button
                      onClick={() => { setShowDownloadMenu(false); handleDownload("png"); }}
                      className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-left hover:bg-muted font-medium transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-emerald-500" />
                      Download PNG
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Share button with Share2 icon (shares standee image + /pay/ link) */}
            <button
              onClick={handleShare}
              aria-label="Share QR image and payment link"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 sm:px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Share QR image & payment link"
            >
              <Share2 className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              <span className="hidden sm:inline">Share</span>
            </button>
            {/* FAQ, About & NPCI Terms Modal */}
            <button
              onClick={() => openInfo("faq")}
              aria-label="FAQ & About"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 sm:px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="FAQ, NPCI Terms & Privacy"
            >
              <HelpCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="hidden sm:inline">FAQ</span>
            </button>
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              className="rounded-md border border-border p-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Payment Gateway Experience */}
      <main className="mx-auto w-full max-w-md flex-1 px-3 sm:px-4 py-6 sm:py-8 space-y-4">
        <div className="panel p-5 sm:p-7 space-y-5 text-center rise">
          {/* 1. Innovative QR Code Showcase at Top */}
          <div className="flex flex-col items-center justify-center space-y-2 pt-1">
            <div
              className="relative rounded-3xl bg-white p-4 sm:p-5 shadow-lg ring-1 ring-slate-900/5 dark:ring-white/10 transition-transform hover:scale-[1.01]"
              role="img"
              aria-label={`UPI QR code for ${upiId}${displayAmount ? `, amount ${displayAmount}` : ""}`}
            >
              {/* Scanner visual accent corner brackets */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl-sm pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr-sm pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl-sm pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br-sm pointer-events-none" />

              <QRCodeSVG value={upiUri} size={200} level="M" />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 pt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Scan with any UPI app on another device
            </p>
          </div>

          {/* 2. Downside to QR Code: Paying to & Centered UPI ID */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Paying to
            </p>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => copyText(upiId, "UPI ID")}
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-slate-100/80 dark:bg-slate-900/80 px-3.5 py-1.5 text-sm sm:text-base font-mono font-semibold text-foreground hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all shadow-xs group"
                title="Click to copy UPI ID"
              >
                <span className="break-all">{upiId}</span>
                <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            </div>
          </div>

          {/* 3. If Amount then Amount & Note */}
          {displayAmount && (
            <div className="pt-0.5 space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                Amount to pay
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground break-all">
                {displayAmount}
              </div>
            </div>
          )}

          {desc && (
            <p className="text-xs sm:text-sm text-muted-foreground italic break-words pt-0.5">
              “{desc}”
            </p>
          )}

          {/* 4. Downside Pay Now Button & Brand Strip */}
          <div className="space-y-3 pt-1">
            <Button
              size="lg"
              onClick={handlePayNow}
              className="w-full h-12 text-sm sm:text-base font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              data-testid="pay-now-button"
            >
              <span className="truncate">{displayAmount ? `Pay ${displayAmount}` : "Pay Now"}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" />
            </Button>

            {/* Official BHIM UPI & Supported Apps Brand Strip from Reference Image */}
            <BhimUpiBrandStrip />
          </div>
        </div>

        {/* Footer */}
        <Footer onInfo={openInfo} />
      </main>

      {/* FAQ, NPCI Terms & Privacy Policy Dialog */}
      <InfoModal
        open={infoModal.open}
        onOpenChange={(open) => setInfoModal((s) => ({ ...s, open }))}
        defaultTab={infoModal.tab}
      />
    </div>
  );
};
