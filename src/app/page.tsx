import Link from "next/link";
import QuickCalc from "@/components/QuickCalc";
import Reveal from "@/components/Reveal";
import { Eyebrow, Headline, Lead, Note, Panel, PillLink } from "@/components/Section";
import { BUILDING_TYPES, BuildingType, CITIES, SPEC } from "@/lib/rates";
import { FAQ } from "@/lib/faq";
import { SITE } from "@/lib/site";
import { num, pkrShort } from "@/lib/format";
import { OPTION_COUNT, SHOWCASE, fromRate } from "@/lib/showcase";
import { PAGE_CITIES, SIZES, cityName, costHref, scenario } from "@/lib/seo";
import OverseasCalc from "@/components/OverseasCalc";
import JsonLd from "@/components/JsonLd";

// Rates shown on the homepage: [spec, option index, label].
const RATE_PREVIEW: [string, number, string][] = [
  ["cement", 0, "Cement"],
  ["steel", 1, "Steel, Grade 60"],
  ["bricks", 1, "Bricks, A-class"],
  ["floorMain", 1, "Porcelain tiles"],
  ["floorMain", 3, "Local marble"],
  ["acType", 1, "Inverter AC"],
];

export default function Home() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Plot.pk House Construction Cost Calculator",
      url: SITE.url,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "PKR" },
      description: SITE.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <Panel className="overflow-hidden">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-16">
          <div>
            <Reveal fade={false}>
              <Eyebrow n="01">Construction cost calculator {SITE.year}</Eyebrow>
            </Reveal>
            <Reveal delay={0.04} fade={false}>
              <Headline as="h1" size="md" accent="priced item by item.">
                House construction cost in Pakistan,
              </Headline>
            </Reveal>
            <Reveal delay={0.16}>
              <Lead>
                Price a 5 marla, 10 marla or 1 kanal house item by item, from grey structure to marble, doors, windows,
                washrooms, ACs and appliances. Free, at {SITE.ratesUpdated} rates, in rupees or your own currency.
              </Lead>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-3">
                <PillLink Comp={Link} href="/calculator/" dark>
                  Start itemised estimate
                </PillLink>
                <Link href="/rates/" className="inline-flex items-center rounded-full border-2 border-line bg-white/60 px-6 py-3 text-lg font-semibold hover:border-peri">
                  Today&apos;s rates
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <Note>
                Indicative Lahore rates, last reviewed {SITE.ratesUpdated}, adjusted for {Object.keys(CITIES).length - 1} cities. Every
                rate and quantity can be changed in the calculator.
              </Note>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <QuickCalc />
          </Reveal>
        </div>
      </Panel>

      {/* Cost by plot size */}
      <Panel>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <Eyebrow n="02">House construction cost {SITE.year}</Eyebrow>
            <Headline size="md" accent="by plot size.">What a house costs</Headline>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-muted lg:justify-self-end">
            Double storey, standard finish in Lahore, with design, approvals and contingency. Open a size for basic to luxury costs,
            grey structure and a full breakdown.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SIZES.map((sz) => {
            const r = scenario(sz, "lahore");
            const g = scenario(sz, "lahore", "standard", sz.floors, "grey");
            return (
              <Link key={sz.slug} href={costHref(sz)} className="group rounded-[28px] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7">
                <h3 className="text-xl font-extrabold tracking-tight">{sz.label} house construction cost</h3>
                <p className="mt-4 text-4xl font-extrabold tracking-tight">{pkrShort(r.total)}</p>
                <p className="mt-1 text-[15px] text-muted">
                  Rs {num(Math.round(r.perSqft))} per sq ft · {num(r.coveredSqft)} sq ft covered
                </p>
                <p className="mt-4 flex justify-between border-t border-line pt-4 text-[15px]">
                  <span className="text-muted">Grey structure only</span>
                  <span className="font-semibold">{pkrShort(g.total)}</span>
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand">
                  Full {sz.label.toLowerCase()} breakdown <span className="transition group-hover:translate-x-1" aria-hidden>→</span>
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Construction cost in your city</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {PAGE_CITIES.map((c) => (
              <li key={c}>
                <Link href={costHref(undefined, c)} className="inline-flex rounded-full border-2 border-line bg-white/70 px-4 py-2 font-semibold hover:border-peri hover:text-brand">
                  {cityName(c)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/grey-structure-cost/" className="inline-flex rounded-full bg-navy px-4 py-2 font-semibold text-white hover:bg-navy-2">
                Grey structure rates →
              </Link>
            </li>
          </ul>
        </div>
      </Panel>

      {/* Itemised sections */}
      <Panel>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <Eyebrow n="03">From grey structure to finishing</Eyebrow>
            <Headline size="md" accent="each priced separately.">Tiles, marble, doors and ACs,</Headline>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-muted lg:justify-self-end">
            {OPTION_COUNT}+ choices across {SHOWCASE.length} sections. Pick a material or fitting for each item and see its quantity, rate
            and cost straight away.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SHOWCASE.map((s) => (
            <Link key={s.title} href="/calculator/" className="group rounded-[28px] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-page text-2xl" aria-hidden>
                {s.icon}
              </span>
              <h3 className="mt-5 text-xl font-extrabold tracking-tight">{s.title}</h3>
              <p className="text-sm font-semibold text-brand">{fromRate(SPEC[s.spec])}</p>
              <ul className="mt-4 space-y-1.5 text-[15px] text-muted">
                {s.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-peri" aria-hidden />
                    {it}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </Panel>

      {/* Overseas */}
      <Panel>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
          <div>
            <Eyebrow n="04">For overseas Pakistanis</Eyebrow>
            <Headline size="md" accent="See the cost in your currency.">Building back home?</Headline>
            <Lead>
              Get the cost in dollars, pounds, dirhams, riyals or euros, then follow our step-by-step guide to building in Pakistan
              from abroad: approvals, contracts, staged payments and Roshan Apna Ghar financing.
            </Lead>
            <div className="mt-8">
              <PillLink Comp={Link} href="/overseas-pakistanis/" dark>
                Guide for overseas Pakistanis
              </PillLink>
            </div>
          </div>
          <OverseasCalc />
        </div>
      </Panel>

      {/* Building types */}
      <Panel>
        <Eyebrow n="05">Homes, flats, offices and plazas</Eyebrow>
        <Headline size="md" accent="for every building.">One calculator</Headline>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(BUILDING_TYPES) as BuildingType[]).map((k) => {
            const t = BUILDING_TYPES[k];
            return (
              <Link key={k} href={`/calculator/?type=${k}`} className="group rounded-[28px] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-page text-3xl" aria-hidden>{t.icon}</span>
                <h3 className="mt-5 text-xl font-extrabold">{t.label}</h3>
                <p className="text-sm font-semibold text-brand">{t.short}</p>
                <p className="mt-2 text-[15px] text-muted">{t.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-navy">
                  Calculate <span className="transition group-hover:translate-x-1" aria-hidden>→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </Panel>

      {/* Rates snapshot */}
      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow n="06">Lahore base rates, {SITE.ratesUpdated}</Eyebrow>
            <Headline size="md" accent="today.">Construction material rates</Headline>
          </div>
          <PillLink Comp={Link} href="/rates/" dark>
            All rates
          </PillLink>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {RATE_PREVIEW.map(([id, i, label]) => {
            const s = SPEC[id];
            const o = s.options[i];
            return (
              <div key={label} className="rounded-[24px] bg-white p-5 shadow-sm">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight">Rs {num(o.rate + (o.fix ?? 0), 1)}</p>
                <p className="text-sm text-muted">per {s.unit}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* How it works */}
      <Panel>
        <Eyebrow n="07">How it works</Eyebrow>
        <Headline size="md" accent="in four steps.">From plot to price</Headline>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Describe the building", "Type, city, plot size, floors, basement and a quality preset: Basic, Standard, Premium or Luxury."],
            ["Check the rooms", "Bedrooms, bathrooms, kitchens and lounges. They set the number of doors, windows, fans, ACs and fittings."],
            ["Choose every item", "Floors, marble, doors, windows, washroom fittings, wiring, ACs, paint, ceilings and appliances."],
            ["Get the breakdown", "Total and per sq ft, quality comparison, quantities, payment plan and an editable bill of quantities."],
          ].map(([t, d], i) => (
            <div key={t} className="rounded-[28px] bg-white p-7 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 text-xl font-extrabold">{t}</h3>
              <p className="mt-2 text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* FAQ */}
      <Panel>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <Eyebrow n="08">FAQs</Eyebrow>
            <Headline size="md" accent="answered.">Construction cost questions,</Headline>
          </div>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-white p-5 shadow-sm open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                  {f.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-page transition group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Panel>

      {/* CTA */}
      <Panel>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <Eyebrow n="09">Ready to plan?</Eyebrow>
            <Headline size="md" accent="takes ten minutes.">A full itemised estimate</Headline>
            <Lead>Share it by link or save it as a PDF for your contractor.</Lead>
          </div>
          <PillLink Comp={Link} href="/calculator/" dark>
            Start itemised estimate
          </PillLink>
        </div>
      </Panel>
    </>
  );
}
