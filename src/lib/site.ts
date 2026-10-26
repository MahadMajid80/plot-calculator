// Site-wide settings in one place.
export const SITE = {
  name: "Plot.pk",
  url: "https://plot.pk",
  tagline: "Construction cost calculator for Pakistan",
  description:
    "Free construction cost calculator for Pakistan (2026). Price a 5 marla, 10 marla or 1 kanal house item by item: grey structure, tiles, marble, doors, windows, fittings, ACs and finishing, in PKR, USD, GBP, AED and SAR.",
  ratesUpdated: "October 2026",
  ratesUpdatedIso: "2026-10-26",
  year: 2026,
};

// Indicative open-market buying rates (PKR per unit) for overseas Pakistanis, reviewed October 2026.
// Update these together with the date above.
export const FX: { code: string; label: string; country: string; pkr: number }[] = [
  { code: "USD", label: "US dollar", country: "USA", pkr: 277.4 },
  { code: "GBP", label: "British pound", country: "UK", pkr: 369.45 },
  { code: "AED", label: "UAE dirham", country: "UAE", pkr: 75.6 },
  { code: "SAR", label: "Saudi riyal", country: "Saudi Arabia", pkr: 73.85 },
  { code: "EUR", label: "Euro", country: "Europe", pkr: 311.08 },
  { code: "CAD", label: "Canadian dollar", country: "Canada", pkr: 195.18 },
  { code: "AUD", label: "Australian dollar", country: "Australia", pkr: 191.15 },
  { code: "QAR", label: "Qatari riyal", country: "Qatar", pkr: 75.2 },
  { code: "OMR", label: "Omani riyal", country: "Oman", pkr: 718.71 },
  { code: "KWD", label: "Kuwaiti dinar", country: "Kuwait", pkr: 884.35 },
];

export function inCurrency(pkr: number, code: string): string {
  const c = FX.find((f) => f.code === code);
  if (!c) return "";
  const v = pkr / c.pkr;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: v < 1000 ? 1 : 0 }).format(v);
}

// Per-page metadata. Next replaces (not merges) openGraph/twitter from the layout,
// so every page passes through here to keep the share image and card type.
export function pageMeta(title: string, description: string, path: string) {
  const images = [{ url: "/og.png", width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, siteName: SITE.name, locale: "en_PK", title, description, url: path, images },
    twitter: { card: "summary_large_image" as const, title, description, images: ["/og.png"] },
  };
}
