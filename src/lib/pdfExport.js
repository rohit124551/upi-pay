/**
 * pdfExport.js — Pure client-side PDF 1.4 document generator for UPI Pay
 *
 * Embeds a canvas-rendered payment standee JPEG image directly into a standard
 * PDF 1.4 document sized for A4 print.
 *
 * Zero external npm dependencies. 100% client-side & offline-capable.
 */

import { downloadBlob } from "./qrImage";

/**
 * Creates a valid PDF 1.4 document embedding a JPEG image.
 *
 * @param {Uint8Array} jpegBytes The raw JPEG binary data
 * @param {number} imgWidth Pixel width of the image
 * @param {number} imgHeight Pixel height of the image
 * @returns {Uint8Array} The complete binary PDF file
 */
export function buildPdfFromJpeg(jpegBytes, imgWidth, imgHeight) {
  // Standard A4 dimensions in PDF points (72 pt per inch)
  // A4 = 210mm x 297mm = 595.28 pt x 841.89 pt
  const pageW = 595.28;
  const pageH = 841.89;

  // Scale image to fit within A4 margins (36 pt / 0.5 inch margins)
  const margin = 36;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const aspect = imgWidth / imgHeight;

  let fitW = maxW;
  let fitH = fitW / aspect;
  if (fitH > maxH) {
    fitH = maxH;
    fitW = fitH * aspect;
  }

  // Center image on the page
  const posX = (pageW - fitW) / 2;
  const posY = (pageH - fitH) / 2;

  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [];
  let currentOffset = 0;

  function write(str) {
    const bytes = encoder.encode(str);
    chunks.push(bytes);
    currentOffset += bytes.length;
  }

  function writeBytes(bytes) {
    chunks.push(bytes);
    currentOffset += bytes.length;
  }

  // PDF Header (with binary comment for compliant 8-bit transport)
  write("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  // Obj 1: Catalog
  offsets[1] = currentOffset;
  write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Obj 2: Pages
  offsets[2] = currentOffset;
  write("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  // Obj 3: Page
  offsets[3] = currentOffset;
  write(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW.toFixed(2)} ${pageH.toFixed(2)}] ` +
    `/Resources << /XObject << /Im1 5 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 4 0 R >>\nendobj\n`
  );

  // Content stream instructions:
  // q (save state) -> posX posY fitW fitH cm (coordinate transform) -> /Im1 Do (draw image) -> Q (restore)
  const contentOps = `q\n${fitW.toFixed(2)} 0 0 ${fitH.toFixed(2)} ${posX.toFixed(2)} ${posY.toFixed(2)} cm\n/Im1 Do\nQ\n`;
  const contentBytes = encoder.encode(contentOps);

  // Obj 4: Content Stream
  offsets[4] = currentOffset;
  write(`4 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
  writeBytes(contentBytes);
  write("\nendstream\nendobj\n");

  // Obj 5: Image XObject (the JPEG stream)
  offsets[5] = currentOffset;
  write(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} ` +
    `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  writeBytes(jpegBytes);
  write("\nendstream\nendobj\n");

  // Xref table
  const startXref = currentOffset;
  write("xref\n0 6\n0000000000 65535 f \n");
  for (let i = 1; i <= 5; i++) {
    const offStr = String(offsets[i]).padStart(10, "0");
    write(`${offStr} 00000 n \n`);
  }

  // Trailer
  write(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`);

  // Concatenate all chunks into a single Uint8Array
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const out = new Uint8Array(totalLength);
  let pos = 0;
  for (const chunk of chunks) {
    out.set(chunk, pos);
    pos += chunk.length;
  }
  return out;
}

/**
 * Encodes an HTMLCanvasElement into a raw JPEG binary Uint8Array.
 */
export function canvasToJpegBytes(canvas, quality = 0.95) {
  return new Promise((resolve) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) return resolve(null);
        const buffer = await blob.arrayBuffer();
        resolve(new Uint8Array(buffer));
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Exports a canvas directly as a downloaded A4 PDF standee document.
 */
export async function exportCanvasAsPdf(canvas, filename = "upi-pay-standee.pdf") {
  const jpegBytes = await canvasToJpegBytes(canvas, 0.95);
  if (!jpegBytes) throw new Error("Could not encode JPEG for PDF generation");
  const pdfBytes = buildPdfFromJpeg(jpegBytes, canvas.width, canvas.height);
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  downloadBlob(new File([blob], filename, { type: "application/pdf" }));
}

