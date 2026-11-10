// UPI Lite (RBI/NPCI): max ₹1,000 per payment, max ₹5,000 wallet balance.
export function planLite(rows, { liteTxMaxPaise, liteWalletPaise }) {
  let load = 0;
  let sum = liteWalletPaise + 1;
  const tagged = rows.map((r) => {
    if (r.amountPaise > liteTxMaxPaise) return { ...r, lite: false, liteLoad: null, liteLoadStart: false };
    const start = sum + r.amountPaise > liteWalletPaise;
    if (start) { load += 1; sum = 0; }
    sum += r.amountPaise;
    return { ...r, lite: true, liteLoad: load, liteLoadStart: start };
  });
  const totals = {};
  tagged.forEach((r) => { if (r.lite) totals[r.liteLoad] = (totals[r.liteLoad] || 0) + r.amountPaise; });
  return tagged.map((r) => (r.lite ? { ...r, liteLoadTotal: totals[r.liteLoad] } : r));
}
