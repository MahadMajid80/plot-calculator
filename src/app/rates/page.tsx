import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/PageHead";
import { Panel, PillLink } from "@/components/Section";
import { ADDONS, CATS, CITIES, Cat, FIXED, SPECS, TIERS, TIER_KEYS } from "@/lib/rates";
import { num } from "@/lib/format";
import { SITE, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  `Construction Material Rates in Pakistan Today (${SITE.ratesUpdated})`,
  `Latest ${SITE.year} rates for cement per bag, steel per kg, bricks per 1000, sand, crush, tiles, marble, doors, windows, sanitary fittings, wiring, ACs, paint and appliances in Pakistan, in PKR.`,
  "/rates/",
);

const ORDER = Object.keys(CATS) as Cat[];

export default function RatesPage() {
  const cats = ORDER.filter((c) => SPECS.some((s) => s.cat === c && s.options.some((o) => o.rate > 0)));
  return (
    <>
      <PageHead
        crumbs={[{ name: "Home", href: "/" }, { name: "Material rates", href: "/rates/" }]}
        eyebrow={`Last reviewed ${SITE.ratesUpdated}`}
        title="Construction material rates"
        accent="in Pakistan today."
        lead="Lahore base rates in PKR for every choice in the calculator. Other cities are adjusted by a city factor, and you can type your own rates in the bill of quantities."
      />

      <Panel>
        <nav aria-label="Rate sections" className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <a key={c} href={`#${c}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-brand-soft">
              {CATS[c].label}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-6">
          {cats.map((c) => (
            <section key={c} id={c} className="scroll-mt-24 rounded-[28px] bg-white p-5 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold tracking-tight">{CATS[c].label}</h2>
              <div className="mt-2 space-y-6">
                {SPECS.filter((s) => s.cat === c && s.options.some((o) => o.rate > 0)).map((s) => (
                  <div key={s.id}>
                    <h3 className="mt-4 font-bold">
                      {s.label} <span className="font-normal text-muted">· per {s.unit}</span>
                    </h3>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full min-w-[560px] text-[15px]">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wider text-muted">
                            <th className="py-2 pr-4">Option</th>
                            <th className="py-2 pr-4 text-right">Supply</th>
                            <th className="py-2 pr-4 text-right">Fixing</th>
                            <th className="py-2 text-right">Preset</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.options.map((o, i) => {
                            const presets = TIER_KEYS.filter((_, ti) => s.def[ti] === i).map((t) => TIERS[t].label);
                            return (
                              <tr key={o.id} className="border-t border-line">
                                <td className="py-2.5 pr-4 font-medium">
                                  {o.label}
                                  {o.note && <span className="block text-sm font-normal text-muted">{o.note}</span>}
                                </td>
                                <td className="whitespace-nowrap py-2.5 pr-4 text-right font-semibold tabular-nums">
                                  {o.rate > 0 ? `Rs ${num(o.rate, 1)}` : "–"}
                                </td>
                                <td className="whitespace-nowrap py-2.5 pr-4 text-right tabular-nums text-muted">{o.fix ? `Rs ${num(o.fix)}` : "–"}</td>
                                <td className="py-2.5 text-right text-sm text-muted">{presets.join(", ") || "–"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section id="extras" className="scroll-mt-24 rounded-[28px] bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight">Optional items, appliances & extras</h2>
            <p className="mt-1 text-muted">Appliances show local, standard and premium brand prices.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-[15px]">
                <tbody>
                  {ADDONS.map((a) => (
                    <tr key={a.id} className="border-t border-line">
                      <td className="py-3 pr-4 font-medium">
                        {a.name}
                        <span className="block text-sm font-normal text-muted">{a.note ?? CATS[a.cat].label}</span>
                      </td>
                      <td className="whitespace-nowrap py-3 text-right font-semibold tabular-nums">
                        {Array.isArray(a.rate) ? a.rate.map((r) => `Rs ${num(r)}`).join(" / ") : `Rs ${num(a.rate)}`} per {a.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight">Fixed rates</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {(
                [
                  ["Excavation", FIXED.excavation, "sq ft"],
                  ["Shuttering & curing", FIXED.shuttering, "sq ft"],
                  ["DPC & termite proofing", FIXED.termite, "sq ft"],
                  ["Conduits & boxes", FIXED.conduits, "sq ft"],
                  ["Tile adhesive & grout", FIXED.adhesive, "sq ft"],
                  ["Putty & primer", FIXED.putty, "sq ft"],
                  ["Electrician", FIXED.electricianPoint, "point"],
                  ["Plumber", FIXED.plumberBath, "bathroom"],
                  ["AC installation kit", FIXED.acKit, "unit"],
                  ["Gas piping", FIXED.gasPipe, "kitchen"],
                  ["Glass entrance door", FIXED.glassDoor, "door"],
                ] as const
              ).map(([k, v, u]) => (
                <div key={k} className="rounded-2xl bg-page p-4">
                  <p className="text-sm text-muted">{k}</p>
                  <p className="text-xl font-extrabold">Rs {num(v)}</p>
                  <p className="text-sm text-muted">per {u}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight">City adjustment</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Object.values(CITIES).map((c) => (
                <div key={c.label} className="rounded-2xl bg-page p-4">
                  <p className="text-sm text-muted">{c.label}</p>
                  <p className="text-xl font-extrabold">× {c.factor.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 flex justify-center">
          <PillLink Comp={Link} href="/calculator/" dark>
            Use these rates in the calculator
          </PillLink>
        </div>
      </Panel>
    </>
  );
}
