import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import OverseasCalc from "@/components/OverseasCalc";
import PageHead from "@/components/PageHead";
import { Panel, PillLink } from "@/components/Section";
import { FaqPanel, SectionTitle, Table } from "@/components/CostPages";
import { FX, SITE, inCurrency, pageMeta } from "@/lib/site";
import { SIZES, articleLd, costHref, faqLd, scenario } from "@/lib/seo";
import { pkrShort } from "@/lib/format";

const ten = scenario(SIZES[3], "lahore");
const title = `Build a House in Pakistan from Abroad (${SITE.year} Guide)`;
const description = `What it costs to build a house in Pakistan in dollars, pounds, dirhams and riyals, and how overseas Pakistanis can plan, pay for and supervise construction from abroad. A 10 marla house costs about ${inCurrency(ten.total, "USD")}.`;

export const metadata: Metadata = pageMeta(title, description, "/overseas-pakistanis/");

const STEPS: [string, string][] = [
  ["Check the plot and its papers", "Confirm the housing society is approved by the development authority (such as LDA, CDA, RDA or KDA), the plot is in your name, dues are clear and you have possession."],
  ["Get drawings and an approved map", "Hire an architect and a structural engineer, then get the map approved by the society or authority before any digging starts. Covered area on the approved map drives your cost."],
  ["Set a budget with room to spare", "Use the calculator to price every item, then keep 5 to 10% aside. Steel and cement prices can move during a 12 to 18 month build."],
  ["Choose a contract type", "A with-material (turnkey) contract is easiest to manage from abroad. Labour-only is cheaper, but someone you trust must buy and check every load of material."],
  ["Put a trusted person on site", "A family member or an independent site engineer should visit at least weekly. If they will sign for you, a special power of attorney is usually attested at a Pakistani embassy or consulate."],
  ["Sign a written contract", "Write down the scope, the grade of steel and cement, tile and fitting choices, the timeline, the payment schedule, penalties for delay and a defects period. Our bill of quantities is a good starting list."],
  ["Pay in stages, against work done", "Release money at the end of each phase (foundation, structure, slabs, plaster, finishing), not in big advances. Ask for photos and videos before each payment."],
  ["Send money through banks", "Use a Roshan Digital Account or a normal bank transfer, and keep every remittance record. They help you show where the money came from later."],
  ["Inspect at the key moments", "Before each slab is poured (to check the steel), before plaster (pipes and conduits) and before tiles. Mistakes hidden here are the most expensive to fix."],
  ["Hand over and get the completion certificate", "Check every room against the contract, keep a snag list, hold back a small final payment until it is fixed, and apply for the completion certificate."],
];

export default function OverseasPage() {
  const faq = [
    {
      q: "How much does it cost to build a house in Pakistan in US dollars?",
      a: `At ${SITE.ratesUpdated} rates, a standard double-storey 5 marla house costs about ${inCurrency(scenario(SIZES[1], "lahore").total, "USD")}, a 10 marla house about ${inCurrency(ten.total, "USD")} and a 1 kanal house about ${inCurrency(scenario(SIZES[4], "lahore").total, "USD")} in Lahore, excluding the plot.`,
    },
    {
      q: "Can I build a house in Pakistan while living abroad?",
      a: "Yes. Many overseas Pakistanis do. The keys are an approved map, a written contract, a trusted person or site engineer on the ground, stage payments tied to finished work, and regular photo and video updates.",
    },
    {
      q: "Can overseas Pakistanis get a home loan to build?",
      a: "The State Bank of Pakistan's Roshan Apna Ghar scheme lets non-resident Pakistanis and POC holders buy, build or renovate a home through their Roshan Digital Account, with their own funds or bank financing. Check the current terms with a participating bank.",
    },
    {
      q: "How do I know a contractor's quote is fair?",
      a: "Price the same house in the calculator with the same finishes, then compare the contractor's bill of quantities line by line: quantities of bricks, cement and steel, and the rates for tiles, doors, windows and fittings. Ask about any line that is far off.",
    },
    {
      q: "Which exchange rates do you use?",
      a: `Indicative open-market buying rates for ${SITE.ratesUpdated}: ${FX.slice(0, 4).map((f) => `${f.code} Rs ${f.pkr}`).join(", ")}. Your bank's rate on the day will differ a little.`,
    },
  ];

  return (
    <>
      <JsonLd data={[faqLd(faq), articleLd(title, description, "/overseas-pakistanis/")]} />
      <PageHead
        crumbs={[{ name: "Home", href: "/" }, { name: "Overseas Pakistanis", href: "/overseas-pakistanis/" }]}
        eyebrow="For overseas Pakistanis"
        title="Build your home in Pakistan"
        accent="from wherever you live."
        lead="See the cost in your own currency, then follow ten practical steps to plan, pay for and supervise the build from abroad."
        note={<>Figures exclude the plot. Exchange rates are indicative open-market rates for {SITE.ratesUpdated}.</>}
        aside={<OverseasCalc />}
      />

      <Panel>
        <SectionTitle n="02" eyebrow="Standard finish, Lahore" title="House costs" accent="in your currency." />
        <Table
          head={["Plot size", "PKR", ...FX.slice(0, 6).map((f) => f.code)]}
          rows={SIZES.map((s) => {
            const r = scenario(s, "lahore");
            return [
              <Link key="s" href={costHref(s, "lahore")} className="font-semibold text-brand hover:underline">{s.label}</Link>,
              <b key="p">{pkrShort(r.total)}</b>,
              ...FX.slice(0, 6).map((f) => inCurrency(r.total, f.code)),
            ];
          })}
        />
      </Panel>

      <Panel>
        <SectionTitle n="03" eyebrow="Step by step" title="Ten steps to build" accent="from abroad." />
        <ol className="grid gap-4 md:grid-cols-2">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="flex gap-5 rounded-[28px] bg-white p-6 shadow-sm">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
              <div>
                <h3 className="text-lg font-extrabold">{t}</h3>
                <p className="mt-1 leading-relaxed text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionTitle n="04" eyebrow="Avoid these" title="Mistakes that" accent="cost the most." size="sm" />
            <ul className="space-y-3">
              {[
                ["Big advances", "Paying a large share up front leaves you with no leverage if work slows or stops."],
                ["No written specifications", "\"Good quality tiles\" means something different to everyone. Name the material, grade and rate."],
                ["Nobody checking the steel", "Steel and concrete inside the slabs can't be checked later. Someone must see them before each pour."],
                ["Budgeting only for grey structure", "Finishing is often half the cost or more. Price it before you start."],
                ["Choosing the lowest quote", "A quote far below the calculator usually means cheaper materials or extra charges later."],
              ].map(([t, d]) => (
                <li key={t} className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="font-bold">{t}</h3>
                  <p className="mt-1 text-muted">{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">
            <SectionTitle n="05" eyebrow="Financing" title="Roshan" accent="Apna Ghar." size="sm" />
            <div className="rounded-[24px] bg-white p-6 shadow-sm">
              <p className="leading-relaxed text-muted">
                The State Bank of Pakistan&apos;s Roshan Apna Ghar lets non-resident Pakistanis and Pakistan Origin Card holders buy,
                build or renovate a home through a Roshan Digital Account, using their own funds or conventional or Islamic bank
                financing. Much of the process can be done remotely, with a nominated person in Pakistan for the formalities.
              </p>
              <a
                href="https://www.sbp.org.pk/RDAC/Ghar.html"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-semibold text-brand hover:underline"
              >
                Read the details on the State Bank&apos;s site ↗
              </a>
            </div>
          </div>
        </div>
      </Panel>

      <FaqPanel n="06" faq={faq} />

      <Panel>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Get an itemised estimate <span className="text-brand">to check every quote.</span>
          </h2>
          <PillLink Comp={Link} href="/calculator/" dark>
            Start itemised estimate
          </PillLink>
        </div>
      </Panel>
    </>
  );
}
