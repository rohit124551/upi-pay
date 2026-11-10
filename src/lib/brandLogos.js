/**
 * Official Brand SVG Assets for OpenUPI
 * 
 * Contains authorized, official vector marks for BHIM, UPI, Google Pay, PhonePe, and Paytm.
 * NO Amazon Pay.
 */

const publicUrl = process.env.PUBLIC_URL || "";

export const LOGO_PATHS = {
  bhim: `${publicUrl}/bhim.svg`,
  upi: `${publicUrl}/upi.svg`,
  gpay: `${publicUrl}/gpay.svg`,
  phonepe: `${publicUrl}/phonepe.svg`,
  paytm: `${publicUrl}/paytm.svg`,
};

/**
 * Loads an image from a URL or data URI with a promise wrapper.
 * Resolves to HTMLImageElement or null on failure (never rejects).
 */
export const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

/**
 * Preloads all brand logos in parallel for canvas rendering.
 */
export async function loadBrandLogos() {
  const [bhim, upi, gpay, phonepe, paytm] = await Promise.all([
    loadImage(LOGO_PATHS.bhim),
    loadImage(LOGO_PATHS.upi),
    loadImage(LOGO_PATHS.gpay),
    loadImage(LOGO_PATHS.phonepe),
    loadImage(LOGO_PATHS.paytm),
  ]);
  return { bhim, upi, gpay, phonepe, paytm };
}

