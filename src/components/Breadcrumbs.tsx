import Link from "next/link";
import JsonLd from "./JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export type Crumb = { name: string; href: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbLd(items)} />
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((c, i) => (
            <li key={c.href} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="text-ink/30">/</span>}
              {i === items.length - 1 ? (
                <span aria-current="page" className="font-semibold text-ink">{c.name}</span>
              ) : (
                <Link href={c.href} className="hover:text-brand hover:underline">{c.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
