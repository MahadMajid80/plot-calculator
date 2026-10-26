// Search landing pages: house construction cost by plot size and city.
// Server-rendered; every number comes from the calculator engine.
import Link from "next/link";
import JsonLd from "./JsonLd";
import PageHead from "./PageHead";
import { Eyebrow, Headline, Panel, PillLink } from "./Section";
import type { Crumb } from "./Breadcrumbs";
import { CITIES, SPEC, TIERS, Tier } from "@/lib/rates";
import { num, pkr, pkrShort, pkrWords } from "@/lib/format";
import { FX, SITE, inCurrency } from "@/lib/site";
import {
  COST_BASE,
  CostPage,
  PAGE_CITIES,
  SIZES,
  Size,
  TIERS_ALL,
  articleLd,
  calculatorHref,
  cityName,
  comboSummary,
  costHref,
  faqLd,
  scenario,
} from "@/lib/seo";

const HUB: Crumb = { name: "House construction cost", href: `${COST_BASE}/` };
const HOME: Crumb = { name: "Home", href: "/" };
const MAJOR = ["lahore", "karachi", "islamabad", "rawalpindi", "faisalabad", "multan", "peshawar"];

export function costPageMeta(p: CostPage): { title: string; description: string; h1: string } {
  const y = SITE.year;
  if (p.kind === "combo") {
    const h1 = `${p.size.label} house construction cost in ${cityName(p.city)}`;
    return {
      h1,
      title: `${p.size.label} House Construction Cost in ${cityName(p.city)} (${y})`,
      description: `${comboSummary(p.size, p.city)} Basic to luxury rates, grey structure and complete, in PKR, USD, GBP and AED.`,
    };
  }
  if (p.kind === "size") {
    const lahore = scenario(p.size, "lahore");
    const h1 = `${p.size.label} house construction cost in Pakistan`;
    return {
      h1,
      title: `${p.size.label} House Construction Cost in Pakistan ${y}: City by City`,
      description: `Building a double-storey ${p.size.label.toLowerCase()} house costs about ${pkrWords(lahore.total)} in Lahore with a standard finish (${SITE.ratesUpdated}). Compare grey structure and complete costs in ${PAGE_CITIES.length} cities.`,
    };
  }
  const ten = scenario(SIZES[3], p.city);
  const h1 = `House construction cost in ${cityName(p.city)}`;
  return {
    h1,
    title: `House Construction Cost in ${cityName(p.city)} ${y}: Rate per Sq Ft`,
    description: `Construction cost in ${cityName(p.city)} is about Rs ${num(ten.perSqft)} per sq ft for a standard house in ${SITE.ratesUpdated}. See 3 marla to 2 kanal costs, grey structure rates and basic to luxury finishes.`,
  };
}

export default function CostPageView({ page }: { page: CostPage }) {
  if (page.kind === "combo") return <ComboPage size={page.size} city={page.city} />;
  if (page.kind === "size") return <SizePage size={page.size} />;
  return <CityPage city={page.city} />;
}

// ---------- 10 marla in Lahore ----------

function ComboPage({ size, city }: { size: Size; city: string }) {
  const meta = costPageMeta({ kind: "combo", size, city });
  const std = scenario(size, city);
  const grey = scenario(size, city, "standard", size.floors, "grey");
  const tiers = TIERS_ALL.map((t) => ({ t, all: scenario(size, city, t), grey: scenario(size, city, t, size.floors, "grey") }));
  const floors = [1, 2, 3].map((f) => ({ f, r: scenario(size, city, "standard", f) }));
  const href = costHref(size, city);
  const cityF = CITIES[city].factor;
  const labourOnly = SPEC.greyLabour.options[1].rate * cityF;
  const months = `${Math.round(std.durationWeeks[0] / 4.3)} to ${Math.round(std.durationWeeks[1] / 4.3)} months`;
  const faq = [
    {
      q: `How much does it cost to build a ${size.label.toLowerCase()} house in ${cityName(city)} in ${SITE.year}?`,
      a: `${comboSummary(size, city)} A basic finish comes to about ${pkrWords(tiers[0].all.total)} and a luxury finish to about ${pkrWords(tiers[3].all.total)}. These figures are for ${num(std.coveredSqft)} sq ft of covered area on two floors and include design, approvals, contractor margin and a 5% contingency.`,
    },
    {
      q: `What is the grey structure cost of a ${size.label.toLowerCase()} house in ${cityName(city)}?`,
      a: `The grey structure of a double-storey ${size.label.toLowerCase()} house in ${cityName(city)} costs about ${pkrWords(grey.total)}, or Rs ${num(grey.perSqft)} per sq ft with material. On a labour-only contract, grey structure labour is about Rs ${num(labourOnly)} per sq ft.`,
    },
    {
      q: `What is the construction rate per sq ft in ${cityName(city)}?`,
      a: `Complete construction in ${cityName(city)} costs about Rs ${num(tiers[0].all.perSqft)} per sq ft for a basic house, Rs ${num(tiers[1].all.perSqft)} for standard, Rs ${num(tiers[2].all.perSqft)} for premium and Rs ${num(tiers[3].all.perSqft)} for luxury, all with material.`,
    },
    {
      q: `How long does it take to build a ${size.label.toLowerCase()} house?`,
      a: `Expect about ${months} from excavation to handover for a double-storey ${size.label.toLowerCase()} house, if materials and payments are on time.`,
    },
    {
      q: `How much is it in US dollars, pounds or dirhams?`,
      a: `At ${SITE.ratesUpdated} open-market rates, a standard ${size.label.toLowerCase()} house in ${cityName(city)} costs about ${inCurrency(std.total, "USD")}, ${inCurrency(std.total, "GBP")}, ${inCurrency(std.total, "AED")} or ${inCurrency(std.total, "SAR")}.`,
    },
    {
      q: "What does this estimate include?",
      a: "Grey structure, flooring and wall tiles, marble stairs and sills, doors, windows, kitchen, washroom fittings, wiring and lights, fans, inverter ACs in bedrooms and lounges, paint, false ceilings, wardrobes, geysers, a water pump, a UPS, a kitchen hob and hood, a boundary wall and an underground tank. It does not include the plot, furniture or white goods such as a fridge.",
    },
  ];

  return (
    <>
      <JsonLd data={[faqLd(faq), articleLd(meta.title, meta.description, href)]} />
      <PageHead
        crumbs={[HOME, HUB, { name: size.label, href: costHref(size) }, { name: cityName(city), href }]}
        eyebrow={`${size.label} · ${cityName(city)} · ${SITE.ratesUpdated} rates`}
        title={meta.h1}
        accent={`in ${SITE.year}.`}
        lead={comboSummary(size, city)}
        aside={<HeadlineCard r={std} grey={grey.total} label={`Standard finish, ${num(std.coveredSqft)} sq ft on 2 floors`} cta={calculatorHref(size, city)} />}
      />

      <Panel>
        <SectionTitle n="02" eyebrow="Basic to luxury" title="What your finish" accent="does to the price." />
        <Table
          head={["Finish quality", "Grey structure", "Complete house", "Per sq ft", "In USD", "In GBP"]}
          rows={tiers.map(({ t, all, grey: g }) => [
            <TierCell key="t" t={t} />,
            pkrShort(g.total),
            <b key="c">{pkrShort(all.total)}</b>,
            pkr(all.perSqft),
            inCurrency(all.total, "USD"),
            inCurrency(all.total, "GBP"),
          ])}
        />
        <p className="mt-4 text-sm text-muted">
          Double storey, {num(std.coveredSqft)} sq ft covered ({size.coverage}% of the plot on each floor). Grey structure uses the same
          bricks, steel and labour choices as each finish. Includes 2% design, 1% approvals, 10% contractor margin and 5% contingency.
        </p>
      </Panel>

      <Panel>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <SectionTitle n="03" eyebrow="Floors" title="Single, double" accent="or triple storey?" size="sm" />
            <Table
              head={["Storeys", "Covered area", "Total", "Per sq ft"]}
              rows={floors.map(({ f, r }) => [
                f === 1 ? "Single storey" : f === 2 ? "Double storey" : "Triple storey",
                `${num(r.coveredSqft)} sq ft`,
                <b key="t">{pkrShort(r.total)}</b>,
                pkr(r.perSqft),
              ])}
            />
          </div>
          <div className="min-w-0">
            <SectionTitle n="04" eyebrow="Breakdown" title="Where the" accent="money goes." size="sm" />
            <GroupBars r={std} />
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionTitle n="05" eyebrow="Quantities" title="Materials for a" accent={`${size.label.toLowerCase()} house.`} />
        <QuantityTiles r={std} />
      </Panel>

      <OverseasPanel n="06" total={std.total} subject={`a standard ${size.label.toLowerCase()} house in ${cityName(city)}`} />

      <FaqPanel n="07" faq={faq} />

      <Panel>
        <div className="grid gap-10 lg:grid-cols-2">
          <LinkList
            title={`${size.label} house cost in other cities`}
            links={PAGE_CITIES.filter((c) => c !== city).map((c) => ({ href: costHref(size, c), label: `${size.label} in ${cityName(c)}`, value: pkrShort(scenario(size, c).total) }))}
          />
          <LinkList
            title={`Other plot sizes in ${cityName(city)}`}
            links={SIZES.filter((s) => s.slug !== size.slug).map((s) => ({ href: costHref(s, city), label: `${s.label} in ${cityName(city)}`, value: pkrShort(scenario(s, city).total) }))}
          />
        </div>
      </Panel>
    </>
  );
}

// ---------- 10 marla across cities ----------

function SizePage({ size }: { size: Size }) {
  const meta = costPageMeta({ kind: "size", size });
  const lahore = scenario(size, "lahore");
  const href = costHref(size);
  const rows = PAGE_CITIES.map((c) => ({ c, std: scenario(size, c), grey: scenario(size, c, "standard", size.floors, "grey") })).sort(
    (a, b) => a.std.total - b.std.total,
  );
  const faq = [
    {
      q: `What is the cost of building a ${size.label.toLowerCase()} house in Pakistan in ${SITE.year}?`,
      a: `A double-storey ${size.label.toLowerCase()} house with a standard finish costs about ${pkrWords(rows[0].std.total)} in ${cityName(rows[0].c)} and up to ${pkrWords(rows[rows.length - 1].std.total)} in ${cityName(rows[rows.length - 1].c)}. In Lahore it is about ${pkrWords(lahore.total)}, or Rs ${num(lahore.perSqft)} per sq ft.`,
    },
    {
      q: `How much covered area does a ${size.label.toLowerCase()} house have?`,
      a: `With ${size.coverage}% of the plot covered on each floor, a double-storey ${size.label.toLowerCase()} house has about ${num(lahore.coveredSqft)} sq ft of covered area. Your society's bylaws and your architect set the exact figure.`,
    },
    {
      q: `What is the grey structure cost of a ${size.label.toLowerCase()} house?`,
      a: `In Lahore the grey structure of a double-storey ${size.label.toLowerCase()} house costs about ${pkrWords(scenario(size, "lahore", "standard", size.floors, "grey").total)} with material.`,
    },
  ];
  return (
    <>
      <JsonLd data={[faqLd(faq), articleLd(meta.title, meta.description, href)]} />
      <PageHead
        crumbs={[HOME, HUB, { name: size.label, href }]}
        eyebrow={`${size.label} · ${SITE.ratesUpdated} rates`}
        title={meta.h1}
        accent={`in ${SITE.year}.`}
        lead={`A double-storey ${size.label.toLowerCase()} house costs about ${pkrWords(lahore.total)} to build in Lahore with a standard finish, or Rs ${num(lahore.perSqft)} per sq ft of covered area. Here is the same house in ${PAGE_CITIES.length} cities, from grey structure to move-in.`}
        aside={<HeadlineCard r={lahore} grey={scenario(size, "lahore", "standard", size.floors, "grey").total} label={`Lahore, standard finish, ${num(lahore.coveredSqft)} sq ft`} cta={calculatorHref(size, "lahore")} />}
      />
      <Panel>
        <SectionTitle n="02" eyebrow="City by city" title={`${size.label} house cost`} accent="in every major city." />
        <Table
          head={["City", "Grey structure", "Complete (standard)", "Per sq ft", "In USD", ""]}
          rows={rows.map(({ c, std, grey }) => [
            <Link key="c" href={costHref(size, c)} className="font-semibold text-brand hover:underline">{cityName(c)}</Link>,
            pkrShort(grey.total),
            <b key="t">{pkrShort(std.total)}</b>,
            pkr(std.perSqft),
            inCurrency(std.total, "USD"),
            <Link key="l" href={costHref(size, c)} className="text-sm font-semibold text-brand">Details →</Link>,
          ])}
        />
      </Panel>
      <Panel>
        <SectionTitle n="03" eyebrow="Basic to luxury" title="Lahore cost" accent="by finish quality." />
        <Table
          head={["Finish quality", "Complete house", "Per sq ft", "In GBP", "In AED"]}
          rows={TIERS_ALL.map((t) => {
            const r = scenario(size, "lahore", t);
            return [<TierCell key="t" t={t} />, <b key="c">{pkrShort(r.total)}</b>, pkr(r.perSqft), inCurrency(r.total, "GBP"), inCurrency(r.total, "AED")];
          })}
        />
      </Panel>
      <OverseasPanel n="04" total={lahore.total} subject={`a standard ${size.label.toLowerCase()} house in Lahore`} />
      <FaqPanel n="05" faq={faq} />
      <Panel>
        <LinkList
          title="Other plot sizes"
          links={SIZES.filter((s) => s.slug !== size.slug).map((s) => ({ href: costHref(s), label: `${s.label} house construction cost`, value: pkrShort(scenario(s, "lahore").total) }))}
        />
      </Panel>
    </>
  );
}

// ---------- Lahore across plot sizes ----------

function CityPage({ city }: { city: string }) {
  const meta = costPageMeta({ kind: "city", city });
  const href = costHref(undefined, city);
  const ten = scenario(SIZES[3], city);
  const faq = [
    {
      q: `What is the construction cost per sq ft in ${cityName(city)} in ${SITE.year}?`,
      a: `For a double-storey 10 marla house in ${cityName(city)}, complete construction costs about Rs ${num(scenario(SIZES[3], city, "economy").perSqft)} per sq ft for a basic finish, Rs ${num(ten.perSqft)} for standard, Rs ${num(scenario(SIZES[3], city, "premium").perSqft)} for premium and Rs ${num(scenario(SIZES[3], city, "luxury").perSqft)} for luxury.`,
    },
    {
      q: `What is the grey structure rate in ${cityName(city)}?`,
      a: `Grey structure with material costs about Rs ${num(scenario(SIZES[3], city, "standard", 2, "grey").perSqft)} per sq ft in ${cityName(city)}, including fees and contingency. Labour-only grey structure is about Rs ${num(SPEC.greyLabour.options[1].rate * CITIES[city].factor)} per sq ft.`,
    },
    {
      q: `Why do costs in ${cityName(city)} differ from Lahore?`,
      a: `Material transport and labour rates vary by city. The calculator uses Lahore prices and applies a factor of ×${CITIES[city].factor.toFixed(2)} for ${cityName(city)}.`,
    },
  ];
  return (
    <>
      <JsonLd data={[faqLd(faq), articleLd(meta.title, meta.description, href)]} />
      <PageHead
        crumbs={[HOME, HUB, { name: cityName(city), href }]}
        eyebrow={`${cityName(city)} · ${SITE.ratesUpdated} rates`}
        title={meta.h1}
        accent={`in ${SITE.year}.`}
        lead={`Building a standard double-storey house in ${cityName(city)} costs about Rs ${num(ten.perSqft)} per sq ft of covered area in ${SITE.ratesUpdated}. Compare every plot size from 3 marla to 2 kanal, grey structure and complete.`}
        aside={<HeadlineCard r={ten} grey={scenario(SIZES[3], city, "standard", 2, "grey").total} label={`10 marla, standard finish, ${num(ten.coveredSqft)} sq ft`} cta={calculatorHref(SIZES[3], city)} />}
      />
      <Panel>
        <SectionTitle n="02" eyebrow="By plot size" title={`${cityName(city)} house costs`} accent="from 3 marla to 2 kanal." />
        <Table
          head={["Plot size", "Covered area", "Grey structure", "Complete (standard)", "Per sq ft", ""]}
          rows={SIZES.map((s) => {
            const r = scenario(s, city);
            return [
              <Link key="s" href={costHref(s, city)} className="font-semibold text-brand hover:underline">{s.label}</Link>,
              `${num(r.coveredSqft)} sq ft`,
              pkrShort(scenario(s, city, "standard", s.floors, "grey").total),
              <b key="t">{pkrShort(r.total)}</b>,
              pkr(r.perSqft),
              <Link key="l" href={costHref(s, city)} className="text-sm font-semibold text-brand">Details →</Link>,
            ];
          })}
        />
      </Panel>
      <Panel>
        <SectionTitle n="03" eyebrow="Basic to luxury" title="10 marla cost" accent="by finish quality." />
        <Table
          head={["Finish quality", "Complete house", "Per sq ft", "In USD", "In SAR"]}
          rows={TIERS_ALL.map((t) => {
            const r = scenario(SIZES[3], city, t);
            return [<TierCell key="t" t={t} />, <b key="c">{pkrShort(r.total)}</b>, pkr(r.perSqft), inCurrency(r.total, "USD"), inCurrency(r.total, "SAR")];
          })}
        />
      </Panel>
      <FaqPanel n="04" faq={faq} />
      <Panel>
        <LinkList
          title="Other cities"
          links={PAGE_CITIES.filter((c) => c !== city).map((c) => ({ href: costHref(undefined, c), label: `House construction cost in ${cityName(c)}`, value: `Rs ${num(scenario(SIZES[3], c).perSqft)}/sq ft` }))}
        />
      </Panel>
    </>
  );
}

// ---------- Hub ----------

export function CostHub() {
  const cities = MAJOR;
  return (
    <>
      <PageHead
        crumbs={[HOME, HUB]}
        eyebrow={`${SITE.ratesUpdated} rates`}
        title="House construction cost in Pakistan"
        accent="by plot size and city."
        lead={`What it costs to build a 3 marla to 2 kanal house in ${PAGE_CITIES.length} Pakistani cities, with grey structure and complete costs for basic, standard, premium and luxury finishes. Every figure comes from our itemised calculator.`}
      />
      <Panel>
        <SectionTitle n="02" eyebrow="Standard finish, double storey" title="Total cost by plot" accent="and city." />
        <Table
          head={["Plot size", ...cities.map(cityName)]}
          rows={SIZES.map((s) => [
            <Link key="s" href={costHref(s)} className="font-semibold text-brand hover:underline">{s.label}</Link>,
            ...cities.map((c) => (
              <Link key={c} href={costHref(s, c)} className="hover:text-brand hover:underline">{pkrShort(scenario(s, c).total)}</Link>
            )),
          ])}
        />
        <p className="mt-4 text-sm text-muted">Select a figure for the full breakdown. Includes design, approvals, contractor margin and contingency; excludes the plot.</p>
      </Panel>
      <Panel>
        <div className="grid gap-10 lg:grid-cols-2">
          <LinkList title="By plot size" links={SIZES.map((s) => ({ href: costHref(s), label: `${s.label} house construction cost`, value: pkrShort(scenario(s, "lahore").total) }))} />
          <LinkList title="By city" links={PAGE_CITIES.map((c) => ({ href: costHref(undefined, c), label: `Construction cost in ${cityName(c)}`, value: `Rs ${num(scenario(SIZES[3], c).perSqft)}/sq ft` }))} />
        </div>
      </Panel>
    </>
  );
}

// ---------- Shared pieces ----------

export function SectionTitle({ n, eyebrow, title, accent, size = "md" }: { n: string; eyebrow: string; title: string; accent?: string; size?: "md" | "sm" }) {
  return (
    <div className="mb-8">
      <Eyebrow n={n}>{eyebrow}</Eyebrow>
      {size === "md" ? (
        <Headline size="md" accent={accent}>{title}</Headline>
      ) : (
        <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl [text-wrap:balance]">
          {title} {accent && <span className="text-brand">{accent}</span>}
        </h2>
      )}
    </div>
  );
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-[24px] bg-white p-2 shadow-sm sm:p-4">
      <table className="w-full min-w-[560px] text-[15px]">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted">
            {head.map((h, i) => (
              <th key={i} scope="col" className={`px-3 py-3 ${i > 0 ? "text-right" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              {r.map((c, j) => (
                <td key={j} className={`px-3 py-3 tabular-nums ${j > 0 ? "whitespace-nowrap text-right" : "font-medium"}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TierCell({ t }: { t: Tier }) {
  return (
    <span>
      <span className="font-semibold">{TIERS[t].label}</span>
      <span className="hidden text-[13px] font-normal text-muted sm:block">{TIERS[t].description}</span>
    </span>
  );
}

export function HeadlineCard({ r, grey, label, cta }: { r: { total: number; perSqft: number }; grey: number; label: string; cta: string }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-2 text-5xl font-extrabold tracking-tight">{pkrShort(r.total)}</p>
      <p className="mt-1 text-muted tabular-nums">
        {pkr(r.perSqft)} per sq ft · {inCurrency(r.total, "USD")}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5">
        <div>
          <p className="text-sm text-muted">Grey structure</p>
          <p className="text-xl font-extrabold">{pkrShort(grey)}</p>
        </div>
        <div>
          <p className="text-sm text-muted">Finishing & extras</p>
          <p className="text-xl font-extrabold">{pkrShort(r.total - grey)}</p>
        </div>
      </div>
      <div className="mt-6">
        <PillLink Comp={Link} href={cta} dark>
          Customise every item
        </PillLink>
      </div>
    </div>
  );
}

function GroupBars({ r }: { r: { groupTotals: { group: string; label: string; amount: number }[]; total: number; subtotal: number } }) {
  const max = Math.max(...r.groupTotals.map((g) => g.amount));
  return (
    <ul className="space-y-3 rounded-[24px] bg-white p-5 shadow-sm sm:p-6">
      {r.groupTotals.map((g) => (
        <li key={g.group}>
          <div className="flex justify-between gap-3 text-[15px]">
            <span>{g.label}</span>
            <span className="font-semibold tabular-nums">
              {pkrShort(g.amount)} <span className="text-muted">· {Math.round((g.amount / r.subtotal) * 100)}%</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-page">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(g.amount / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function QuantityTiles({ r }: { r: ReturnType<typeof scenario> }) {
  const items: [string, string][] = [
    [num(r.q.bricks), "bricks"],
    [num(r.q.cement), "cement bags (50 kg)"],
    [num(r.q.steel / 1000, 1), "tonnes of steel"],
    [num(r.q.sand), "cft of sand"],
    [num(r.q.crush), "cft of crush"],
    [num(r.q.floorArea), "sq ft of flooring"],
    [num(r.q.doors), "doors"],
    [num(r.q.windowArea), "sq ft of windows"],
    [num(r.rooms.baths), "bathrooms"],
    [num(r.q.points), "electrical points"],
    [num(r.q.fans), "ceiling fans"],
    [`${r.q.acUnits}`, `ACs (${num(r.q.acTons, 1)} tons)`],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(([v, k]) => (
        <div key={k} className="rounded-[20px] bg-white p-4 shadow-sm">
          <p className="text-2xl font-extrabold tabular-nums">{v}</p>
          <p className="text-sm text-muted">{k}</p>
        </div>
      ))}
    </div>
  );
}

export function OverseasPanel({ n, total, subject }: { n: string; total: number; subject: string }) {
  return (
    <Panel>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-end">
        <div>
          <SectionTitle n={n} eyebrow="For overseas Pakistanis" title="The same house" accent="in your currency." />
          <p className="-mt-2 max-w-md text-muted">
            The cost of {subject}, at indicative open-market rates for {SITE.ratesUpdated}. Your bank&apos;s rate on the day you send will differ a little.
          </p>
          <Link href="/overseas-pakistanis/" className="mt-5 inline-block font-semibold text-brand hover:underline">
            Guide to building in Pakistan from abroad →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {FX.map((f) => (
            <div key={f.code} className="rounded-[20px] bg-white p-4 shadow-sm">
              <p className="text-[13px] font-semibold text-muted">{f.country}</p>
              <p className="mt-1 text-lg font-extrabold tabular-nums">{inCurrency(total, f.code)}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function FaqPanel({ n, faq }: { n: string; faq: { q: string; a: string }[] }) {
  return (
    <Panel>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <SectionTitle n={n} eyebrow="FAQ's" title="Quick answers" accent="to common questions." />
        <div className="space-y-3">
          {faq.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-white p-5 shadow-sm open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                <h3>{f.q}</h3>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-page transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function LinkList({ title, links }: { title: string; links: { href: string; label: string; value?: string }[] }) {
  return (
    <div className="min-w-0">
      <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="font-semibold">{l.label}</span>
              {l.value && <span className="shrink-0 text-sm font-semibold text-brand tabular-nums">{l.value}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
