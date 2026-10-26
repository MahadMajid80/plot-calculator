import Link from "next/link";
import { BUILDING_TYPES, BuildingType } from "@/lib/rates";
import { PAGE_CITIES, SIZES, cityName, costHref } from "@/lib/seo";
import { SITE } from "@/lib/site";

const head = "mb-3 text-sm font-semibold uppercase tracking-wider text-ink";

export default function Footer() {
  return (
    <footer className="px-2 pb-2 pt-1.5 sm:px-4 sm:pb-4 sm:pt-2">
      <div className="mx-auto max-w-[1400px] rounded-[28px] bg-panel text-muted sm:rounded-[40px]">
        <div className="grid gap-10 px-6 py-14 sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:px-16">
          <div>
            <p className="text-xl font-extrabold text-ink">
              Plot<span className="text-brand">.pk</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed">
              Free, itemised construction cost estimates for homes, apartments, offices and plazas across Pakistan, for families at home
              and overseas Pakistanis building from abroad.
            </p>
            <Link href="/calculator/" className="mt-5 inline-flex rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-2">
              Calculate your cost
            </Link>
          </div>
          <nav aria-label="Calculators">
            <p className={head}>Calculators</p>
            <ul className="space-y-2 text-sm">
              {(Object.keys(BUILDING_TYPES) as BuildingType[]).map((k) => (
                <li key={k}>
                  <Link href={`/calculator/?type=${k}`} className="hover:text-ink">
                    {BUILDING_TYPES[k].label} construction cost
                  </Link>
                </li>
              ))}
              <li><Link href="/calculator/?scope=grey" className="hover:text-ink">Grey structure calculator</Link></li>
            </ul>
          </nav>
          <nav aria-label="Cost by plot size">
            <p className={head}>Cost by plot size</p>
            <ul className="space-y-2 text-sm">
              {SIZES.map((s) => (
                <li key={s.slug}>
                  <Link href={costHref(s)} className="hover:text-ink">{s.label} house cost</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Cost by city">
            <p className={head}>Cost by city</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:grid-cols-1">
              {PAGE_CITIES.slice(0, 8).map((c) => (
                <li key={c}>
                  <Link href={costHref(undefined, c)} className="hover:text-ink">{cityName(c)}</Link>
                </li>
              ))}
              <li><Link href="/house-construction-cost/" className="font-semibold text-brand hover:text-ink">All cities</Link></li>
            </ul>
          </nav>
          <nav aria-label="Guides">
            <p className={head}>Guides</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/overseas-pakistanis/" className="hover:text-ink">Build from abroad</Link></li>
              <li><Link href="/grey-structure-cost/" className="hover:text-ink">Grey structure cost</Link></li>
              <li><Link href="/rates/" className="hover:text-ink">Material rates today</Link></li>
              <li><Link href="/how-it-works/" className="hover:text-ink">How we estimate</Link></li>
              <li><Link href="/about/" className="hover:text-ink">About Plot.pk</Link></li>
              <li><Link href="/privacy/" className="hover:text-ink">Privacy</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-line">
          <div className="flex flex-wrap justify-between gap-2 px-6 py-6 text-xs sm:px-10 lg:px-16">
            <p>© {SITE.year} {SITE.name}. Estimates are indicative; get a contractor quote before you build.</p>
            <p>Rates last reviewed {SITE.ratesUpdated}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
