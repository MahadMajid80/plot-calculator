import type { MetadataRoute } from "next";
import { COST_BASE, costSlugs, parseCostSlug } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// Every static route, with the guide pages ranked above the long tail of size × city pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = SITE.ratesUpdatedIso;
  const core: [string, number][] = [
    ["/", 1],
    ["/calculator/", 0.95],
    [`${COST_BASE}/`, 0.9],
    ["/overseas-pakistanis/", 0.9],
    ["/grey-structure-cost/", 0.9],
    ["/rates/", 0.85],
    ["/how-it-works/", 0.6],
    ["/about/", 0.4],
    ["/privacy/", 0.2],
  ];
  const cost = costSlugs().map((slug): [string, number] => {
    const kind = parseCostSlug(slug)?.kind;
    return [`${COST_BASE}/${slug}/`, kind === "combo" ? 0.6 : 0.8];
  });
  return [...core, ...cost].map(([p, priority]) => ({
    url: `${SITE.url}${p}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
