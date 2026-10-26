"use client";

import { useMemo, useState } from "react";
import ResultCard from "./ResultCard";
import { Pills, Slider } from "./controls";
import { DEFAULT_INPUTS, calculate, coverageFor } from "@/lib/calculate";
import { BUILDING_TYPES, BuildingType, TIERS, TIER_KEYS, Tier } from "@/lib/rates";
import { describe, floorsLabel } from "@/lib/describe";
import { homeCoverage } from "@/lib/sizes";

// Homepage calculator: the essentials on sliders, with a link to the full itemised calculator.
export default function QuickCalc() {
  const [type, setType] = useState<BuildingType>("home");
  const [size, setSize] = useState(10);
  const [floors, setFloors] = useState(2);
  const [tier, setTier] = useState<Tier>("standard");

  const coverage = type === "home" ? homeCoverage(size) : coverageFor(type);
  const inp = useMemo(
    () => ({ ...DEFAULT_INPUTS, type, plotSize: size, floors, tier, coverage }),
    [type, size, floors, tier, coverage],
  );
  const result = useMemo(() => calculate(inp), [inp]);
  const href = `/calculator/?type=${type}&size=${size}&unit=marla225&floors=${floors}&tier=${tier}&cover=${coverage}`;

  return (
    <ResultCard result={result} sentence={describe(inp, result)} cta={{ href, label: "Price every item" }}>
      <Pills
        label="Building type"
        value={type}
        options={(Object.keys(BUILDING_TYPES) as BuildingType[]).map((k) => [k, BUILDING_TYPES[k].label])}
        onChange={(v) => {
          setType(v);
          if (v === "home") setFloors((f) => Math.min(f, 5));
        }}
      />
      <Slider label="Plot size" value={size} min={3} max={40} step={1} display={`${size} marla`} onChange={setSize} />
      <Slider label="Floors" value={floors} min={1} max={type === "home" ? 5 : 15} display={floorsLabel(floors)} onChange={setFloors} />
      <Pills label="Quality" value={tier} options={TIER_KEYS.map((k) => [k, TIERS[k].label])} onChange={setTier} />
    </ResultCard>
  );
}
