// All money is integer paise. Never floats.
export const toPaise = (intPart, frac) =>
  Number(String(intPart).replace(/,/g, "")) * 100 + (frac ? Number(frac.padEnd(2, "0")) : 0);

const fmt0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const fmt2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatINR = (paise) => {
  const abs = Math.abs(paise);
  const body = abs % 100 === 0 ? fmt0.format(abs / 100) : fmt2.format(abs / 100);
  return `${paise < 0 ? "-" : ""}₹${body}`;
};

export const paiseToPlain = (paise) => `${Math.floor(paise / 100)}.${String(paise % 100).padStart(2, "0")}`;

export const sumPaise = (list, pick = (x) => x) => list.reduce((s, x) => s + pick(x), 0);
