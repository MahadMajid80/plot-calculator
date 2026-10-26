"use client";

import { useMemo, useState } from "react";
import { Eyebrow, Headline, Panel } from "./Section";
import type { Inputs, Line, Result } from "@/lib/calculate";
import { compareTiers } from "@/lib/calculate";
import { num, pkr, pkrShort } from "@/lib/format";
import { CATS, CITIES, Cat, GROUPS, Group, TIERS, Tier } from "@/lib/rates";

interface Props {
  inp: Inputs;
  result: Result;
  setInp: React.Dispatch<React.SetStateAction<Inputs>>;
}

const STAGE_LABEL = { grey: "Grey structure", finishing: "Finishing" } as const;
type Show = "all" | "material" | "labour";

export default function Breakdown({ inp, result: r, setInp }: Props) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [group, setGroup] = useState<Group | "all">("all");
  const [search, setSearch] = useState("");
  const [show, setShow] = useState<Show>("all");
  const tiers = useMemo(() => compareTiers(inp), [inp]);
  const cityFactor = CITIES[inp.city]?.factor ?? 1;
  const maxTier = Math.max(1, ...tiers.map((t) => t.total));
  const maxGroup = Math.max(1, ...r.groupTotals.map((g) => g.amount));
  const hasGrey = r.stageTotals.grey > 0;
  const hasFinish = r.stageTotals.finishing > 0;
  const edits = Object.keys(inp.rateOverrides).length + Object.keys(inp.qtyOverrides).length;

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return r.lines.filter(
      (l) =>
        (group === "all" || CATS[l.cat].group === group) &&
        (show === "all" || (show === "labour" ? l.labour >= 1 : l.labour < 1)) &&
        (!s || `${l.name} ${l.spec ?? ""} ${CATS[l.cat].label}`.toLowerCase().includes(s)),
    );
  }, [r.lines, group, search, show]);
  const cats = [...new Set(rows.map((l) => l.cat))];
  const shownTotal = rows.reduce((s, l) => s + l.amount, 0);

  const setRate = (id: string, v: number | null) =>
    setInp((c) => {
      const o = { ...c.rateOverrides };
      if (v === null || Number.isNaN(v)) delete o[id];
      else o[id] = v;
      return { ...c, rateOverrides: o };
    });

  const setQty = (l: Line, v: number | null) =>
    setInp((c) => {
      // Optional items keep their quantity on the item itself.
      if (l.id.startsWith("x_")) {
        const id = l.id.slice(2);
        return { ...c, addons: { ...c.addons, [id]: { on: true, qty: v } } };
      }
      const o = { ...c.qtyOverrides };
      if (v === null || Number.isNaN(v)) delete o[l.id];
      else o[l.id] = v;
      return { ...c, qtyOverrides: o };
    });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked; the URL is still in the address bar */
    }
  };

  return (
    <Panel className="mt-4">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow n="02">Your estimate</Eyebrow>
          <Headline size="md" accent="item by item.">
            Every rupee,
          </Headline>
        </div>
        {/* The claude.ai preview build sets NEXT_PUBLIC_PREVIEW, where printing and page links don't work. */}
        {process.env.NEXT_PUBLIC_PREVIEW !== "1" && (
          <div className="no-print flex flex-wrap gap-2">
            <button onClick={copyLink} className="rounded-full border-2 border-line bg-white px-5 py-3 font-semibold hover:border-peri">
              {copied ? "Link copied" : "Copy link"}
            </button>
            <button onClick={() => window.print()} className="rounded-full bg-navy px-5 py-3 font-semibold text-white hover:bg-navy-2">
              Print / Save PDF
            </button>
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat k="Construction cost" v={pkrShort(r.total)} sub={pkr(r.total)} />
        <Stat k="Per sq ft" v={pkr(r.perSqft)} sub={`${num(r.coveredSqft)} sq ft covered`} />
        {r.land > 0 ? (
          <Stat k="Complete project" v={pkrShort(r.projectTotal)} sub={`incl. land ${pkrShort(r.land)}`} />
        ) : (
          <Stat k="Line items" v={num(r.lines.length)} sub={`${Object.keys(r.catTotals).length} categories`} />
        )}
        <Stat
          k="Build time"
          v={`${Math.round(r.durationWeeks[0] / 4.3)}–${Math.round(r.durationWeeks[1] / 4.3)} months`}
          sub={`${r.durationWeeks[0]}–${r.durationWeeks[1]} weeks`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card title="Where the money goes">
          <div className="space-y-5">
            {r.groupTotals.map((g) => {
              const inGroup = (Object.keys(r.catTotals) as Cat[]).filter((c) => CATS[c].group === g.group);
              return (
                <div key={g.group}>
                  <div className="flex justify-between gap-3 font-bold">
                    <span>{g.label}</span>
                    <span className="tabular-nums">{pkrShort(g.amount)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-page">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(g.amount / maxGroup) * 100}%` }} />
                  </div>
                  {inGroup.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                      {inGroup.map((c) => (
                        <span key={c}>
                          {CATS[c].label} <span className="font-semibold text-ink tabular-nums">{pkrShort(r.catTotals[c] ?? 0)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Summary">
          <Row k="Covered area" v={`${num(r.coveredSqft)} sq ft`} />
          {r.basementSqft > 0 && <Row k="of which basement" v={`${num(r.basementSqft)} sq ft`} />}
          {hasGrey && <Row k="Grey structure" v={pkr(r.stageTotals.grey)} />}
          {hasFinish && <Row k="Finishing" v={pkr(r.stageTotals.finishing)} />}
          <Row k="Materials & supply" v={pkr(r.materialTotal)} />
          <Row k="Labour" v={pkr(r.labourTotal)} />
          <Row k="Construction subtotal" v={pkr(r.subtotal)} strong />
          {r.adders.map((a) => (
            <Row key={a.label} k={`${a.label} (${a.pct}%)`} v={pkr(a.amount)} />
          ))}
          <div className="mt-3 flex justify-between border-t-2 border-ink pt-3 text-lg font-extrabold">
            <span>Construction total</span>
            <span className="tabular-nums">{pkr(r.total)}</span>
          </div>
          <p className="mt-1 text-right text-sm text-muted">{pkr(r.perSqft)} per sq ft</p>
          {r.land > 0 && (
            <>
              <Row k="Land / plot" v={pkr(r.land)} />
              <div className="mt-2 flex justify-between text-lg font-extrabold text-brand">
                <span>Complete project</span>
                <span className="tabular-nums">{pkr(r.projectTotal)}</span>
              </div>
            </>
          )}
        </Card>
      </div>

      <Card title="Compare quality levels" className="mt-6">
        <p className="-mt-2 mb-5 text-[15px] text-muted">
          The same building and rooms at each preset, with typical choices for every item.
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiers.map((t) => {
            const on = t.tier === inp.tier;
            return (
              <div key={t.tier} className={`rounded-2xl border-2 p-4 ${on ? "border-brand bg-brand-soft/60" : "border-line"}`}>
                <p className="flex items-center justify-between text-sm font-semibold text-muted">
                  {TIERS[t.tier].label}
                  {on && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] uppercase tracking-wider text-white">Preset</span>}
                </p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums">{pkrShort(t.total)}</p>
                <p className="text-sm text-muted tabular-nums">{pkr(t.perSqft)} / sq ft</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-page">
                  <div className="h-full rounded-full bg-peri" style={{ width: `${(t.total / maxTier) * 100}%` }} />
                </div>
                {!on && (
                  <button
                    onClick={() => setInp((c) => ({ ...c, tier: t.tier as Tier, specs: {}, addons: {}, dims: { kitchenRft: c.dims.kitchenRft, windowScale: c.dims.windowScale } }))}
                    className="no-print mt-3 text-sm font-semibold text-brand hover:underline"
                  >
                    Use {TIERS[t.tier].label} →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Quantities at a glance" className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {hasGrey && (
            <>
              <Tile v={num(r.q.bricks)} k="Bricks" />
              <Tile v={num(r.q.cement)} k="Cement bags" />
              <Tile v={num(r.q.steel / 1000, 2)} k="Steel (tonnes)" />
              <Tile v={num(r.q.sand)} k="Sand (cft)" />
              <Tile v={num(r.q.crush)} k="Crush (cft)" />
            </>
          )}
          {hasFinish && (
            <>
              <Tile v={num(r.q.floorArea)} k="Floor area (sq ft)" />
              <Tile v={num(r.q.wallTiles)} k="Wall tiles (sq ft)" />
              <Tile v={num(r.q.steps)} k="Stair steps" />
              <Tile v={num(r.q.doors)} k="Doors" />
              <Tile v={num(r.q.windowArea)} k={`Windows (sq ft, ${r.q.windows})`} />
              <Tile v={num(r.rooms.baths)} k="Bathrooms" />
              <Tile v={num(r.q.points)} k="Electrical points" />
              <Tile v={num(r.q.lights)} k="Light points" />
              <Tile v={num(r.q.fans + r.q.exhaust)} k="Fans" />
              <Tile v={r.q.acUnits ? `${r.q.acUnits} · ${num(r.q.acTons, 1)}t` : "0"} k="ACs · tons" />
              <Tile v={num(r.q.paintArea)} k="Paint area (sq ft)" />
              <Tile v={num(r.q.ceilingArea)} k="False ceiling (sq ft)" />
            </>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">Thumb-rule quantities from your covered area and rooms. Your drawings give the exact figures.</p>
      </Card>

      <Card
        title="Bill of quantities"
        className="mt-6"
        action={
          <div className="no-print flex flex-wrap gap-2">
            {edits > 0 && (
              <button
                onClick={() => setInp((c) => ({ ...c, rateOverrides: {}, qtyOverrides: {} }))}
                className="rounded-full px-4 py-2 text-sm font-semibold text-brand hover:underline"
              >
                Reset {edits} edit{edits > 1 ? "s" : ""}
              </button>
            )}
            <button
              onClick={() => setEditing((e) => !e)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold ${editing ? "border-navy bg-navy text-white" : "border-line hover:border-peri"}`}
            >
              {editing ? "Done editing" : "Edit quantities & rates"}
            </button>
          </div>
        }
      >
        <div className="no-print mb-4 flex flex-col gap-3">
          <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              {(["all", ...r.groupTotals.map((g) => g.group)] as (Group | "all")[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  aria-pressed={group === g}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                    group === g ? "bg-navy text-white" : "bg-page text-ink hover:bg-brand-soft"
                  }`}
                >
                  {g === "all" ? "All items" : GROUPS[g]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              placeholder="Search items, e.g. tiles, door, AC"
              aria-label="Search items"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-11 flex-1 rounded-full border-2 border-line bg-white px-5 text-[15px] outline-none focus:border-brand"
            />
            <select
              aria-label="Show"
              value={show}
              onChange={(e) => setShow(e.target.value as Show)}
              className="min-h-11 rounded-full border-2 border-line bg-white px-4 text-[15px] outline-none focus:border-brand"
            >
              <option value="all">Materials and labour</option>
              <option value="material">Materials & supply only</option>
              <option value="labour">Labour only</option>
            </select>
          </div>
        </div>

        {editing && (
          <p className="mb-4 rounded-2xl bg-brand-soft p-4 text-sm">
            Type your own quantities or supplier rates. Rates are Lahore base, before the {CITIES[inp.city]?.label} adjustment of ×{cityFactor}.
            Changed cells are highlighted, and your changes are kept in the share link.
          </p>
        )}

        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-1 py-2">Item</th>
                <th className="px-1 py-2 text-right">Quantity</th>
                <th className="px-1 py-2 text-right">Rate (Rs)</th>
                <th className="px-1 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => {
                const catRows = rows.filter((l) => l.cat === c);
                return [
                  <tr key={c}>
                    <td colSpan={3} className="bg-page px-3 py-2 font-bold text-brand-dark">
                      {CATS[c].label}
                      <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-muted">{STAGE_LABEL[CATS[c].stage]}</span>
                    </td>
                    <td className="bg-page px-3 py-2 text-right font-bold tabular-nums text-brand-dark">
                      {pkr(catRows.reduce((s, l) => s + l.amount, 0))}
                    </td>
                  </tr>,
                  ...catRows.map((l) => {
                    const rateChanged = l.id in inp.rateOverrides;
                    const qtyChanged = l.id in inp.qtyOverrides || (l.id.startsWith("x_") && inp.addons[l.id.slice(2)]?.qty != null);
                    return (
                      <tr key={l.id} className="border-t border-line align-top">
                        <td className="px-1 py-2.5">
                          <span className="font-medium">{l.name}</span>
                          {l.labour >= 1 ? (
                            <span className="ml-2 rounded-full bg-salmon/25 px-2 py-0.5 text-xs font-semibold">Labour</span>
                          ) : l.labour > 0 ? (
                            <span className="ml-2 rounded-full bg-peri/40 px-2 py-0.5 text-xs font-semibold">Supply & fix</span>
                          ) : null}
                          {l.spec && <span className="block text-[13px] text-muted">{l.spec}</span>}
                        </td>
                        <td className="whitespace-nowrap px-1 py-2.5 text-right tabular-nums text-muted">
                          {editing ? (
                            <span className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                inputMode="decimal"
                                aria-label={`Quantity for ${l.name}`}
                                className={`w-24 rounded-lg border-2 px-2 py-1 text-right text-ink ${qtyChanged ? "border-salmon bg-salmon/10" : "border-line"}`}
                                value={Math.round(l.qty * 100) / 100}
                                onChange={(e) => setQty(l, e.target.value === "" ? null : Number(e.target.value))}
                              />
                              {l.unit}
                            </span>
                          ) : (
                            <span className={qtyChanged ? "font-semibold text-brand" : ""}>
                              {num(l.qty, l.qty < 10 ? 1 : 0)} {l.unit}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-1 py-2.5 text-right tabular-nums">
                          {editing ? (
                            <input
                              type="number"
                              inputMode="decimal"
                              aria-label={`Rate for ${l.name}`}
                              className={`w-28 rounded-lg border-2 px-2 py-1 text-right ${rateChanged ? "border-salmon bg-salmon/10" : "border-line"}`}
                              value={l.baseRate}
                              onChange={(e) => setRate(l.id, e.target.value === "" ? null : Number(e.target.value))}
                            />
                          ) : (
                            <span className={rateChanged ? "font-semibold text-brand" : ""}>{num(l.rate, l.rate < 100 ? 2 : 0)}</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-1 py-2.5 text-right font-semibold tabular-nums">{pkr(l.amount)}</td>
                      </tr>
                    );
                  }),
                ];
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    No items match. Try another search or filter.
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-ink">
                  <td colSpan={3} className="px-1 py-3 font-extrabold">
                    {group === "all" && !search && show === "all" ? "Construction subtotal" : `Total of ${rows.length} items shown`}
                  </td>
                  <td className="px-1 py-3 text-right font-extrabold tabular-nums">{pkr(shownTotal)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

      <Card title="Payment plan by phase" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="py-2 pr-3">Phase</th>
                <th className="py-2 pr-3">Stage</th>
                <th className="py-2 pr-3 text-right">Weeks</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {r.phases.map((p, i) => (
                <tr key={p.name} className="border-t border-line">
                  <td className="py-2.5 pr-3 font-medium">
                    {i + 1}. {p.name}
                  </td>
                  <td className="py-2.5 pr-3 text-muted">{STAGE_LABEL[p.stage]}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {p.weeks[0]}–{p.weeks[1]}
                  </td>
                  <td className="py-2.5 text-right font-semibold tabular-nums">{pkr(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">Fees, margin and contingency are spread across the phases in proportion.</p>
      </Card>

      <p className="mt-6 rounded-2xl border border-line bg-canvas/70 p-4 text-sm text-muted">
        This is an indicative estimate based on typical thumb rules and market rates. Actual costs depend on drawings, soil, site
        access, design choices and price changes. Always get at least two contractor quotes.
      </p>
    </Panel>
  );
}

function Card({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`break-avoid rounded-[28px] bg-white p-5 shadow-sm sm:p-7 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-extrabold tracking-tight">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-sm">
      <p className="text-sm text-muted">{k}</p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl">{v}</p>
      <p className="mt-0.5 text-sm text-muted">{sub}</p>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 border-b border-dashed border-line py-2 text-[15px] ${strong ? "font-bold" : ""}`}>
      <span className={strong ? "" : "text-muted"}>{k}</span>
      <span className="font-semibold tabular-nums">{v}</span>
    </div>
  );
}

function Tile({ v, k }: { v: string; k: string }) {
  return (
    <div className="rounded-2xl bg-page p-4">
      <p className="text-xl font-extrabold tabular-nums">{v}</p>
      <p className="text-sm text-muted">{k}</p>
    </div>
  );
}
