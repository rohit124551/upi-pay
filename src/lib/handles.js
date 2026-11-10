// Common UPI bank & third-party PSP handles. Unknown ones are flagged for a second look, never blocked.
const KNOWN = `ybl ibl axl okaxis okhdfcbank okicici oksbi paytm ptyes ptaxis pthdfc ptsbi apl yapl rapl upi
axisbank axisb icici sbi hdfcbank hdfc kotak kmbl idfcbank idfcfirst ikwik freecharge jupiteraxis fbl federal
waicici waaxis wahdfcbank wasbi superyes naviaxis yespop yespay yesbank abfspay pingpay slc aubank rbl indus
timecosmos tapicici fam mbk pnb barodampay boi cnrb unionbankofindia uboi idbi indianbank centralbank sib kvb
dbs citi hsbc sc ezeepay airtel jio okbizaxis okbizicici dlb cmsidfc postbank ippb aubankltd equitas ujjivan
indie indusind cred axiscred slice sliceaxis fi niyo niyoicici amazonpay fampay jupiter navipay super pop`
  .split(/\s+/);
const SET = new Set(KNOWN);

export const handleOf = (identifier) => (identifier.includes("@") ? identifier.split("@")[1].toLowerCase() : null);
export const isUnusualHandle = (identifier) => {
  const h = handleOf(identifier);
  return !!h && !SET.has(h);
};
