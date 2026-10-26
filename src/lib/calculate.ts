import {
  ADDONS,
  AREA_UNITS,
  AddonCtx,
  BASEMENT_FACTOR,
  BUILDING_TYPES,
  BuildingType,
  CATS,
  CITIES,
  Cat,
  Contract,
  DEFAULT_PERCENTAGES,
  FIXED,
  GREY_QTY,
  GREY_TYPE_FACTOR,
  GROUPS,
  Group,
  Opt,
  RoomKey,
  SPEC,
  Scope,
  Stage,
  TIER_KEYS,
  Tier,
  defaultOption,
  defaultRooms,
} from "./rates";

export type DimKey = "kitchenRft" | "wardrobeSqft" | "windowScale" | "ceilingPct";

export interface Inputs {
  type: BuildingType;
  city: string;
  plotSize: number;
  plotUnit: string;
  floors: number; // above-ground storeys including ground floor
  basement: boolean;
  coverage: number; // % of plot covered on each floor
  coveredOverride: number | null; // sq ft, replaces the computed covered area
  tier: Tier; // quality preset: sets the default for every spec below
  scope: Scope;
  contract: Contract;
  rooms: Partial<Record<RoomKey, number>>; // overrides of the suggested counts
  specs: Record<string, string>; // spec id -> option id, overrides of the preset
  addons: Record<string, { on: boolean; qty: number | null }>;
  dims: Partial<Record<DimKey, number>>;
  percentages: typeof DEFAULT_PERCENTAGES;
  rateOverrides: Record<string, number>; // line id -> Lahore base rate
  qtyOverrides: Record<string, number>; // line id -> quantity
  land: number; // land / plot price in Rs, 0 when not included
}

export const DEFAULT_INPUTS: Inputs = {
  type: "home",
  city: "lahore",
  plotSize: 10,
  plotUnit: "marla225",
  floors: 2,
  basement: false,
  coverage: 80,
  coveredOverride: null,
  tier: "standard",
  scope: "complete",
  contract: "turnkey",
  rooms: {},
  specs: {},
  addons: {},
  dims: {},
  percentages: DEFAULT_PERCENTAGES,
  rateOverrides: {},
  qtyOverrides: {},
  land: 0,
};

export interface Line {
  id: string;
  cat: Cat;
  stage: Stage;
  name: string;
  spec?: string; // the chosen option, shown under the name
  unit: string;
  qty: number;
  defaultQty: number;
  baseRate: number; // Lahore rate actually used (after any override)
  defaultRate: number; // Lahore rate from the rates file
  rate: number; // after the city factor
  amount: number;
  labour: number; // share of the amount that is labour, 0..1
}

export interface Quantities {
  bricks: number;
  cement: number;
  steel: number;
  sand: number;
  crush: number;
  floorArea: number;
  wallTiles: number;
  steps: number;
  stoneRft: number;
  doors: number;
  windowArea: number;
  windows: number;
  lights: number;
  points: number;
  fans: number;
  exhaust: number;
  acUnits: number;
  acTons: number;
  paintArea: number;
  ceilingArea: number;
  geysers: number;
}

export interface Result {
  plotSqft: number;
  footprint: number;
  coveredSqft: number;
  basementSqft: number;
  rooms: Record<RoomKey, number>;
  roomDefaults: Record<RoomKey, number>;
  dims: Record<DimKey, number>;
  q: Quantities;
  lines: Line[];
  catTotals: Partial<Record<Cat, number>>;
  groupTotals: { group: Group; label: string; amount: number }[];
  stageTotals: Record<Stage, number>;
  materialTotal: number;
  labourTotal: number;
  subtotal: number;
  adders: { label: string; pct: number; amount: number }[];
  total: number;
  perSqft: number;
  land: number;
  projectTotal: number;
  phases: { name: string; stage: Stage; amount: number; weeks: [number, number] }[];
  durationWeeks: [number, number];
}

const isHomeLike = (t: BuildingType) => t === "home" || t === "residential";

export function defaultDims(type: BuildingType, tier: Tier): Record<DimKey, number> {
  const ti = TIER_KEYS.indexOf(tier);
  return {
    kitchenRft: { home: 14, residential: 11, office: 6, commercial: 5 }[type],
    wardrobeSqft: type === "office" ? 20 : type === "commercial" ? 0 : [40, 56, 70, 90][ti],
    windowScale: 100,
    ceilingPct: type === "office" ? 100 : [0, 50, 80, 100][ti],
  };
}

// The option in force for a spec: the visitor's choice, else the preset default.
export function selected(inp: Pick<Inputs, "specs" | "tier" | "type">, specId: string): Opt {
  const spec = SPEC[specId];
  const chosen = inp.specs[specId];
  return spec.options.find((o) => o.id === chosen) ?? defaultOption(spec, inp.tier, inp.type);
}

export function calculate(inp: Inputs): Result {
  const unit = AREA_UNITS[inp.plotUnit] ?? AREA_UNITS.sqft;
  const type = inp.type;
  const homeLike = isHomeLike(type);
  const floors = Math.max(1, Math.round(inp.floors));
  const plotSqft = Math.max(0, inp.plotSize) * unit.sqft;
  const levels = floors + (inp.basement ? 1 : 0);
  const override = inp.coveredOverride && inp.coveredOverride > 0 ? inp.coveredOverride : null;
  const footprint = override ? override / levels : plotSqft * (inp.coverage / 100);
  const basementSqft = inp.basement ? footprint : 0;
  const covered = override ?? footprint * floors + basementSqft;
  const basementShare = covered > 0 ? basementSqft / covered : 0;
  const basementF = 1 + basementShare * (BASEMENT_FACTOR - 1);
  const cityF = CITIES[inp.city]?.factor ?? 1;
  const stages: Stage[] = inp.scope === "complete" ? ["grey", "finishing"] : [inp.scope];

  const roomDefaults = defaultRooms(type, covered, floors, plotSqft);
  const rooms = { ...roomDefaults } as Record<RoomKey, number>;
  for (const [k, v] of Object.entries(inp.rooms)) if (typeof v === "number" && v >= 0) rooms[k as RoomKey] = Math.round(v);
  const dims = defaultDims(type, inp.tier);
  for (const [k, v] of Object.entries(inp.dims)) if (typeof v === "number" && v >= 0) dims[k as DimKey] = v;
  const opt = (id: string) => selected(inp, id);
  const tf = (key: string) => GREY_TYPE_FACTOR[key]?.[type] ?? 1;

  const lines: Line[] = [];
  const add = (id: string, cat: Cat, name: string, unitLabel: string, qty: number, rate: number, labour = 0, spec?: string) => {
    const stage = CATS[cat].stage;
    if (!stages.includes(stage)) return;
    const q = inp.qtyOverrides[id] ?? qty;
    const base = inp.rateOverrides[id] ?? rate;
    if ((q <= 0 || base <= 0) && !(id in inp.qtyOverrides) && !(id in inp.rateOverrides)) return;
    lines.push({
      id,
      cat,
      stage,
      name,
      spec,
      unit: unitLabel,
      qty: q,
      defaultQty: qty,
      baseRate: base,
      defaultRate: rate,
      rate: base * cityF,
      amount: q * base * cityF,
      labour,
    });
  };
  // A spec priced per unit, with its fixing labour as a separate line.
  const supplyFix = (id: string, cat: Cat, name: string, specId: string, qty: number, wastage = 0, labourShare = 0) => {
    const o = opt(specId);
    const u = SPEC[specId].unit;
    add(id, cat, name, u, qty * (1 + wastage), o.rate, labourShare, o.label);
    if (o.fix && o.rate > 0) add(`${id}_fix`, cat, `${name}: fixing labour`, u, qty, o.fix, 1);
  };

  // ---------- Derived quantities ----------
  const { rooms: R, baths, kitchens, halls, utility, parking } = rooms;
  const steps = 20 * (floors - 1 + (inp.basement ? 1 : 0) + 1) * (!homeLike && covered > 12000 ? 2 : 1);
  const netFloor = covered * 0.82;
  const kitchenFloor = kitchens * (type === "home" ? 120 : type === "residential" ? 90 : 60);
  const bathFloor = baths * (homeLike ? 40 : 70);
  const mainFloor = Math.max(0, netFloor - kitchenFloor - bathFloor - steps * 4.5);
  const openArea = Math.max(0, plotSqft - footprint);
  const outdoor = homeLike ? Math.min(openArea * 0.7, parking * 200 + 150) : openArea * 0.5;
  const bathHeight = opt("bathHeight").factor ?? 1;
  const bathWall = baths * (homeLike ? 190 : 240) * bathHeight;
  const kitchenRft = kitchens * dims.kitchenRft;
  const backsplash = kitchenRft * 2;

  const winMain = (type === "commercial" ? R : R * 1.5) + halls * 2 + kitchens + utility * 0.5;
  const glazeF = type === "office" ? 1.5 : type === "commercial" ? 1.3 : 1;
  const windowArea = (winMain * 20 + baths * 4) * glazeF * (dims.windowScale / 100);
  const windowCount = Math.round(winMain + baths);

  const mainDoors = type === "home" ? Math.min(3, Math.max(1, kitchens)) : type === "residential" ? kitchens + 1 : type === "office" ? floors : 0;
  const roomDoors = homeLike ? R + utility + Math.ceil(halls * 0.67) : type === "office" ? R + utility + kitchens : utility + kitchens;
  const glassDoors = homeLike ? 0 : floors;
  const allDoors = mainDoors + roomDoors + baths;

  const lights = homeLike
    ? R * 4 + halls * 7 + kitchens * 4 + baths * 2 + utility * 2 + floors * 4 + parking
    : R * 6 + halls * 16 + kitchens * 3 + baths * 3 + utility * 4 + floors * 4;
  const sockets = homeLike
    ? R * 5 + halls * 5 + kitchens * 6 + baths + utility * 2
    : type === "office"
      ? R * 6 + halls * 14 + kitchens * 5 + baths + utility * 4
      : R * 4 + halls * 4 + kitchens * 4 + baths + utility * 2;
  const fans = homeLike ? R + halls * 2 + utility : R + halls * (type === "office" ? 4 : 3) + utility;
  const exhaust = baths + kitchens;

  const cover = opt("acCover").factor ?? 0;
  const roomTon = type === "office" ? 1 : type === "commercial" ? 2 : 1.5;
  const hallTon = homeLike ? 2 : 4;
  const utilTon = type === "office" ? 1.5 : 1;
  const acUnits = (cover >= 1 ? R : 0) + (cover >= 2 ? halls : 0) + (cover >= 3 ? kitchens + utility : 0);
  const acTons = (cover >= 1 ? R * roomTon : 0) + (cover >= 2 ? halls * hallTon : 0) + (cover >= 3 ? kitchens + utility * utilTon : 0);
  const acType = opt("acType");
  const split = acType.id !== "vrf";

  const geysers = type === "home" ? Math.min(3, Math.max(1, kitchens)) : type === "residential" ? kitchens : Math.max(1, Math.round(floors / 2));
  const points = lights + sockets + fans + exhaust + acUnits + geysers;

  const paintArea = Math.max(0, covered * 2.6 - bathWall - backsplash) + covered * 0.85;
  const height = floors * 10.5 + 3;
  const front = Math.sqrt(footprint) * height;
  const sides = Math.max(0, 4 * Math.sqrt(footprint) * height - front) * 0.6;
  const ceilingArea = mainFloor * (dims.ceilingPct / 100);

  // ---------- Grey structure ----------
  const lb = opt("structure").id === "loadbearing";
  add("excavation", "site", "Excavation, backfill & compaction", "sq ft", covered * tf("excavation") * basementF, FIXED.excavation, 0.7);
  add("shuttering", "site", "Shuttering, scaffolding & curing", "sq ft", covered * basementF, FIXED.shuttering, 0.5);
  add("termite", "site", "DPC & termite proofing", "sq ft", footprint, FIXED.termite, 0.3);
  const g = (key: keyof typeof GREY_QTY, f = 1) => covered * GREY_QTY[key] * tf(key) * basementF * f;
  add("bricks", "structure", "Bricks", "brick", g("bricks", lb ? 1.1 : 1), opt("bricks").rate, 0, opt("bricks").label);
  add("cement", "structure", "Cement (50 kg bag)", "bag", g("cement", lb ? 0.92 : 1), opt("cement").rate, 0, opt("cement").label);
  add("steel", "structure", "Steel bars", "kg", g("steel", lb ? 0.8 : 1), opt("steel").rate, 0, opt("steel").label);
  add("sand", "structure", "Sand", "cft", g("sand"), opt("sand").rate, 0, opt("sand").label);
  add("crush", "structure", "Crush / aggregate", "cft", g("crush", lb ? 0.85 : 1), opt("crush").rate, 0, opt("crush").label);
  supplyFix("roofing", "roof", "Roof waterproofing & insulation", "roofing", footprint + 150, 0, 0.35);
  supplyFix("pipes", "roughin", "Water supply, drainage & sewerage pipes", "pipes", covered * tf("pipes"), 0, 0.25);
  add("conduits", "roughin", "Electrical conduits, boxes & pull wires", "sq ft", covered * tf("conduits"), FIXED.conduits, 0.25);
  if (homeLike) add("gas", "roughin", "Gas piping", "kitchen", kitchens, FIXED.gasPipe, 0.3);
  if (split) add("acPiping", "roughin", "AC copper pre-piping & drains", "AC", acUnits, FIXED.acPiping, 0.4);
  add("greyLabour", "greyLabour", "Grey structure labour (mistri + mazdoor)", "sq ft", covered * basementF * (homeLike ? 1 : 1.06), opt("greyLabour").rate, 1, opt("greyLabour").label);

  // ---------- Flooring & wall tiles ----------
  const stone = (id: string) => ["marble", "importedMarble", "granite"].includes(opt(id).id);
  const tiled = (id: string) => !["laminate", "engineered", "terrazzo", "spc", "epoxy"].includes(opt(id).id);
  const waste = (id: string) => (stone(id) ? 0.1 : 0.07);
  supplyFix("floorMain", "flooring", "Rooms, lounges & corridors", "floorMain", mainFloor, waste("floorMain"));
  supplyFix("floorKitchen", "flooring", "Kitchen floor", "floorKitchen", kitchenFloor, waste("floorKitchen"));
  supplyFix("floorBath", "flooring", "Bathroom floors", "floorBath", bathFloor, waste("floorBath"));
  supplyFix("floorOutdoor", "flooring", "Porch, driveway & outdoor", "floorOutdoor", outdoor, 0.05);
  const tiledArea =
    (tiled("floorMain") ? mainFloor : 0) + (tiled("floorKitchen") ? kitchenFloor : 0) + bathFloor + bathWall + backsplash;
  add("adhesive", "flooring", "Tile adhesive, grout & bedding", "sq ft", tiledArea, FIXED.adhesive);
  supplyFix("wallBath", "tiles", "Bathroom walls", "wallBath", bathWall, 0.07);
  supplyFix("wallKitchen", "tiles", "Kitchen backsplash", "wallKitchen", backsplash, 0.07);

  // ---------- Marble & stone ----------
  supplyFix("stairs", "marble", "Staircase steps", "stairs", steps);
  const sillRft = windowCount * 5 + allDoors * 3.5;
  supplyFix("sills", "marble", "Window sills & door thresholds", "sills", sillRft);
  supplyFix("skirting", "marble", "Skirting", "skirting", mainFloor * 0.25);

  // ---------- Doors ----------
  supplyFix("doorMain", "doors", "Main entrance doors", "doorMain", mainDoors);
  supplyFix("doorInternal", "doors", "Room doors", "doorInternal", roomDoors);
  supplyFix("doorBath", "doors", "Bathroom doors", "doorBath", baths);
  const bathWood = ["ply", "solid"].includes(opt("doorBath").id);
  const woodDoors = (opt("doorMain").id === "steel" ? 0 : mainDoors) + roomDoors + (bathWood ? baths : 0);
  supplyFix("doorFrame", "doors", "Door frames (chaukhat)", "doorFrame", woodDoors);
  supplyFix("doorPolish", "doors", "Door polish / paint", "doorPolish", woodDoors, 0, 0.6);
  supplyFix("doorHardware", "doors", "Locks, handles & hinges", "doorHardware", allDoors);
  if (glassDoors) add("glassDoor", "doors", "Frameless glass entrance doors", "door", glassDoors, FIXED.glassDoor, 0.1);
  if (homeLike) supplyFix("gate", "doors", "Main gate", "gate", (parking >= 2 ? 16 : 12) * 8);
  if (type === "commercial") supplyFix("shutter", "doors", "Shop shutters", "shutter", R);

  // ---------- Windows ----------
  supplyFix("winFrame", "windows", "Window frames", "winFrame", windowArea);
  add("winGlass", "windows", "Window glass", "sq ft", windowArea * 0.85, opt("winGlass").rate, 0, opt("winGlass").label);
  add("winGrill", "windows", "Window safety grills", "sq ft", windowArea, opt("winGrill").rate, 0.3, opt("winGrill").label);
  add("winNet", "windows", "Mosquito nets", "sq ft", windowArea, opt("winNet").rate, 0.2, opt("winNet").label);

  // ---------- Kitchen ----------
  add("kitchenCabinets", "kitchen", "Kitchen cabinets (base + wall)", "rft", kitchenRft, opt("kitchenCabinets").rate, 0.25, opt("kitchenCabinets").label);
  add("kitchenHardware", "kitchen", "Cabinet hinges, channels & handles", "rft", kitchenRft, opt("kitchenHardware").rate, 0, opt("kitchenHardware").label);
  add("kitchenTop", "kitchen", "Countertop", "rft", kitchenRft, opt("kitchenTop").rate, 0.15, opt("kitchenTop").label);
  add("kitchenSink", "kitchen", "Sink & mixer", "kitchen", kitchens, opt("kitchenSink").rate, 0, opt("kitchenSink").label);
  add("kitchenFix", "kitchen", "Kitchen installation & plumbing hook-up", "kitchen", kitchens, FIXED.kitchenFix, 1);

  // ---------- Washrooms ----------
  for (const [id, name] of [
    ["wc", "Commodes (WC)"],
    ["basin", "Basins & vanities"],
    ["taps", "Mixers & taps"],
    ["shower", "Shower sets"],
    ["accessories", "Accessories & mirrors"],
  ] as const) {
    add(id, "washrooms", name, "bathroom", baths, opt(id).rate, 0, opt(id).label);
  }
  add("bathDrains", "washrooms", "Floor drains, traps & angle valves", "bathroom", baths, FIXED.bathDrains);
  add("plumberBath", "washrooms", "Plumber fitting labour", "bathroom", baths, FIXED.plumberBath, 1);

  // ---------- Electrical, fans, ACs ----------
  add("wiring", "electrical", "Wiring", "point", points, opt("wiring").rate, 0, opt("wiring").label);
  add("switches", "electrical", "Switches & sockets", "point", points, opt("switches").rate, 0, opt("switches").label);
  add("lights", "electrical", "Light fittings", "light", lights, opt("lights").rate, 0, opt("lights").label);
  add("db", "electrical", "Distribution boards & breakers", "floor", levels, opt("db").rate, 0.15, opt("db").label);
  add("electrician", "electrical", "Electrician labour", "point", points, FIXED.electricianPoint, 1);
  add("fanCeiling", "fans", "Ceiling fans", "fan", fans, opt("fanCeiling").rate, 0, opt("fanCeiling").label);
  add("fanExhaust", "fans", "Exhaust fans", "fan", exhaust, opt("fanExhaust").rate, 0, opt("fanExhaust").label);
  add("fanFix", "fans", "Fan installation", "fan", fans + exhaust, FIXED.fanFix, 1);
  add("acUnits", "acs", `Air conditioners (${acUnits} units)`, "ton", acTons, acType.rate, split ? 0 : 0.15, acType.label);
  if (split) add("acKit", "acs", "AC installation kits, copper pipe & labour", "unit", acUnits, FIXED.acKit, 0.4);

  // ---------- Paint, ceilings, woodwork ----------
  add("putty", "paint", "Wall putty, primer & sealer", "sq ft", paintArea, FIXED.putty);
  supplyFix("paintInterior", "paint", "Interior paint (walls & ceilings)", "paintInterior", paintArea);
  add("paintExterior", "paint", "Exterior weather-shield paint (sides & back)", "sq ft", sides, 85, 0.35);
  supplyFix("elevation", "paint", "Front elevation", "elevation", front);
  supplyFix("ceiling", "ceiling", "False ceiling", "ceilingType", ceilingArea);
  if (type !== "commercial") {
    add("wardrobe", "woodwork", type === "office" ? "Storage cabinets" : "Wardrobes", "sq ft", R * dims.wardrobeSqft, opt("wardrobe").rate, 0.25, opt("wardrobe").label);
  }
  const railRft = steps * 1.05 + (homeLike ? (floors - 1) * 12 : 0);
  add("railing", "woodwork", "Stair & balcony railings", "rft", railRft, opt("railing").rate, 0.25, opt("railing").label);

  // ---------- Water ----------
  supplyFix("geyser", "water", "Water heaters", "geyser", geysers);
  supplyFix("pump", "water", "Water pumps", "pump", floors > 4 ? 2 : 1);

  // ---------- Add-ons: appliances, extras ----------
  const range = opt("applianceRange");
  const ctx: AddonCtx = { type, tier: inp.tier, floors, plotSqft, coveredSqft: covered, footprint, rooms };
  for (const a of ADDONS) {
    if (a.only && !a.only.includes(type)) continue;
    const sel = inp.addons[a.id];
    if (!(sel ? sel.on : a.on(ctx))) continue;
    const qty = sel?.qty ?? a.qty(ctx);
    const rate = Array.isArray(a.rate) ? a.rate[range.factor ?? 1] : a.rate;
    add(`x_${a.id}`, a.cat, a.name, a.unit, qty, rate, a.labour ?? 0, Array.isArray(a.rate) ? range.label : a.note);
  }

  // ---------- Totals ----------
  const catTotals: Partial<Record<Cat, number>> = {};
  const stageTotals: Record<Stage, number> = { grey: 0, finishing: 0 };
  let labourTotal = 0;
  for (const l of lines) {
    catTotals[l.cat] = (catTotals[l.cat] ?? 0) + l.amount;
    stageTotals[l.stage] += l.amount;
    labourTotal += l.amount * l.labour;
  }
  const groupMap = new Map<Group, number>();
  for (const [c, v] of Object.entries(catTotals)) {
    const gk = CATS[c as Cat].group;
    groupMap.set(gk, (groupMap.get(gk) ?? 0) + (v ?? 0));
  }
  const groupTotals = (Object.keys(GROUPS) as Group[])
    .filter((k) => (groupMap.get(k) ?? 0) > 0)
    .map((k) => ({ group: k, label: GROUPS[k], amount: groupMap.get(k) ?? 0 }));

  const subtotal = stageTotals.grey + stageTotals.finishing;
  const materialTotal = subtotal - labourTotal;
  const p = inp.percentages;
  const adders = [
    { label: "Architect & structural design", pct: p.designFee, base: subtotal },
    { label: "Approvals, NOCs & utility connections", pct: p.approvals, base: subtotal },
    {
      label: inp.contract === "labour" ? "Contractor margin (on labour)" : "Contractor overhead & profit",
      pct: p.contractor,
      base: inp.contract === "labour" ? labourTotal : subtotal,
    },
    { label: "Contingency", pct: p.contingency, base: subtotal },
  ]
    .filter((a) => a.pct > 0)
    .map((a) => ({ label: a.label, pct: a.pct, amount: (a.base * a.pct) / 100 }));
  const total = subtotal + adders.reduce((s, a) => s + a.amount, 0);
  const land = Math.max(0, inp.land || 0);

  // ---------- Payment plan ----------
  const feeF = subtotal > 0 ? total / subtotal : 1;
  const ct = (...cs: Cat[]) => cs.reduce((s, c) => s + (catTotals[c] ?? 0), 0);
  const greyRest = ct("structure", "roof", "roughin", "greyLabour");
  const plan: { name: string; stage: Stage; amount: number; weeks: [number, number] }[] = [
    { name: "Excavation, foundation & site works", stage: "grey", amount: ct("site") + greyRest * 0.2, weeks: [3, 5] },
    { name: "Columns, beams & brickwork", stage: "grey", amount: greyRest * 0.35, weeks: [6, 10] },
    { name: "Roof slabs (lintel & lenter)", stage: "grey", amount: greyRest * 0.25, weeks: [4, 8] },
    { name: "Plaster, piping, conduits & waterproofing", stage: "grey", amount: greyRest * 0.2, weeks: [4, 6] },
    { name: "Flooring, tiles & marble", stage: "finishing", amount: ct("flooring", "tiles", "marble"), weeks: [4, 7] },
    { name: "Doors, windows & woodwork", stage: "finishing", amount: ct("doors", "windows", "woodwork"), weeks: [4, 8] },
    { name: "Kitchens, washrooms & water", stage: "finishing", amount: ct("kitchen", "washrooms", "water"), weeks: [3, 6] },
    { name: "Electrical, fans & ACs", stage: "finishing", amount: ct("electrical", "fans", "acs"), weeks: [2, 4] },
    { name: "Paint, ceilings & elevation", stage: "finishing", amount: ct("paint", "ceiling"), weeks: [3, 6] },
    { name: "Appliances, extras & handover", stage: "finishing", amount: ct("appliances", "external"), weeks: [1, 3] },
  ];
  const phases = plan
    .filter((ph) => ph.amount > 0)
    .map((ph) => ({ ...ph, amount: ph.amount * feeF, weeks: scaleWeeks(ph.weeks, covered) }));
  const durationWeeks: [number, number] = [
    phases.reduce((s, ph) => s + ph.weeks[0], 0),
    phases.reduce((s, ph) => s + ph.weeks[1], 0),
  ];

  const lineQty = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;
  const q: Quantities = {
    bricks: lineQty("bricks"),
    cement: lineQty("cement"),
    steel: lineQty("steel"),
    sand: lineQty("sand"),
    crush: lineQty("crush"),
    floorArea: mainFloor + kitchenFloor + bathFloor,
    wallTiles: bathWall + backsplash,
    steps,
    stoneRft: sillRft,
    doors: allDoors + glassDoors,
    windowArea,
    windows: windowCount,
    lights,
    points,
    fans,
    exhaust,
    acUnits,
    acTons,
    paintArea,
    ceilingArea,
    geysers,
  };

  return {
    plotSqft,
    footprint,
    coveredSqft: covered,
    basementSqft,
    rooms,
    roomDefaults,
    dims,
    q,
    lines,
    catTotals,
    groupTotals,
    stageTotals,
    materialTotal,
    labourTotal,
    subtotal,
    adders,
    total,
    perSqft: covered > 0 ? total / covered : 0,
    land,
    projectTotal: total + land,
    phases,
    durationWeeks,
  };
}

// Phase durations are quoted for a ~4,500 sq ft building; scale gently with size.
function scaleWeeks([a, b]: [number, number], sqft: number): [number, number] {
  const f = Math.min(3, Math.max(0.6, Math.sqrt(sqft / 4500)));
  return [Math.max(1, Math.round(a * f)), Math.max(1, Math.round(b * f))];
}

// The same building priced at each quality preset, ignoring item-level choices.
export function compareTiers(inp: Inputs): { tier: Tier; total: number; perSqft: number }[] {
  return TIER_KEYS.map((tier) => {
    const r = calculate({
      ...inp,
      tier,
      specs: {},
      addons: {},
      rateOverrides: {},
      qtyOverrides: {},
      dims: { kitchenRft: inp.dims.kitchenRft, windowScale: inp.dims.windowScale },
    });
    return { tier, total: r.total, perSqft: r.perSqft };
  });
}

export function coverageFor(type: BuildingType): number {
  return Math.round(BUILDING_TYPES[type].coverage * 100);
}
