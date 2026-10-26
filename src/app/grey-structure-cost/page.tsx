import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHead from "@/components/PageHead";
import { Panel, PillLink } from "@/components/Section";
import { FaqPanel, HeadlineCard, OverseasPanel, SectionTitle, Table } from "@/components/CostPages";
import { CITIES, GREY_QTY, SPEC } from "@/lib/rates";
import { num, pkr, pkrShort, pkrWords } from "@/lib/format";
import { SITE, pageMeta } from "@/lib/site";
import { PAGE_CITIES, SIZES, TIERS_ALL, articleLd, calculatorHref, cityName, costHref, faqLd, scenario } from "@/lib/seo";
import { TIERS } from "@/lib/rates";

const TEN = SIZES[3];
const grey = (city: string, size = TEN, tier: "economy" | "standard" | "premium" | "luxury" = "standard") =>
  scenario(size, city, tier, size.floors, "grey");
const labourRate = (city: string) => SPEC.greyLabour.options[1].rate * CITIES[city].factor;

const lahore = grey("lahore");
const title = `Grey Structure Cost in Pakistan ${SITE.year}: Rate per Sq Ft`;
const description = `Grey structure costs about Rs ${num(lahore.perSqft)} per sq ft with material in Lahore (${SITE.ratesUpdated}) and Rs ${num(labourRate("lahore"))} per sq ft labour only. See rates for ${PAGE_CITIES.length} cities and 3 marla to 2 kanal houses.`;

export const metadata: Metadata = pageMeta(title, description, "/grey-structure-cost/");

export default function GreyStructurePage() {
  const faq = [
    {
      q: `What is the grey structure rate per sq ft in ${SITE.year}?`,
      a: `With material, grey structure costs about Rs ${num(lahore.perSqft)} per sq ft in Lahore, including design, approvals, contractor margin and contingency. Across Pakistan it ranges from Rs ${num(Math.min(...PAGE_CITIES.map((c) => grey(c).perSqft)))} to Rs ${num(Math.max(...PAGE_CITIES.map((c) => grey(c).perSqft)))} per sq ft depending on the city.`,
    },
    {
      q: "What is the labour-only rate for grey structure?",
      a: `A labour-only grey structure contract costs about Rs ${num(SPEC.greyLabour.options[0].rate)} to Rs ${num(SPEC.greyLabour.options[2].rate)} per sq ft in Lahore, depending on whether you hire a local thekedar or a construction company. You buy the bricks, cement, steel, sand and crush yourself.`,
    },
    {
      q: "What does grey structure include?",
      a: "Excavation, foundation, columns, beams, brickwork, roof slabs, plaster, DPC and termite proofing, roof waterproofing and insulation, water and sewerage pipes, electrical conduits and gas piping. Tiles, doors, windows, paint, fittings and wiring come later, in finishing.",
    },
    {
      q: "How much of the total cost is grey structure?",
      a: `For a standard double-storey house, grey structure is about ${Math.round((grey("lahore").total / scenario(TEN, "lahore").total) * 100)}% of the complete cost. The share drops for premium and luxury houses because finishing costs rise much faster than structure.`,
    },
  ];
  return (
    <>
      <JsonLd data={[faqLd(faq), articleLd(title, description, "/grey-structure-cost/")]} />
      <PageHead
        crumbs={[{ name: "Home", href: "/" }, { name: "Grey structure cost", href: "/grey-structure-cost/" }]}
        eyebrow={`Grey structure · ${SITE.ratesUpdated} rates`}
        title="Grey structure cost in Pakistan"
        accent={`${SITE.year} rates per sq ft.`}
        lead={`The grey structure of a double-storey 10 marla house in Lahore costs about ${pkrWords(lahore.total)}, or Rs ${num(lahore.perSqft)} per sq ft with material. Labour only is about Rs ${num(labourRate("lahore"))} per sq ft.`}
        aside={<HeadlineCard r={lahore} grey={lahore.total} label={`10 marla grey structure, Lahore, ${num(lahore.coveredSqft)} sq ft`} cta={calculatorHref(TEN, "lahore")} />}
      />

      <Panel>
        <SectionTitle n="02" eyebrow="By city" title="Grey structure rates" accent="in every major city." />
        <Table
          head={["City", "With material / sq ft", "Labour only / sq ft", "10 marla", "1 kanal"]}
          rows={PAGE_CITIES.map((c) => [
            <Link key="c" href={costHref(undefined, c)} className="font-semibold text-brand hover:underline">{cityName(c)}</Link>,
            pkr(grey(c).perSqft),
            pkr(labourRate(c)),
            pkrShort(grey(c).total),
            pkrShort(grey(c, SIZES[4]).total),
          ])}
        />
      </Panel>

      <Panel>
        <SectionTitle n="03" eyebrow="By plot size, Lahore" title="Grey structure cost" accent="from 3 marla to 2 kanal." />
        <Table
          head={["Plot size", "Covered area", ...TIERS_ALL.map((t) => TIERS[t].label)]}
          rows={SIZES.map((s) => [
            <Link key="s" href={costHref(s, "lahore")} className="font-semibold text-brand hover:underline">{s.label}</Link>,
            `${num(grey("lahore", s).coveredSqft)} sq ft`,
            ...TIERS_ALL.map((t) => pkrShort(grey("lahore", s, t).total)),
          ])}
        />
        <p className="mt-4 text-sm text-muted">Basic to luxury here changes the bricks, steel grade, sand, roof insulation, pipes and labour team, not the design.</p>
      </Panel>

      <Panel>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionTitle n="04" eyebrow="Thumb rules" title="Materials" accent="per sq ft." size="sm" />
            <Table
              head={["Material", "Per sq ft", "Per 1,000 sq ft", "Rate (Lahore)"]}
              rows={[
                ["Bricks", `${GREY_QTY.bricks}`, num(GREY_QTY.bricks * 1000), `Rs ${SPEC.bricks.options[1].rate} each`],
                ["Cement", `${GREY_QTY.cement} bags`, `${num(GREY_QTY.cement * 1000)} bags`, `Rs ${num(SPEC.cement.options[0].rate)} / bag`],
                ["Steel", `${GREY_QTY.steel} kg`, `${num(GREY_QTY.steel)} tonnes`, `Rs ${num(SPEC.steel.options[1].rate)} / kg`],
                ["Sand", `${GREY_QTY.sand} cft`, `${num(GREY_QTY.sand * 1000)} cft`, `Rs ${SPEC.sand.options[0].rate} / cft`],
                ["Crush", `${GREY_QTY.crush} cft`, `${num(GREY_QTY.crush * 1000)} cft`, `Rs ${SPEC.crush.options[0].rate} / cft`],
              ]}
            />
            <p className="mt-4 text-sm text-muted">For a house with an RCC frame. Apartments, offices and plazas use more steel and cement per sq ft.</p>
          </div>
          <div className="min-w-0">
            <SectionTitle n="05" eyebrow="What's included" title="Grey structure" accent="covers." size="sm" />
            <ul className="grid gap-2 rounded-[24px] bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
              {[
                "Excavation & backfill",
                "Foundation & plinth",
                "Columns, beams & slabs",
                "Brickwork & plaster",
                "DPC & termite proofing",
                "Roof waterproofing & insulation",
                "Water & sewerage pipes",
                "Electrical conduits",
                "Gas piping",
                "Shuttering & curing",
                "Mistri & mazdoor labour",
                "Boundary wall & tank (optional)",
              ].map((x) => (
                <li key={x} className="flex gap-2 text-[15px]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden /> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>

      <OverseasPanel n="06" total={lahore.total} subject="the grey structure of a 10 marla house in Lahore" />
      <FaqPanel n="07" faq={faq} />
      <Panel>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Price your own grey structure, <span className="text-brand">brick by brick.</span>
          </h2>
          <PillLink Comp={Link} href="/calculator/?scope=grey" dark>
            Open the calculator
          </PillLink>
        </div>
      </Panel>
    </>
  );
}
