import { pageMeta } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CostPageView, { costPageMeta } from "@/components/CostPages";
import { COST_BASE, costSlugs, parseCostSlug } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return costSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = parseCostSlug(slug);
  if (!page) return {};
  const m = costPageMeta(page);
  const url = `${COST_BASE}/${slug}/`;
  return pageMeta(m.title, m.description, url);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = parseCostSlug(slug);
  if (!page) notFound();
  return <CostPageView page={page} />;
}
