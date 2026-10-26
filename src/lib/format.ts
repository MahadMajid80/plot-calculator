// Number formatting in the Pakistani style (lakh / crore grouping).

const grouped = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });
const grouped2 = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 });

export function pkr(n: number): string {
  return `Rs ${grouped.format(Math.round(n))}`;
}

export function num(n: number, decimals = 0): string {
  return decimals ? grouped2.format(n) : grouped.format(Math.round(n));
}

// "1.25 crore", "45.3 lakh", or a plain figure for small amounts.
export function pkrWords(n: number): string {
  if (n >= 1e7) return `Rs ${(n / 1e7).toFixed(2)} crore`;
  if (n >= 1e5) return `Rs ${(n / 1e5).toFixed(1)} lakh`;
  return pkr(n);
}

// Compact form for large tiles: "Rs 2.91 Cr", "Rs 45.3 Lakh".
export function pkrShort(n: number): string {
  if (n >= 1e7) return `Rs ${(n / 1e7).toFixed(n >= 1e9 ? 0 : 2)} Cr`;
  if (n >= 1e5) return `Rs ${(n / 1e5).toFixed(1)} Lakh`;
  return pkr(n);
}
