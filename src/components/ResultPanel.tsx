"use client";

import { useState } from "react";
import type { Result } from "@/lib/calculate";
import { FX, SITE, inCurrency } from "@/lib/site";
import type { Group } from "@/lib/rates";
import { num, pkr, pkrShort } from "@/lib/format";

// Live estimate inside the dark calculator card: total, material/labour split bar,
// two big tiles, cost by section and one plain-English sentence.
export default function ResultPanel({
  result: r,
  sentence,
  onGroup,
}: {
  result: Result;
  sentence: string;
  onGroup?: (g: Group) => void;
}) {
  const matPct = r.subtotal > 0 ? (r.materialTotal / r.subtotal) * 100 : 0;
  const labPct = 100 - matPct;
  const maxGroup = Math.max(1, ...r.groupTotals.map((g) => g.amount));
  const fees = r.adders.reduce((s, a) => s + a.amount, 0);
  const [cur, setCur] = useState("USD");

  return (
    <div>
      <p className="text-[15px] text-white/70">Estimated construction cost</p>
      <p className="mt-1 text-[44px] font-extrabold leading-none tracking-tight sm:text-5xl" aria-live="polite">
        {pkrShort(r.total)}
      </p>
      <p className="mt-2 text-sm text-white/60">
        {pkr(r.total)} · {pkr(r.perSqft)} per sq ft · {num(r.coveredSqft)} sq ft
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-white/10 bg-navy-2/70 px-4 py-3">
        <label htmlFor="fx" className="text-sm text-white/70">Overseas? In</label>
        <select
          id="fx"
          value={cur}
          onChange={(e) => setCur(e.target.value)}
          className="rounded-full border border-white/15 bg-navy-3 px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-peri"
        >
          {FX.map((f) => (
            <option key={f.code} value={f.code}>{f.code} ({f.country})</option>
          ))}
        </select>
        <span className="ml-auto text-lg font-extrabold tabular-nums text-peri" aria-live="polite">
          ≈ {inCurrency(r.land > 0 ? r.projectTotal : r.total, cur)}
        </span>
        <span className="w-full text-xs text-white/45">
          Open-market rate, Rs {FX.find((f) => f.code === cur)?.pkr} per {cur}, {SITE.ratesUpdated}.{r.land > 0 ? " Includes land." : ""}
        </span>
      </div>

      <div className="mt-6 flex gap-2" aria-hidden>
        <div className="h-3 rounded-full bg-peri transition-all duration-300" style={{ width: `${matPct}%` }} />
        {labPct > 0.5 && <div className="h-3 rounded-full bg-salmon transition-all duration-300" style={{ width: `${labPct}%` }} />}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/5 bg-navy-2 p-4">
          <p className="flex items-center gap-2 text-sm text-white/70">
            <span className="h-2.5 w-2.5 rounded-full bg-peri" /> Materials
          </p>
          <p className="mt-1 text-xl font-extrabold tracking-tight">{pkrShort(r.materialTotal)}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-navy-2 p-4">
          <p className="flex items-center gap-2 text-sm text-white/70">
            <span className="h-2.5 w-2.5 rounded-full bg-salmon" /> Labour
          </p>
          <p className="mt-1 text-xl font-extrabold tracking-tight text-salmon">{pkrShort(r.labourTotal)}</p>
        </div>
      </div>

      {r.land > 0 && (
        <div className="mt-3 rounded-2xl border border-peri/30 bg-peri/10 p-4">
          <div className="flex justify-between text-sm text-white/70">
            <span>Land</span>
            <span className="tabular-nums">{pkrShort(r.land)}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <span className="font-semibold">Complete project</span>
            <span className="text-2xl font-extrabold tabular-nums">{pkrShort(r.projectTotal)}</span>
          </div>
        </div>
      )}

      <p className="mt-6 text-[15px] leading-relaxed text-white/75">{sentence}</p>

      <div className="mt-7 border-t border-white/10 pt-6">
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/55">By section</p>
        <ul className="space-y-1">
          {r.groupTotals.map((g) => (
            <li key={g.group}>
              <button
                type="button"
                onClick={() => onGroup?.(g.group)}
                className="group block w-full rounded-xl px-2 py-1.5 text-left transition hover:bg-white/5"
              >
                <span className="flex justify-between gap-3 text-[14px]">
                  <span className="text-white/80 group-hover:text-white">{g.label}</span>
                  <span className="font-semibold tabular-nums">{pkrShort(g.amount)}</span>
                </span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-navy-3">
                  <span className="block h-full rounded-full bg-peri" style={{ width: `${(g.amount / maxGroup) * 100}%` }} />
                </span>
              </button>
            </li>
          ))}
          {fees > 0 && (
            <li className="flex justify-between gap-3 px-2 py-1.5 text-[14px]">
              <span className="text-white/80">Fees, margin & contingency</span>
              <span className="font-semibold tabular-nums">{pkrShort(fees)}</span>
            </li>
          )}
        </ul>
      </div>

      <a
        href="#breakdown"
        className="mt-7 inline-flex items-center gap-4 rounded-full bg-white py-2 pl-6 pr-2 text-base font-semibold text-navy transition hover:bg-canvas"
      >
        See every item
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white" aria-hidden>↓</span>
      </a>
    </div>
  );
}
