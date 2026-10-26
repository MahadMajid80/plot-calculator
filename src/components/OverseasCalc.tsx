"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pills } from "./controls";
import { darkInput } from "./controls";
import { TIERS, TIER_KEYS, Tier } from "@/lib/rates";
import { FX, inCurrency } from "@/lib/site";
import { PAGE_CITIES, SIZES, calculatorHref, cityName, scenario } from "@/lib/seo";
import { pkr, pkrShort } from "@/lib/format";

// Quick cost in the visitor's home currency, for overseas Pakistanis.
export default function OverseasCalc() {
  const [size, setSize] = useState("10-marla");
  const [city, setCity] = useState("lahore");
  const [tier, setTier] = useState<Tier>("standard");
  const [cur, setCur] = useState("USD");
  const s = SIZES.find((x) => x.slug === size) ?? SIZES[3];
  const r = useMemo(() => scenario(s, city, tier), [s, city, tier]);
  const rate = FX.find((f) => f.code === cur)!;

  return (
    <div className="dots rounded-[28px] bg-navy p-6 text-white shadow-[0_30px_60px_-20px_rgb(22_28_55/45%)] sm:rounded-[36px] sm:p-9">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[15px] text-white/80">Plot size (2 storeys)</span>
          <select className={darkInput} value={size} onChange={(e) => setSize(e.target.value)}>
            {SIZES.map((x) => (
              <option key={x.slug} value={x.slug}>{x.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[15px] text-white/80">City</span>
          <select className={darkInput} value={city} onChange={(e) => setCity(e.target.value)}>
            {PAGE_CITIES.map((c) => (
              <option key={c} value={c}>{cityName(c)}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6">
        <Pills label="Finish" value={tier} options={TIER_KEYS.map((k) => [k, TIERS[k].label])} onChange={setTier} />
        <Pills label="Your currency" value={cur} options={FX.map((f) => [f.code, f.code])} onChange={setCur} />
      </div>
      <p className="text-[15px] text-white/70">Estimated cost to build</p>
      <p className="mt-1 text-[44px] font-extrabold leading-none tracking-tight sm:text-5xl" aria-live="polite">
        {inCurrency(r.total, cur)}
      </p>
      <p className="mt-2 text-sm text-white/60">
        {pkrShort(r.total)} · {pkr(r.perSqft)} per sq ft · at Rs {rate.pkr} per {cur}
      </p>
      <p className="mt-5 text-[15px] leading-relaxed text-white/75">
        A {TIERS[tier].label.toLowerCase()} {s.label.toLowerCase()} house in {cityName(city)}, complete with design, approvals, contractor
        margin and contingency.
      </p>
      <Link
        href={calculatorHref(s, city, tier)}
        className="mt-6 inline-flex items-center gap-4 rounded-full bg-white py-2 pl-6 pr-2 text-base font-semibold text-navy transition hover:bg-canvas"
      >
        Price every item
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white" aria-hidden>→</span>
      </Link>
    </div>
  );
}
