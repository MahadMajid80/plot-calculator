import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/PageHead";
import { Eyebrow, Headline, Panel, PillLink } from "@/components/Section";
import { CITIES, SPECS } from "@/lib/rates";
import { OPTION_COUNT } from "@/lib/showcase";
import { SITE, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  "About Plot.pk: Free Construction Cost Estimates for Pakistan",
  "Why Plot.pk exists, where our construction rates come from, how often they are reviewed and what our estimates do and don't include.",
  "/about/",
);

const POINTS: [string, string][] = [
  [
    "Built for people who are paying for the build",
    "Families planning a home in Pakistan and overseas Pakistanis building from the Gulf, UK, Europe or North America. You should know what a fair price looks like before you talk to a contractor.",
  ],
  [
    "Every item priced on its own",
    `${SPECS.length} items with ${OPTION_COUNT}+ material and fitting choices, from bricks and steel to marble, doors, windows, washrooms, ACs and appliances. Nothing is hidden in a single per-sq-ft number.`,
  ],
  [
    "Rates with a date on them",
    `Base rates are Lahore market prices for supply and fixing, last reviewed ${SITE.ratesUpdated}. They are based on published market rates and contractor pricing, then adjusted for ${Object.keys(CITIES).length - 1} cities.`,
  ],
  [
    "Open about the method",
    "Quantities come from standard thumb rules per sq ft of covered area and from your room counts. You can see and change every quantity and rate in the bill of quantities.",
  ],
  [
    "Free, with no sign-up",
    "The calculator runs in your browser. We don't ask for your phone number, and we don't sell leads to contractors.",
  ],
];

export default function AboutPage() {
  return (
    <>
      <PageHead
        eyebrow="About Plot.pk"
        title="Honest construction costs,"
        accent="for every Pakistani."
        lead="Plot.pk is a free, itemised construction cost calculator for Pakistan. It turns your plot size, city and choices into a detailed estimate you can take to any contractor."
        crumbs={[{ name: "Home", href: "/" }, { name: "About", href: "/about/" }]}
      />
      <Panel>
        <Eyebrow n="02">What we stand for</Eyebrow>
        <Headline size="md" accent="you can check yourself.">Clear numbers</Headline>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {POINTS.map(([t, d], i) => (
            <div key={t} className="rounded-[28px] bg-white p-7 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 text-xl font-extrabold tracking-tight">{t}</h3>
              <p className="mt-2 text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <Eyebrow n="03">Before you build</Eyebrow>
        <Headline size="md" accent="not a quote.">An estimate is a guide,</Headline>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">
          Prices change with steel and cement markets, your design, soil, site access and the contractor you choose. Use Plot.pk to set a
          budget and compare quotes, then get a written quote from a qualified contractor and a structural design from a registered
          engineer before you start.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <PillLink Comp={Link} href="/calculator/" dark>
            Start your estimate
          </PillLink>
          <Link href="/how-it-works/" className="inline-flex items-center rounded-full border-2 border-line bg-white/60 px-6 py-3 text-lg font-semibold hover:border-peri">
            How we estimate
          </Link>
        </div>
      </Panel>
    </>
  );
}
