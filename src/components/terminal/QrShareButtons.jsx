/**
 * QrShareButtons — action buttons below the Quick QR card
 *
 * Buttons:
 *   1. Save image  — downloads a branded PNG card
 *   2. Share (native OS share sheet, mobile only if supported)
 *   3. Copy image  — puts PNG on clipboard for pasting in WhatsApp
 *   4. Copy link   — copies a shareable web link (/#/pay/…)
 *   5. Share link  — uses native Web Share API for the URL, clipboard fallback
 */
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { Copy, Download, ExternalLink, ImageIcon, Link2, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import { composeQrCard, canvasToFile, downloadBlob } from "../../lib/qrImage";

/* ─── Feature detection helpers ──────────────────────────────────────────── */
const canShareFiles = () => {
  try {
    return (
      !!navigator.canShare &&
      navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] })
    );
  } catch {
    return false;
  }
};

const canShareUrl = () => !!navigator.share;

/* ─── Share link URL builder ─────────────────────────────────────────────── */
const buildShareLink = (identifier, paise, note) => {
  // amount in plain rupees (integer or decimal)
  const amountStr = paise ? String(paise / 100) : "";
  const origin = window.location.origin;
  const isFile = window.location.protocol === "file:";
  const prefix = isFile ? "/#/pay/" : "/pay/";
  const base = `${origin}${prefix}${encodeURIComponent(identifier)}`;
  const withAmount = amountStr ? `${base}/${encodeURIComponent(amountStr)}` : base;
  const withNote = note ? `${withAmount}/${encodeURIComponent(note)}` : withAmount;
  return withNote;
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export const QrShareButtons = ({ uri, card }) => {
  const ref = useRef(null);

  // ── Image helpers ──────────────────────────────────────────────────────────
  const makeFile = async () => {
    const safe = card.identifier.replace(/[^a-z0-9]+/gi, "-");
    const canvas = await composeQrCard(ref.current, card);
    return canvasToFile(canvas, `upi-qr-${safe}.png`);
  };

  const handleDownload = async () => {
    try {
      downloadBlob(await makeFile());
      toast.success("QR image saved");
    } catch {
      toast.error("Could not save image. Try a different browser.");
    }
  };

  const handleShareImage = async () => {
    try {
      const file = await makeFile();
      await navigator.share({ files: [file], title: "UPI payment QR", text: `Pay ${card.amount} via UPI` });
    } catch (e) {
      if (e.name !== "AbortError") toast.error("Sharing failed. Use Save image instead.");
    }
  };

  const handleCopyImage = async () => {
    try {
      await navigator.clipboard.write([
        new window.ClipboardItem({ "image/png": await makeFile() }),
      ]);
      toast.success("Image copied — paste it in WhatsApp (Ctrl+V)");
    } catch {
      toast.error("Your browser can't copy images. Use Save image instead.");
    }
  };

  // ── Link helpers ───────────────────────────────────────────────────────────
  const shareLink = buildShareLink(card.identifier, card.amountPaise, card.note);

  const handleCopyLink = () =>
    navigator.clipboard
      .writeText(shareLink)
      .then(() => toast.success("Payment link copied — paste and send!"), () => toast.error("Copy failed"));

  const handleShareLink = async () => {
    try {
      const file = await makeFile();
      if (file && canShareFiles()) {
        try {
          await navigator.share({
            title: `Pay ${card.amount || ""} via UPI`,
            text: `Pay ${card.amount ? card.amount + " " : ""}to ${card.identifier} via UPI Pay:\n${shareLink}`,
            url: shareLink,
            files: [file],
          });
          toast.success("Payment card & link shared!");
          return;
        } catch (e) {
          if (e.name === "AbortError") return;
        }
      }
    } catch {
      // Fallback to URL-only share below
    }

    if (canShareUrl()) {
      try {
        await navigator.share({
          title: `Pay ${card.amount || ""} via UPI`,
          text: `Scan or tap to pay ${card.identifier}`,
          url: shareLink,
        });
        return;
      } catch (e) {
        if (e.name === "AbortError") return; // user cancelled — don't fallback
      }
    }
    // Fallback: copy to clipboard
    handleCopyLink();
  };

  return (
    <div className="space-y-3" data-testid="quick-share-buttons">
      {/* Hidden high-res canvas for image exports */}
      <div className="hidden" aria-hidden="true">
        <QRCodeCanvas ref={ref} value={uri} size={520} level="M" marginSize={2} />
      </div>

      {/* Image export row */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={handleDownload}
          data-testid="quick-download-image"
          aria-label="Save QR code as PNG image"
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Save image
        </Button>

        {canShareFiles() && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareImage}
            data-testid="quick-share-image"
            aria-label="Share QR image via WhatsApp or other apps"
          >
            <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Share image
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyImage}
          data-testid="quick-copy-image"
          aria-label="Copy QR code image to clipboard"
        >
          <ImageIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          Copy image
        </Button>
      </div>

      {/* Shareable link row */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(shareLink, "_blank", "noopener,noreferrer")}
          data-testid="quick-open-share-link"
          aria-label="Open payment link in a new tab"
          className="border-blue-500/40 text-blue-700 hover:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30 font-medium"
        >
          <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
          Open link
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyLink}
          data-testid="quick-copy-share-link"
          aria-label="Copy shareable payment link to clipboard"
          className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
        >
          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          Copy link
        </Button>

        {canShareUrl() && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleShareLink}
            data-testid="quick-share-link"
            aria-label="Share payment link via native share sheet"
            className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
          >
            <Link2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Share link
          </Button>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">
        The link opens a payment page with QR + app buttons. Works on any device.
      </p>
    </div>
  );
};
