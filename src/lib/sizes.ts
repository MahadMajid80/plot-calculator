// Plot sizes for the cost landing pages. Kept free of the cost engine so client
// components (the header menu) can import it without shipping the rates data.
export interface Size {
  slug: string;
  label: string; // "10 Marla"
  plotSize: number;
  plotUnit: string;
  coverage: number; // typical covered share of the plot per floor
  floors: number;
}

export const SIZES: Size[] = [
  { slug: "3-marla", label: "3 Marla", plotSize: 3, plotUnit: "marla225", coverage: 80, floors: 2 },
  { slug: "5-marla", label: "5 Marla", plotSize: 5, plotUnit: "marla225", coverage: 80, floors: 2 },
  { slug: "7-marla", label: "7 Marla", plotSize: 7, plotUnit: "marla225", coverage: 75, floors: 2 },
  { slug: "10-marla", label: "10 Marla", plotSize: 10, plotUnit: "marla225", coverage: 75, floors: 2 },
  { slug: "1-kanal", label: "1 Kanal", plotSize: 1, plotUnit: "kanal", coverage: 65, floors: 2 },
  { slug: "2-kanal", label: "2 Kanal", plotSize: 2, plotUnit: "kanal", coverage: 55, floors: 2 },
];

export const COST_BASE = "/house-construction-cost";

export const sizeBySlug = (s: string) => SIZES.find((x) => x.slug === s);

export const costHref = (size?: Size, city?: string) =>
  `${COST_BASE}/${[size?.slug, city].filter(Boolean).join("-")}/`;

// Typical covered share per floor for a house, by plot size in marla (matches SIZES above).
export const homeCoverage = (marla: number) => (marla <= 5 ? 80 : marla <= 10 ? 75 : marla <= 20 ? 65 : 55);
