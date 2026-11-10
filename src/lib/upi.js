import { paiseToPlain } from "./money";

const enc = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

export const buildUpiUri = ({ identifier, name, amountPaise }, note) => {
  const parts = [`pa=${enc(identifier)}`, `pn=${enc(name || identifier)}`];
  if (amountPaise) parts.push(`am=${paiseToPlain(amountPaise)}`);
  parts.push("cu=INR");
  if (note) parts.push(`tn=${enc(note)}`);
  return `upi://pay?${parts.join("&")}`;
};

export const lastFour = (identifier) => {
  const handle = identifier.includes("@") ? identifier.split("@")[0] : identifier;
  return handle.slice(-4);
};
