// Data and helpers for the search landing pages (cost by plot size and city).
// Every figure on those pages comes from the same engine as the calculator.
import { DEFAULT_INPUTS, Inputs, Result, calculate } from "./calculate";
import { CITIES, Scope, TIER_KEYS, Tier } from "./rates";
import { SITE } from "./site";
import { pkrWords } from "./format";
import { COST_BASE, SIZES, Size, costHref, sizeBySlug } from "./sizes";

export { COST_BASE, SIZES, costHref, sizeBySlug };
export type { Size };

export const PAGE_CITIES = Object.keys(CITIES).filter((c) => c !== "other");

export const cityName = (c: string) => CITIES[c]?.label ?? c;

export type CostPage =
  | { kind: "combo"; size: Size; city: string }
  | { kind: "size"; size: Size }
  | { kind: "city"; city: string };

export function costSlugs(): string[] {
  return [
    ...SIZES.map((s) => s.slug),
    ...PAGE_CITIES,
    ...SIZES.flatMap((s) => PAGE_CITIES.map((c) => `${s.slug}-${c}`)),
  ];
}

export function parseCostSlug(slug: string): CostPage | null {
  const size = sizeBySlug(slug);
  if (size) return { kind: "size", size };
  if (PAGE_CITIES.includes(slug)) return { kind: "city", city: slug };
  for (const s of SIZES) {
    if (slug.startsWith(`${s.slug}-`)) {
      const city = slug.slice(s.slug.length + 1);
      if (PAGE_CITIES.includes(city)) return { kind: "combo", size: s, city };
    }
  }
  return null;
}

export function scenarioInputs(size: Size, city: string, tier: Tier = "standard", floors = size.floors, scope: Scope = "complete"): Inputs {
  return {
    ...DEFAULT_INPUTS,
    type: "home",
    city,
    plotSize: size.plotSize,
    plotUnit: size.plotUnit,
    coverage: size.coverage,
    floors,
    tier,
    scope,
  };
}

const cache = new Map<string, Result>();
export function scenario(size: Size, city: string, tier: Tier = "standard", floors = size.floors, scope: Scope = "complete"): Result {
  const key = [size.slug, city, tier, floors, scope].join("|");
  let r = cache.get(key);
  if (!r) {
    r = calculate(scenarioInputs(size, city, tier, floors, scope));
    cache.set(key, r);
  }
  return r;
}

export function calculatorHref(size: Size, city: string, tier: Tier = "standard", floors = size.floors) {
  return `/calculator/?type=home&size=${size.plotSize}&unit=${size.plotUnit}&floors=${floors}&tier=${tier}&scope=complete&city=${city}&cover=${size.coverage}`;
}

export const TIERS_ALL = TIER_KEYS;

// Short answer used in meta descriptions and the opening paragraph.
export function comboSummary(size: Size, city: string): string {
  const std = scenario(size, city);
  const grey = scenario(size, city, "standard", size.floors, "grey");
  return `A double-storey ${size.label.toLowerCase()} house in ${cityName(city)} costs about ${pkrWords(std.total)} to build with a standard finish in ${SITE.ratesUpdated}, or Rs ${Math.round(std.perSqft).toLocaleString("en-PK")} per sq ft. The grey structure alone is about ${pkrWords(grey.total)}.`;
}

// ---------- Structured data ----------

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.href}`,
    })),
  };
}

export function faqLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function articleLd(title: string, description: string, href: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE.url}${href}`,
    dateModified: SITE.ratesUpdatedIso,
    inLanguage: "en-PK",
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url, logo: { "@type": "ImageObject", url: `${SITE.url}/icon.png` } },
    image: `${SITE.url}/og.png`,
  };
}
