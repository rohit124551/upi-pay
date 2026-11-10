/**
 * qrImage.js — High-grade shareable merchant standee QR card generator for OpenUPI
 *
 * Draws a professional, official payment gateway / merchant standee card onto an HTML5 Canvas:
 *   - Top header with official BHIM + UPI brand marks
 *   - Supported app badges: Google Pay, PhonePe, Paytm (NO Amazon Pay)
 *   - Centered high-res QR code with merchant focus brackets
 *   - Recipient Name & Verified UPI ID badge
 *   - Dedicated Amount container (ONLY if amount is specified; omitted if no amount)
 *   - Payment note / purpose (if specified)
 *   - Verified NPCI UPI trust footer with OpenUPI & Rohit attribution
 */

import { loadBrandLogos } from "./brandLogos";

/* ─── Canvas Helper: Rounded Rectangles ───────────────────────────────────── */
function drawRoundedRect(g, x, y, w, h, r, fill, stroke, strokeWidth = 1) {
  g.beginPath();
  if (typeof g.roundRect === "function") {
    g.roundRect(x, y, w, h, r);
  } else {
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y + w, y, r);
    g.closePath();
  }
  if (fill) {
    g.fillStyle = fill;
    g.fill();
  }
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = strokeWidth;
    g.stroke();
  }
}

/* ─── Canvas Helper: QR Corner Brackets ───────────────────────────────────── */
function drawCornerBrackets(g, x, y, size, bracketLen = 24, color = "#10B981", lineWidth = 4) {
  g.save();
  g.strokeStyle = color;
  g.lineWidth = lineWidth;
  g.lineCap = "round";

  // Top-left
  g.beginPath();
  g.moveTo(x, y + bracketLen);
  g.lineTo(x, y);
  g.lineTo(x + bracketLen, y);
  g.stroke();

  // Top-right
  g.beginPath();
  g.moveTo(x + size - bracketLen, y);
  g.lineTo(x + size, y);
  g.lineTo(x + size, y + bracketLen);
  g.stroke();

  // Bottom-left
  g.beginPath();
  g.moveTo(x, y + size - bracketLen);
  g.lineTo(x, y + size);
  g.lineTo(x + bracketLen, y + size);
  g.stroke();

  // Bottom-right
  g.beginPath();
  g.moveTo(x + size - bracketLen, y + size);
  g.lineTo(x + size, y + size);
  g.lineTo(x + size, y + size - bracketLen);
  g.stroke();

  g.restore();
}

/**
 * Compose an advanced merchant-grade shareable UPI payment card onto a Canvas.
 *
 * @param {HTMLCanvasElement} qrCanvas The rendered high-res QR canvas
 * @param {Object} card Details of the payment
 * @param {string|null} card.amount Display string (e.g. "₹4,250.00" or null)
 * @param {number|null} card.amountPaise Integer paise (e.g. 425000 or null)
 * @param {string|null} card.name Recipient payee name
 * @param {string} card.identifier Recipient UPI ID (VPA)
 * @param {string|null} card.note Optional payment description
 * @returns {Promise<HTMLCanvasElement>} The generated canvas
 */
export async function composeQrCard(qrCanvas, { amount, amountPaise, name, identifier, note }) {
  // Determine if valid amount is specified
  const hasAmount = Boolean(
    (amountPaise && amountPaise > 0) ||
    (amount && amount !== "Any amount" && amount.trim() !== "")
  );
  // Only display recipient name if it is distinct from the UPI ID (avoiding duplicate display)
  const hasRealName = Boolean(
    name &&
    name.trim() &&
    name.trim().toLowerCase() !== identifier.trim().toLowerCase()
  );
  const hasNote = Boolean(note && note.trim());

  // Dynamic canvas height: compact and tailored to content with comfortable breathing room
  const W = 800;
  let H = 880;
  if (hasRealName) H += 32;
  if (hasAmount) H += 100;
  if (hasNote) H += 30;

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return c;

  // 1. Crisp White Card Background
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, 0, W, H);

  // Standee outer frame with subtle rounded border
  drawRoundedRect(g, 16, 16, W - 32, H - 32, 28, "#FFFFFF", "#E2E8F0", 1.5);

  // Top emerald accent bar
  g.fillStyle = "#059669";
  g.beginPath();
  if (typeof g.roundRect === "function") {
    g.roundRect(16, 16, W - 32, 6, [28, 28, 0, 0]);
    g.fill();
  } else {
    g.fillRect(16, 16, W - 32, 6);
  }

  // 2. Load Brand Logos (BHIM, UPI, GPay, PhonePe, Paytm — NO Amazon Pay)
  let logos = { bhim: null, upi: null, gpay: null, phonepe: null, paytm: null };
  try {
    logos = await loadBrandLogos();
  } catch {
    // Graceful fallback if brand assets cannot be loaded
  }

  // 3. QR Code Showcase Container at the TOP
  const qrBoxSize = 420;
  const qrBoxX = (W - qrBoxSize) / 2;
  const qrBoxY = 48;

  // Background card for QR
  drawRoundedRect(g, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24, "#FFFFFF", "#F1F5F9", 2);

  // Corner focus brackets for scan guidance
  drawCornerBrackets(g, qrBoxX + 16, qrBoxY + 16, qrBoxSize - 32, 28, "#10B981", 4);

  // Draw the high-resolution QR canvas
  const qrPad = 36;
  g.drawImage(
    qrCanvas,
    qrBoxX + qrPad,
    qrBoxY + qrPad,
    qrBoxSize - qrPad * 2,
    qrBoxSize - qrPad * 2
  );

  // Hint text directly under QR
  let currY = qrBoxY + qrBoxSize + 24;
  g.textAlign = "center";
  g.font = "500 13px 'IBM Plex Sans', sans-serif";
  g.fillStyle = "#64748B";
  g.fillText("Point your phone camera or open any UPI app to scan", W / 2, currY);

  // 4. Downside to QR Code: Paying To & Centered UPI ID (Never duplicated!)
  currY += 34;
  g.font = "700 11px 'IBM Plex Sans', sans-serif";
  g.fillStyle = "#64748B";
  g.letterSpacing = "2px";
  g.fillText("PAYING TO", W / 2, currY);
  g.letterSpacing = "0px";

  // Optional Real Name (only if different from UPI ID)
  if (hasRealName) {
    currY += 28;
    g.font = "700 24px 'IBM Plex Sans', -apple-system, sans-serif";
    g.fillStyle = "#0F172A";
    g.fillText(name.trim().slice(0, 34), W / 2, currY);
  }

  // Recipient UPI ID Pill Badge (Clean, centered, no fake checkmark)
  currY += 28;
  g.font = "600 22px 'JetBrains Mono', Consolas, monospace";
  const idText = identifier.trim().slice(0, 42);
  const idMetrics = g.measureText(idText);
  const idPillW = Math.max(260, idMetrics.width + 48);
  const idPillH = 42;
  const idPillX = (W - idPillW) / 2;

  drawRoundedRect(g, idPillX, currY - 26, idPillW, idPillH, 10, "#F8FAFC", "#E2E8F0", 1);

  g.font = "600 20px 'JetBrains Mono', Consolas, monospace";
  g.fillStyle = "#1E293B";
  g.textAlign = "center";
  g.fillText(idText, W / 2, currY);

  currY += 26;

  // 5. Amount Box (ONLY rendered if valid amount is specified!)
  if (hasAmount) {
    currY += 12;
    const amtBoxW = 380;
    const amtBoxH = 82;
    const amtBoxX = (W - amtBoxW) / 2;

    drawRoundedRect(g, amtBoxX, currY, amtBoxW, amtBoxH, 14, "#F0FDF4", "#86EFAC", 1.5);

    g.font = "700 11px 'IBM Plex Sans', sans-serif";
    g.fillStyle = "#059669";
    g.letterSpacing = "1.5px";
    g.fillText("AMOUNT TO PAY", W / 2, currY + 24);
    g.letterSpacing = "0px";

    const displayAmount = amount && amount !== "Any amount" ? amount : "";
    g.font = "800 38px 'JetBrains Mono', Consolas, monospace";
    g.fillStyle = "#047857";
    g.fillText(displayAmount, W / 2, currY + 63);

    currY += amtBoxH + 14;
  }

  // 6. Payment Note / Purpose (if provided)
  if (hasNote) {
    currY += 6;
    g.font = "italic 500 15px 'IBM Plex Sans', sans-serif";
    g.fillStyle = "#64748B";
    g.fillText(`“${note.trim().slice(0, 44)}”`, W / 2, currY);
    currY += 20;
  }

  // 7. Downside to QR Code & Amount: Official BHIM UPI Brand Strip Box
  currY += 14;
  const brandBoxW = 440;
  const brandBoxH = 146;
  const brandBoxX = (W - brandBoxW) / 2;
  drawRoundedRect(g, brandBoxX, currY, brandBoxW, brandBoxH, 16, "#F8FAFC", "#E2E8F0", 1);

  // Tagline inside brand strip
  g.font = "700 11px 'IBM Plex Sans', sans-serif";
  g.fillStyle = "#64748B";
  g.letterSpacing = "1.5px";
  g.fillText("SCAN & PAY WITH ANY UPI APP", W / 2, currY + 24);
  g.letterSpacing = "0px";

  // Brand Strip Row 1: BHIM | UPI
  const midX = W / 2;
  const bTopY = currY + 38;

  if (logos.bhim) {
    const bw = 112;
    const bh = 25;
    g.drawImage(logos.bhim, midX - 20 - bw, bTopY + 2, bw, bh);
  } else {
    g.font = "700 20px 'IBM Plex Sans', sans-serif";
    g.fillStyle = "#088B45";
    g.fillText("BHIM", midX - 60, bTopY + 20);
  }

  // Divider between BHIM and UPI
  g.strokeStyle = "#CBD5E1";
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(midX, bTopY + 2);
  g.lineTo(midX, bTopY + 28);
  g.stroke();

  if (logos.upi) {
    const uw = 86;
    const uh = 30;
    g.drawImage(logos.upi, midX + 20, bTopY, uw, uh);
  } else {
    g.font = "700 20px 'IBM Plex Sans', sans-serif";
    g.fillStyle = "#E9661C";
    g.fillText("UPI", midX + 50, bTopY + 20);
  }

  // Brand Strip Row 2: GPay, PhonePe, Paytm (NO Amazon Pay)
  const appPillY = bTopY + 40;
  const pillW = 96;
  const pillH = 34;
  const pillGap = 12;
  const totalPillsW = pillW * 3 + pillGap * 2;
  const pillStartX = (W - totalPillsW) / 2;

  // Google Pay
  const gpayX = pillStartX;
  drawRoundedRect(g, gpayX, appPillY, pillW, pillH, 8, "#FFFFFF", "#E2E8F0", 1);
  if (logos.gpay) {
    g.drawImage(logos.gpay, gpayX + (pillW - 60) / 2, appPillY + (pillH - 19) / 2, 60, 19);
  } else {
    g.font = "600 11px 'IBM Plex Sans', sans-serif";
    g.fillStyle = "#202124";
    g.fillText("Google Pay", gpayX + pillW / 2, appPillY + 21);
  }

  // PhonePe
  const phonepeX = gpayX + pillW + pillGap;
  drawRoundedRect(g, phonepeX, appPillY, pillW, pillH, 8, "#FFFFFF", "#E2E8F0", 1);
  if (logos.phonepe) {
    g.drawImage(logos.phonepe, phonepeX + (pillW - 72) / 2, appPillY + (pillH - 21) / 2, 72, 21);
  } else {
    g.font = "600 11px 'IBM Plex Sans', sans-serif";
    g.fillStyle = "#5F259F";
    g.fillText("PhonePe", phonepeX + pillW / 2, appPillY + 21);
  }

  // Paytm
  const paytmX = phonepeX + pillW + pillGap;
  drawRoundedRect(g, paytmX, appPillY, pillW, pillH, 8, "#FFFFFF", "#E2E8F0", 1);
  if (logos.paytm) {
    g.drawImage(logos.paytm, paytmX + (pillW - 64) / 2, appPillY + (pillH - 19) / 2, 64, 19);
  } else {
    g.font = "600 11px 'IBM Plex Sans', sans-serif";
    g.fillStyle = "#002E6E";
    g.fillText("Paytm", paytmX + pillW / 2, appPillY + 21);
  }

  // 8. Footer Trust Bar
  const footerDividerY = H - 68;
  g.strokeStyle = "#E2E8F0";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(60, footerDividerY);
  g.lineTo(W - 60, footerDividerY);
  g.stroke();

  g.textAlign = "center";
  g.font = "600 12px 'IBM Plex Sans', sans-serif";
  g.fillStyle = "#475569";
  g.fillText("UPI Pay · Open source client-side payment tool • zero backend servers", W / 2, H - 44);

  g.font = "400 11px 'IBM Plex Sans', sans-serif";
  g.fillStyle = "#94A3B8";
  g.fillText("Built with ❤️ by Rohit Kumar Ranjan • rohitkumarranjan.in", W / 2, H - 24);

  return c;
}

export const canvasToFile = (canvas, filename) =>
  new Promise((resolve) =>
    canvas.toBlob((b) => resolve(new File([b], filename, { type: "image/png" })), "image/png")
  );

export const canvasToPngFile = canvasToFile;

export const canvasToJpegFile = (canvas, filename, quality = 0.95) =>
  new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(new File([b], filename, { type: "image/jpeg" })),
      "image/jpeg",
      quality
    )
  );

export function downloadBlob(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}
