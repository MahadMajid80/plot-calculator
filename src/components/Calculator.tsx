"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Breakdown from "./Breakdown";
import ResultPanel from "./ResultPanel";
import { AddonRow, Field, OptionGrid, Pills, Slider, Stepper, darkInput } from "./controls";
import { DEFAULT_INPUTS, DimKey, Inputs, Line, Result, calculate, coverageFor, selected } from "@/lib/calculate";
import {
  ADDONS,
  AREA_UNITS,
  AddonCtx,
  BUILDING_TYPES,
  BuildingType,
  CITIES,
  CONTRACTS,
  Cat,
  Contract,
  Group,
  ROOM_KEYS,
  ROOM_LABELS,
  RoomKey,
  SCOPES,
  SPEC,
  Scope,
  TIERS,
  TIER_KEYS,
  Tier,
  defaultOption,
} from "@/lib/rates";
import { num, pkr, pkrShort, pkrWords } from "@/lib/format";
import { describe, floorsLabel, unitShort } from "@/lib/describe";
import { fromQuery, toQuery } from "@/lib/share";

type TabId =
  | "project"
  | "rooms"
  | "grey"
  | "flooring"
  | "marble"
  | "doors"
  | "windows"
  | "kitchen"
  | "washrooms"
  | "electrical"
  | "acs"
  | "paint"
  | "woodwork"
  | "appliances"
  | "extras";

const TABS: { id: TabId; label: string; cats: Cat[]; intro: string; only?: (l: Line) => boolean }[] = [
  { id: "project", label: "Project", cats: [], intro: "The building, the plot and the overall quality. The quality preset fills in every item; you can change any of them in the next steps." },
  { id: "rooms", label: "Rooms", cats: [], intro: "Room counts drive the number of doors, windows, fans, ACs, lights and bathroom fittings. We suggest typical numbers for your size." },
  {
    id: "grey",
    label: "Grey structure",
    cats: ["site", "structure", "roof", "roughin", "greyLabour"],
    intro: "Foundation, frame, brickwork, roof and the pipes and conduits inside the walls. Quantities use contractor thumb rules per sq ft.",
    only: (l) => !l.id.startsWith("x_"),
  },
  { id: "flooring", label: "Flooring & tiles", cats: ["flooring", "tiles"], intro: "Choose a floor for each part of the building and the wall tiles for bathrooms and kitchens. Wastage of 7 to 10% is added." },
  { id: "marble", label: "Marble & stone", cats: ["marble"], intro: "Stairs, window sills, door thresholds and skirting. Kitchen tops are under Kitchen, vanity tops under Washrooms and stone cladding under Paint." },
  { id: "doors", label: "Doors", cats: ["doors"], intro: "Main, room and bathroom doors are priced separately, with frames, polish and hardware." },
  { id: "windows", label: "Windows", cats: ["windows"], intro: "Frame and glass are chosen separately. Grills and mosquito nets are optional." },
  { id: "kitchen", label: "Kitchen", cats: ["kitchen"], intro: "Cabinets, hardware and countertops are priced per running foot of kitchen." },
  { id: "washrooms", label: "Washrooms", cats: ["washrooms"], intro: "Every bathroom gets one of each fitting below. Tiles for bathroom walls and floors are under Flooring & tiles." },
  { id: "electrical", label: "Electrical & fans", cats: ["electrical", "fans"], intro: "Wiring, switches and lights are priced per point. Points are counted from your rooms." },
  { id: "acs", label: "ACs", cats: ["acs"], intro: "Pick which rooms get an AC and the type. Tonnage is sized from the room type." },
  { id: "paint", label: "Paint & ceilings", cats: ["paint", "ceiling"], intro: "Interior paint covers walls and ceilings. The front elevation can be paint, texture or cladding." },
  { id: "woodwork", label: "Woodwork", cats: ["woodwork"], intro: "Wardrobes, railings and feature walls." },
  { id: "appliances", label: "Appliances & water", cats: ["water", "appliances"], intro: "Geysers, pumps and tanks, plus kitchen and home appliances. Switch off anything you will buy later." },
  {
    id: "extras",
    label: "Extras, land & fees",
    cats: ["site", "external"],
    intro: "Boundary wall, solar, lifts and other extras, the optional land price, and fees.",
    only: (l) => l.cat === "external" || l.id.startsWith("x_"),
  },
];

// Result groups link back to the step that sets them.
const GROUP_TAB: Record<Group, TabId> = {
  grey: "grey",
  floors: "flooring",
  stone: "marble",
  openings: "doors",
  wet: "kitchen",
  mep: "electrical",
  surfaces: "paint",
  appliances: "appliances",
  external: "extras",
};

const SIZE_RANGES: Record<string, { min: number; max: number; step: number }> = {
  marla225: { min: 2, max: 40, step: 0.5 },
  marla272: { min: 2, max: 40, step: 0.5 },
  kanal: { min: 1, max: 10, step: 0.5 },
  sqyd: { min: 50, max: 2000, step: 10 },
  sqft: { min: 450, max: 20000, step: 50 },
};

export default function Calculator() {
  const [inp, setInp] = useState<Inputs>(DEFAULT_INPUTS);
  const [tab, setTab] = useState(0);
  const [ready, setReady] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tabChanged = useRef(false);

  // Read a shared link or the homepage quick calculator from the URL.
  useEffect(() => {
    setInp((cur) => fromQuery(window.location.search, cur));
    setReady(true);
  }, []);

  // Keep the URL in sync so an estimate can be shared.
  useEffect(() => {
    if (!ready) return;
    try {
      window.history.replaceState(null, "", `?${toQuery(inp)}`);
    } catch {
      /* some embedded viewers block URL changes */
    }
  }, [inp, ready]);

  // Move focus to the step heading only when the step changes, never while typing.
  useEffect(() => {
    if (!tabChanged.current) return;
    tabChanged.current = false;
    headingRef.current?.focus({ preventScroll: true });
    const top = cardRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [tab]);

  const goTo = (i: number) => {
    tabChanged.current = true;
    setTab(i);
  };

  const result = useMemo(() => calculate(inp), [inp]);
  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) => setInp((c) => ({ ...c, [k]: v }));
  const current = TABS[tab];
  const tabLines = result.lines.filter((l) => current.cats.includes(l.cat) && (!current.only || current.only(l)));
  const tabTotal = tabLines.reduce((s, l) => s + l.amount, 0);

  return (
    <>
    <div className="px-2 sm:px-4">
      <div
        ref={cardRef}
        className="dots mx-auto max-w-[1400px] scroll-mt-20 overflow-hidden rounded-[28px] bg-navy text-white shadow-[0_30px_60px_-20px_rgb(22_28_55/45%)] sm:rounded-[40px] no-print"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="min-w-0 p-5 sm:p-9 lg:p-11">
            {/* Step tabs: scroll sideways on phones, wrap on desktop */}
            <nav aria-label="Calculator steps" className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:-mx-9 sm:px-9 lg:mx-0 lg:px-0">
              <ol className="flex w-max gap-2 lg:w-auto lg:flex-wrap">
                {TABS.map((t, i) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={i === tab ? "step" : undefined}
                      className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                        i === tab ? "bg-white text-navy" : "bg-navy-2 text-white/75 hover:bg-navy-3 hover:text-white"
                      }`}
                    >
                      <span className={`tabular-nums ${i === tab ? "text-brand" : "text-peri/80"}`}>{String(i + 1).padStart(2, "0")}</span>
                      {t.label}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-8 border-t border-white/10 pt-8">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-peri">
                    Step {tab + 1} of {TABS.length}
                  </p>
                  <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl font-extrabold tracking-tight outline-none sm:text-4xl">
                    {current.label}
                  </h2>
                </div>
                {tabTotal > 0 && (
                  <p className="text-right">
                    <span className="block text-sm text-white/55">This section</span>
                    <span className="text-2xl font-extrabold tabular-nums">{pkrShort(tabTotal)}</span>
                  </p>
                )}
              </div>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/65">{current.intro}</p>

              <div className="mt-8">
                <TabBody id={current.id} inp={inp} setInp={setInp} set={set} result={result} />
              </div>

              {tabLines.length > 0 && <SectionLines rows={tabLines} total={tabTotal} />}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
              <button
                type="button"
                onClick={() => goTo(Math.max(0, tab - 1))}
                className={`rounded-full px-5 py-3 font-semibold text-peri hover:text-white ${tab === 0 ? "invisible" : ""}`}
              >
                ← {tab > 0 ? TABS[tab - 1].label : "Back"}
              </button>
              {tab < TABS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => goTo(tab + 1)}
                  className="ml-auto inline-flex items-center gap-4 rounded-full bg-white py-2 pl-6 pr-2 text-base font-semibold text-navy hover:bg-canvas sm:text-lg"
                >
                  Next: {TABS[tab + 1].label}
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white" aria-hidden>→</span>
                </button>
              ) : (
                <a
                  href="#breakdown"
                  className="ml-auto inline-flex items-center gap-4 rounded-full bg-white py-2 pl-6 pr-2 text-base font-semibold text-navy hover:bg-canvas sm:text-lg"
                >
                  See full breakdown
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white" aria-hidden>↓</span>
                </a>
              )}
            </div>
          </div>

          <aside id="estimate" aria-label="Estimate" className="scroll-mt-20 border-t border-white/10 bg-navy-2/40 lg:border-l lg:border-t-0">
            <div className="p-5 sm:p-9 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-72px)] lg:overflow-y-auto lg:p-10">
              <ResultPanel
                result={result}
                sentence={describe(inp, result)}
                onGroup={(g) => goTo(TABS.findIndex((t) => t.id === GROUP_TAB[g]))}
              />
            </div>
          </aside>
        </div>
      </div>

    </div>

      {/* Running total on phones, so it stays in view while changing items */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-navy/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-white backdrop-blur lg:hidden no-print">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-white/60">Estimated total</p>
            <p className="truncate text-xl font-extrabold tabular-nums">
              {pkrShort(result.total)} <span className="text-sm font-semibold text-white/60">· {pkr(result.perSqft)}/sq ft</span>
            </p>
          </div>
          <a href="#estimate" className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-navy">
            Summary
          </a>
        </div>
      </div>

      <div id="breakdown" className="scroll-mt-20 pb-20 lg:pb-0">
        <Breakdown inp={inp} result={result} setInp={setInp} />
      </div>
    </>
  );
}

// ---------- Step contents ----------

interface BodyProps {
  id: TabId;
  inp: Inputs;
  setInp: React.Dispatch<React.SetStateAction<Inputs>>;
  set: <K extends keyof Inputs>(k: K, v: Inputs[K]) => void;
  result: Result;
}

function TabBody({ id, inp, setInp, set, result }: BodyProps) {
  const lineQty = (lid: string) => {
    const l = result.lines.find((x) => x.id === `${lid}_fix`) ?? result.lines.find((x) => x.id === lid);
    return l ? `${num(l.qty)} ${l.unit}` : "";
  };
  const setDim = (k: DimKey, v: number) => setInp((c) => ({ ...c, dims: { ...c.dims, [k]: v } }));

  // One option grid per item; `qtyFrom` adds the quantity to the label.
  const spec = (sid: string, qtyFrom?: string, columns: 2 | 3 = 3) => {
    const s = SPEC[sid];
    if (s.only && !s.only.includes(inp.type)) return null;
    const q = qtyFrom ? lineQty(qtyFrom) : "";
    return (
      <OptionGrid
        key={sid}
        label={q ? `${s.label} · ${q}` : s.label}
        help={s.help}
        unit={s.unit}
        options={s.options}
        value={selected(inp, sid).id}
        presetId={defaultOption(s, inp.tier, inp.type).id}
        columns={columns}
        onChange={(v) => setInp((c) => ({ ...c, specs: { ...c.specs, [sid]: v } }))}
      />
    );
  };

  const addons = (...cats: Cat[]) => {
    const ctx: AddonCtx = {
      type: inp.type,
      tier: inp.tier,
      floors: inp.floors,
      plotSqft: result.plotSqft,
      coveredSqft: result.coveredSqft,
      footprint: result.footprint,
      rooms: result.rooms,
    };
    const range = selected(inp, "applianceRange").factor ?? 1;
    const list = ADDONS.filter((a) => cats.includes(a.cat) && (!a.only || a.only.includes(inp.type)));
    if (!list.length) return null;
    return (
      <div className="mb-8 last:mb-0">
        <p className="mb-3 font-semibold text-white">Optional items</p>
        <div className="grid gap-2 xl:grid-cols-2">
          {list.map((a) => {
            const sel = inp.addons[a.id];
            const on = sel ? sel.on : a.on(ctx);
            const qty = sel?.qty ?? a.qty(ctx);
            const rate = Array.isArray(a.rate) ? a.rate[range] : a.rate;
            return (
              <AddonRow
                key={a.id}
                name={a.name}
                note={a.note}
                rateText={`Rs ${num(rate)} / ${a.unit}`}
                on={on}
                qty={qty}
                unit={a.unit}
                onToggle={(v) => setInp((c) => ({ ...c, addons: { ...c.addons, [a.id]: { on: v, qty: c.addons[a.id]?.qty ?? null } } }))}
                onQty={(v) => setInp((c) => ({ ...c, addons: { ...c.addons, [a.id]: { on: true, qty: v } } }))}
              />
            );
          })}
        </div>
      </div>
    );
  };

  switch (id) {
    case "project":
      return <ProjectStep inp={inp} setInp={setInp} set={set} result={result} />;

    case "rooms": {
      const labels = ROOM_LABELS[inp.type];
      const q = result.q;
      return (
        <>
          <div className="grid gap-2 md:grid-cols-2">
            {ROOM_KEYS.map((k) => (
              <Stepper
                key={k}
                label={labels[k]}
                value={result.rooms[k]}
                suggested={result.roomDefaults[k]}
                onChange={(v) => setInp((c) => ({ ...c, rooms: { ...c.rooms, [k]: v } }))}
                onReset={() =>
                  setInp((c) => {
                    const r = { ...c.rooms };
                    delete r[k as RoomKey];
                    return { ...c, rooms: r };
                  })
                }
              />
            ))}
          </div>
          <p className="mb-3 mt-8 font-semibold">What these rooms add up to</p>
          <Tiles
            items={[
              [num(q.doors), "doors"],
              [`${num(q.windowArea)} sq ft`, `windows (${q.windows})`],
              [num(q.fans + q.exhaust), "ceiling & exhaust fans"],
              [q.acUnits ? `${q.acUnits} · ${num(q.acTons, 1)} t` : "None", "ACs · tons"],
              [num(q.lights), "light points"],
              [num(q.points), "electrical points"],
            ]}
          />
        </>
      );
    }

    case "grey":
      return (
        <>
          {spec("structure", undefined, 2)}
          {spec("bricks", "bricks")}
          {spec("cement", "cement", 2)}
          {spec("steel", "steel")}
          {spec("sand", "sand")}
          {spec("crush", "crush", 2)}
          {spec("roofing", "roofing")}
          {spec("pipes", "pipes")}
          {spec("greyLabour", "greyLabour")}
          {inp.scope === "finishing" && <ScopeNote stage="grey" />}
        </>
      );

    case "flooring":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          {spec("floorMain", "floorMain")}
          {spec("floorKitchen", "floorKitchen")}
          {spec("floorBath", "floorBath")}
          {spec("floorOutdoor", "floorOutdoor", 2)}
          {spec("wallBath", "wallBath")}
          {spec("bathHeight")}
          {spec("wallKitchen", "wallKitchen", 2)}
        </>
      );

    case "marble":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          {spec("stairs", "stairs")}
          {spec("sills", "sills")}
          {spec("skirting", "skirting", 2)}
        </>
      );

    case "doors":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          {spec("doorMain", "doorMain")}
          {spec("doorInternal", "doorInternal", 2)}
          {spec("doorBath", "doorBath", 2)}
          {spec("doorFrame", "doorFrame", 2)}
          {spec("doorPolish", "doorPolish")}
          {spec("doorHardware", "doorHardware", 2)}
          {spec("gate", "gate")}
          {spec("shutter", "shutter")}
        </>
      );

    case "windows":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          <Slider
            label="Window size"
            value={result.dims.windowScale}
            min={60}
            max={170}
            step={5}
            display={`${result.dims.windowScale}% of typical · ${num(result.q.windowArea)} sq ft`}
            onChange={(v) => setDim("windowScale", v)}
          />
          <div className="h-4" />
          {spec("winFrame", "winFrame")}
          {spec("winGlass", "winGlass", 2)}
          {spec("winGrill", undefined)}
          {spec("winNet", undefined)}
        </>
      );

    case "kitchen":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          <Slider
            label={`Kitchen length (each of ${result.rooms.kitchens})`}
            value={result.dims.kitchenRft}
            min={4}
            max={40}
            display={`${result.dims.kitchenRft} rft`}
            onChange={(v) => setDim("kitchenRft", v)}
          />
          <div className="h-4" />
          {spec("kitchenCabinets")}
          {spec("kitchenHardware")}
          {spec("kitchenTop")}
          {spec("kitchenSink", undefined, 2)}
        </>
      );

    case "washrooms":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          <p className="mb-6 rounded-2xl bg-navy-2/70 px-4 py-3 text-[15px] text-white/75">
            Pricing {result.rooms.baths} {inp.type === "home" || inp.type === "residential" ? "bathrooms" : "washrooms"}. Change the count under Rooms.
          </p>
          {spec("wc", undefined, 2)}
          {spec("basin", undefined, 2)}
          {spec("taps", undefined, 2)}
          {spec("shower", undefined, 2)}
          {spec("accessories", undefined, 2)}
          {addons("washrooms")}
        </>
      );

    case "electrical":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          <Tiles
            items={[
              [num(result.q.points), "electrical points"],
              [num(result.q.lights), "light points"],
              [num(result.q.fans), "ceiling fans"],
              [num(result.q.exhaust), "exhaust fans"],
            ]}
          />
          <div className="h-8" />
          {spec("wiring")}
          {spec("switches", undefined, 2)}
          {spec("lights", undefined, 2)}
          {spec("db")}
          {spec("fanCeiling")}
          {spec("fanExhaust")}
          {addons("electrical", "fans")}
        </>
      );

    case "acs":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          {spec("acCover", undefined, 2)}
          <Tiles
            items={[
              [num(result.q.acUnits), "AC units"],
              [num(result.q.acTons, 1), "tons of cooling"],
            ]}
          />
          <div className="h-8" />
          {spec("acType", "acUnits", 2)}
        </>
      );

    case "paint": {
      const noCeiling = selected(inp, "ceilingType").id === "none";
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          {spec("paintInterior", "paintInterior", 2)}
          {spec("elevation", "elevation")}
          {spec("ceilingType")}
          {!noCeiling && (
            <Slider
              label="False ceiling coverage"
              value={result.dims.ceilingPct}
              min={10}
              max={100}
              step={5}
              display={`${result.dims.ceilingPct}% of rooms · ${num(result.q.ceilingArea)} sq ft`}
              onChange={(v) => setDim("ceilingPct", v)}
            />
          )}
        </>
      );
    }

    case "woodwork":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          {inp.type !== "commercial" && (
            <>
              <Slider
                label={inp.type === "office" ? "Storage per cabin" : "Wardrobe per bedroom"}
                value={result.dims.wardrobeSqft}
                min={0}
                max={160}
                step={4}
                display={`${result.dims.wardrobeSqft} sq ft of front`}
                onChange={(v) => setDim("wardrobeSqft", v)}
              />
              <div className="h-4" />
            </>
          )}
          {spec("wardrobe", "wardrobe", 2)}
          {spec("railing", "railing")}
          {addons("woodwork")}
        </>
      );

    case "appliances":
      return (
        <>
          {inp.scope === "grey" && <ScopeNote stage="finishing" />}
          {spec("geyser", "geyser")}
          {spec("pump", "pump")}
          {spec("applianceRange")}
          {addons("water", "appliances")}
        </>
      );

    case "extras":
      return (
        <>
          {addons("site", "external")}
          <div className="mb-8 rounded-2xl border border-white/10 bg-navy-2/70 p-4 sm:p-5">
            <Field label="Land / plot price (optional)" hint={inp.land > 0 ? `${pkrWords(inp.land)}. Shown as the complete project cost, apart from the cost per sq ft.` : "Add it to see the complete project cost, land plus construction."}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="e.g. 25000000"
                className={darkInput}
                value={inp.land || ""}
                onChange={(e) => set("land", Math.max(0, Number(e.target.value) || 0))}
              />
            </Field>
          </div>
          <p className="mb-3 font-semibold">Fees and allowances</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["designFee", "Architect & structural design"],
                ["approvals", "Approvals & utility connections"],
                ["contractor", inp.contract === "labour" ? "Contractor margin on labour" : "Contractor overhead & profit"],
                ["contingency", "Contingency"],
              ] as const
            ).map(([k, label]) => (
              <Field key={k} label={`${label} (%)`}>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={50}
                  className={darkInput}
                  value={inp.percentages[k]}
                  onChange={(e) => set("percentages", { ...inp.percentages, [k]: Math.max(0, Number(e.target.value) || 0) })}
                />
              </Field>
            ))}
          </div>
          <p className="mt-3 text-sm text-white/55">Set the contractor to 0% if you will manage the build yourself.</p>
        </>
      );
  }
}

function ProjectStep({ inp, setInp, set, result }: Omit<BodyProps, "id">) {
  const range = SIZE_RANGES[inp.plotUnit];
  const maxFloors = inp.type === "home" ? 5 : 20;
  return (
    <>
      <fieldset className="mb-8">
        <legend className="mb-3 font-semibold">Building type</legend>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {(Object.keys(BUILDING_TYPES) as BuildingType[]).map((k) => {
            const t = BUILDING_TYPES[k];
            const on = inp.type === k;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setInp((c) => ({
                    ...c,
                    type: k,
                    coverage: coverageFor(k),
                    rooms: {},
                    addons: {},
                    floors: k === "home" ? Math.min(c.floors, 5) : c.floors,
                  }))
                }
                className={`rounded-2xl border p-4 text-left transition ${on ? "border-peri bg-peri/15" : "border-white/10 bg-navy-2/70 hover:border-white/30"}`}
              >
                <span className="text-2xl" aria-hidden>{t.icon}</span>
                <span className="mt-2 block font-bold">{t.label}</span>
                <span className="block text-[13px] text-white/55">{t.short}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Field label="City">
          <select className={darkInput} value={inp.city} onChange={(e) => set("city", e.target.value)}>
            {Object.entries(CITIES).map(([k, c]) => (
              <option key={k} value={k}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Plot size">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            className={darkInput}
            value={inp.plotSize}
            onChange={(e) => set("plotSize", Math.max(0, Number(e.target.value)))}
          />
        </Field>
        <Field label="Unit">
          <select
            className={darkInput}
            value={inp.plotUnit}
            onChange={(e) => {
              // Keep the same physical area when switching units.
              const sqft = inp.plotSize * AREA_UNITS[inp.plotUnit].sqft;
              const u = e.target.value;
              const r = SIZE_RANGES[u];
              const v = Math.round(sqft / AREA_UNITS[u].sqft / r.step) * r.step;
              setInp((c) => ({ ...c, plotUnit: u, plotSize: v }));
            }}
          >
            {Object.entries(AREA_UNITS).map(([k, u]) => (
              <option key={k} value={k}>{u.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Slider
        label="Plot size"
        value={inp.plotSize}
        min={range.min}
        max={range.max}
        step={range.step}
        display={`${num(inp.plotSize, 1)} ${unitShort(inp.plotUnit)} · ${num(result.plotSqft)} sq ft`}
        onChange={(v) => set("plotSize", v)}
      />
      <Slider label="Floors (including ground)" value={inp.floors} min={1} max={maxFloors} display={floorsLabel(inp.floors)} onChange={(v) => set("floors", v)} />
      <Slider label="Covered area per floor" value={inp.coverage} min={40} max={100} display={`${inp.coverage}% of plot`} onChange={(v) => set("coverage", v)} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <AddonRow
          name="Basement"
          note="One floor below ground. Grey work costs about 35% more per sq ft."
          rateText=""
          on={inp.basement}
          qty={0}
          unit=""
          showQty={false}
          onToggle={(v) => set("basement", v)}
          onQty={() => {}}
        />
        <Field label="Total covered area (optional)" hint={`Calculated: ${num(result.coveredSqft)} sq ft on all floors. Enter your architect's figure to override.`}>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={num(result.coveredSqft)}
            className={darkInput}
            value={inp.coveredOverride ?? ""}
            onChange={(e) => set("coveredOverride", e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
      </div>

      <fieldset className="mb-8">
        <legend className="mb-1 font-semibold">Quality preset</legend>
        <p className="mb-3 text-sm text-white/55">Sets a typical choice for every item. Changing it clears the item choices you made.</p>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {TIER_KEYS.map((k: Tier) => {
            const on = inp.tier === k;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => setInp((c) => ({ ...c, tier: k, specs: {}, addons: {}, dims: { kitchenRft: c.dims.kitchenRft, windowScale: c.dims.windowScale } }))}
                className={`rounded-2xl border p-4 text-left transition ${on ? "border-peri bg-peri/15" : "border-white/10 bg-navy-2/70 hover:border-white/30"}`}
              >
                <span className="block font-bold">{TIERS[k].label}</span>
                <span className="mt-1 block text-[13px] leading-snug text-white/55">{TIERS[k].description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Pills
        label="What to include"
        value={inp.scope}
        options={(Object.keys(SCOPES) as Scope[]).map((k) => [k, SCOPES[k].label])}
        onChange={(v) => set("scope", v)}
      />
      <Pills
        label="Contract type"
        value={inp.contract}
        options={(Object.keys(CONTRACTS) as Contract[]).map((k) => [k, CONTRACTS[k].label])}
        onChange={(v) => set("contract", v)}
      />
      <p className="-mt-3 text-sm text-white/55">{CONTRACTS[inp.contract].description}</p>
    </>
  );
}

function ScopeNote({ stage }: { stage: "grey" | "finishing" }) {
  return (
    <p className="mb-6 rounded-2xl border border-salmon/40 bg-salmon/10 px-4 py-3 text-[15px] text-white/80">
      {stage === "finishing" ? "Finishing" : "Grey structure"} is not included in this estimate. Change “What to include” under Project to add it.
    </p>
  );
}

function Tiles({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map(([v, k]) => (
        <div key={k} className="rounded-2xl border border-white/5 bg-navy-2 p-4">
          <p className="text-xl font-extrabold tabular-nums">{v}</p>
          <p className="text-[13px] text-white/55">{k}</p>
        </div>
      ))}
    </div>
  );
}

// The line items this step produces, so each change shows its effect straight away.
function SectionLines({ rows, total }: { rows: Line[]; total: number }) {
  return (
    <div className="mt-10 rounded-2xl border border-white/10">
      <p className="border-b border-white/10 px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/55">
        Items in this step
      </p>
      <ul className="divide-y divide-white/5">
        {rows.map((l) => (
          <li key={l.id} className="flex items-start justify-between gap-4 px-4 py-2.5 text-[14px]">
            <span className="min-w-0">
              <span className="text-white/90">{l.name}</span>
              {l.spec && <span className="block text-[12px] text-white/45">{l.spec}</span>}
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-semibold tabular-nums">{pkr(l.amount)}</span>
              <span className="block text-[12px] tabular-nums text-white/45">
                {num(l.qty, l.qty < 10 ? 1 : 0)} {l.unit} × {num(l.rate, l.rate < 100 ? 1 : 0)}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="flex justify-between border-t border-white/10 px-4 py-3 font-bold">
        <span>Step total</span>
        <span className="tabular-nums">{pkr(total)}</span>
      </p>
    </div>
  );
}
