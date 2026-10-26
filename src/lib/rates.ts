// Every rate the calculator uses, in one file. All money is in PKR.
// Rates are indicative Lahore prices for late 2026; other cities are scaled by a factor.
// Each "spec" is a choice the visitor makes (e.g. floor material) with one option per
// quality level; `def` picks the default option for Basic / Standard / Premium / Luxury.

import { BUILDING_TYPES, BuildingType } from "./buildings";

export { BUILDING_TYPES };
export type { BuildingType };
export type Tier = "economy" | "standard" | "premium" | "luxury";
export type Scope = "complete" | "grey" | "finishing";
export type Stage = "grey" | "finishing";
export type Contract = "turnkey" | "labour";

export const TIER_KEYS: Tier[] = ["economy", "standard", "premium", "luxury"];

export const TIERS: Record<Tier, { label: string; description: string }> = {
  economy: { label: "Basic", description: "Local materials, ceramic tiles, flush doors, local fittings." },
  standard: { label: "Standard", description: "Porcelain tiles, solid wood doors, branded fittings, inverter ACs." },
  premium: { label: "Premium", description: "Marble, UPVC windows, imported fittings, gypsum ceilings." },
  luxury: { label: "Luxury", description: "Imported marble, designer fittings, smart home, VRF cooling." },
};

export const SCOPES: Record<Scope, { label: string; description: string }> = {
  complete: { label: "Complete", description: "From excavation to move-in ready." },
  grey: { label: "Grey structure", description: "Foundation, frame, brickwork, plaster, roof and piping." },
  finishing: { label: "Finishing only", description: "Floors, doors, windows, paint, kitchens, baths and fixtures." },
};

export const CONTRACTS: Record<Contract, { label: string; description: string }> = {
  turnkey: { label: "With material", description: "Contractor supplies materials and labour. Margin applies to everything." },
  labour: { label: "Labour only", description: "You buy materials yourself. Contractor margin applies to labour only." },
};

export const CITIES: Record<string, { label: string; factor: number }> = {
  lahore: { label: "Lahore", factor: 1.0 },
  karachi: { label: "Karachi", factor: 1.05 },
  islamabad: { label: "Islamabad", factor: 1.1 },
  rawalpindi: { label: "Rawalpindi", factor: 1.06 },
  faisalabad: { label: "Faisalabad", factor: 0.95 },
  multan: { label: "Multan", factor: 0.93 },
  peshawar: { label: "Peshawar", factor: 0.97 },
  gujranwala: { label: "Gujranwala", factor: 0.95 },
  sialkot: { label: "Sialkot", factor: 0.97 },
  hyderabad: { label: "Hyderabad", factor: 0.98 },
  bahawalpur: { label: "Bahawalpur", factor: 0.92 },
  quetta: { label: "Quetta", factor: 1.03 },
  other: { label: "Other city", factor: 1.0 },
};

export const AREA_UNITS: Record<string, { label: string; sqft: number }> = {
  marla225: { label: "Marla (225 sq ft)", sqft: 225 },
  marla272: { label: "Marla (272 sq ft)", sqft: 272.25 },
  kanal: { label: "Kanal (20 marla, 4,500 sq ft)", sqft: 4500 },
  sqyd: { label: "Square yards", sqft: 9 },
  sqft: { label: "Square feet", sqft: 1 },
};

// ---------- Rooms ----------

export type RoomKey = "rooms" | "baths" | "kitchens" | "halls" | "utility" | "parking";
export const ROOM_KEYS: RoomKey[] = ["rooms", "baths", "kitchens", "halls", "utility", "parking"];

export const ROOM_LABELS: Record<BuildingType, Record<RoomKey, string>> = {
  home: {
    rooms: "Bedrooms",
    baths: "Bathrooms",
    kitchens: "Kitchens",
    halls: "Drawing, dining & TV lounges",
    utility: "Store, servant & laundry rooms",
    parking: "Car porch spaces",
  },
  residential: {
    rooms: "Bedrooms (all flats)",
    baths: "Bathrooms (all flats)",
    kitchens: "Kitchens (one per flat)",
    halls: "Lounges",
    utility: "Stores & utility rooms",
    parking: "Parking spaces",
  },
  office: {
    rooms: "Private offices / cabins",
    baths: "Washrooms",
    kitchens: "Pantries",
    halls: "Open work halls",
    utility: "Meeting & conference rooms",
    parking: "Parking spaces",
  },
  commercial: {
    rooms: "Shops / units",
    baths: "Washrooms",
    kitchens: "Pantries / kitchenettes",
    halls: "Halls, corridors & showrooms",
    utility: "Storage rooms",
    parking: "Parking spaces",
  },
};

// Typical room counts for a building of this size. Visitors can change every number.
export function defaultRooms(type: BuildingType, covered: number, floors: number, plotSqft: number): Record<RoomKey, number> {
  const r = (n: number) => Math.max(0, Math.round(n));
  if (type === "home") {
    const rooms = Math.max(1, Math.min(14, r(Math.sqrt(covered / 150))));
    return {
      rooms,
      baths: rooms + 1,
      kitchens: covered >= 2400 && floors >= 2 ? Math.min(floors, 3) : 1,
      halls: Math.min(6, Math.max(2, floors + 1 + (covered > 6000 ? 1 : 0))),
      utility: Math.max(1, Math.min(4, r(covered / 2500))),
      parking: plotSqft < 1500 ? 1 : plotSqft < 4000 ? 2 : 3,
    };
  }
  if (type === "residential") {
    const flats = Math.max(2, r(covered / 1100));
    return { rooms: flats * 2, baths: flats * 2, kitchens: flats, halls: flats, utility: Math.max(1, floors), parking: flats };
  }
  if (type === "office") {
    return {
      rooms: Math.max(2, r(covered / 450)),
      baths: Math.max(2, r(covered / 900)),
      kitchens: Math.max(1, floors),
      halls: Math.max(1, floors),
      utility: Math.max(1, r(covered / 2500)),
      parking: r(covered / 500),
    };
  }
  return {
    rooms: Math.max(2, r(covered / 450)),
    baths: Math.max(2, r(covered / 1500)),
    kitchens: Math.max(1, r(floors / 2)),
    halls: Math.max(1, floors),
    utility: Math.max(1, floors),
    parking: r(covered / 700),
  };
}

// ---------- Cost categories ----------

export type Cat =
  | "site"
  | "structure"
  | "roof"
  | "roughin"
  | "greyLabour"
  | "flooring"
  | "tiles"
  | "marble"
  | "doors"
  | "windows"
  | "kitchen"
  | "washrooms"
  | "electrical"
  | "fans"
  | "acs"
  | "paint"
  | "ceiling"
  | "woodwork"
  | "water"
  | "appliances"
  | "external";

export type Group = "grey" | "floors" | "stone" | "openings" | "wet" | "mep" | "surfaces" | "appliances" | "external";

export const GROUPS: Record<Group, string> = {
  grey: "Grey structure",
  floors: "Flooring & tiles",
  stone: "Marble & stone",
  openings: "Doors & windows",
  wet: "Kitchen & washrooms",
  mep: "Electrical, fans & ACs",
  surfaces: "Paint, ceilings & woodwork",
  appliances: "Appliances & water",
  external: "External works",
};

export const CATS: Record<Cat, { label: string; stage: Stage; group: Group }> = {
  site: { label: "Site works & foundation", stage: "grey", group: "grey" },
  structure: { label: "Structure materials", stage: "grey", group: "grey" },
  roof: { label: "Waterproofing & insulation", stage: "grey", group: "grey" },
  roughin: { label: "Plumbing & electrical rough-in", stage: "grey", group: "grey" },
  greyLabour: { label: "Grey structure labour", stage: "grey", group: "grey" },
  flooring: { label: "Flooring", stage: "finishing", group: "floors" },
  tiles: { label: "Wall tiles", stage: "finishing", group: "floors" },
  marble: { label: "Marble & stone work", stage: "finishing", group: "stone" },
  doors: { label: "Doors & gate", stage: "finishing", group: "openings" },
  windows: { label: "Windows & glazing", stage: "finishing", group: "openings" },
  kitchen: { label: "Kitchen", stage: "finishing", group: "wet" },
  washrooms: { label: "Washrooms & sanitary", stage: "finishing", group: "wet" },
  electrical: { label: "Electrical & lighting", stage: "finishing", group: "mep" },
  fans: { label: "Fans", stage: "finishing", group: "mep" },
  acs: { label: "Air conditioning", stage: "finishing", group: "mep" },
  paint: { label: "Paint & elevation", stage: "finishing", group: "surfaces" },
  ceiling: { label: "False ceilings", stage: "finishing", group: "surfaces" },
  woodwork: { label: "Woodwork & railings", stage: "finishing", group: "surfaces" },
  water: { label: "Pumps, tanks & geysers", stage: "finishing", group: "appliances" },
  appliances: { label: "Appliances", stage: "finishing", group: "appliances" },
  external: { label: "External works & extras", stage: "finishing", group: "external" },
};

// ---------- Specs: one choice per item, with options from basic to luxury ----------

export interface Opt {
  id: string;
  label: string;
  note?: string;
  rate: number; // supply rate per spec unit (Lahore)
  fix?: number; // fixing / installation labour per spec unit
  factor?: number; // used by specs that scale a quantity instead of pricing it
}

export interface Spec {
  id: string;
  cat: Cat;
  label: string;
  help?: string;
  unit: string;
  options: Opt[];
  def: [number, number, number, number]; // option index for Basic, Standard, Premium, Luxury
  defBy?: Partial<Record<BuildingType, [number, number, number, number]>>;
  only?: BuildingType[];
}

const FLOOR_OPTS: Opt[] = [
  { id: "ceramic", label: "Ceramic tiles", note: "Local, 2×2 ft", rate: 150, fix: 60 },
  { id: "porcelain", label: "Porcelain tiles", note: "Local brands, 2×2 / 2×4 ft", rate: 290, fix: 70 },
  { id: "imported", label: "Imported porcelain", note: "Spanish / large slab", rate: 560, fix: 90 },
  { id: "marble", label: "Local marble", note: "Botticino, Ziarat, Sunny grey", rate: 380, fix: 115 },
  { id: "importedMarble", label: "Imported marble", note: "Italian / Turkish", rate: 1450, fix: 150 },
  { id: "granite", label: "Granite", note: "Black / Indian granite", rate: 650, fix: 120 },
  { id: "laminate", label: "Laminate wood", note: "8–12 mm with underlay", rate: 420, fix: 45 },
  { id: "engineered", label: "Engineered wood", note: "Real wood top layer", rate: 1250, fix: 70 },
  { id: "terrazzo", label: "Terrazzo / chips", note: "Cast in place, ground", rate: 140, fix: 95 },
  { id: "spc", label: "Vinyl / SPC planks", note: "Waterproof click", rate: 300, fix: 40 },
  { id: "epoxy", label: "Epoxy coating", note: "Seamless, for shops & offices", rate: 230, fix: 60 },
];
const floorOpts = (...ids: string[]) => ids.map((id) => FLOOR_OPTS.find((o) => o.id === id)!);

export const SPECS: Spec[] = [
  // ----- Grey structure -----
  {
    id: "structure",
    cat: "structure",
    label: "Structure type",
    help: "Load-bearing brick walls suit 1–2 storey houses. Anything taller needs a full RCC frame.",
    unit: "",
    options: [
      { id: "loadbearing", label: "Load-bearing brick + RCC slabs", note: "Less steel and concrete", rate: 0, factor: 0.82 },
      { id: "frame", label: "Full RCC frame", note: "Columns and beams", rate: 0, factor: 1 },
    ],
    def: [1, 1, 1, 1],
  },
  {
    id: "bricks",
    cat: "structure",
    label: "Bricks",
    unit: "brick",
    options: [
      { id: "b", label: "B-class bricks", note: "Second grade", rate: 15.5 },
      { id: "a", label: "A-class (awal) bricks", note: "First grade kiln", rate: 17.5 },
      { id: "tunnel", label: "Machine-made bricks", note: "Tunnel kiln, uniform size", rate: 22 },
    ],
    def: [0, 1, 1, 2],
  },
  {
    id: "cement",
    cat: "structure",
    label: "Cement",
    unit: "bag",
    options: [
      { id: "opc", label: "OPC cement", note: "Ordinary Portland, 50 kg", rate: 1450 },
      { id: "src", label: "Sulphate-resistant (SRC)", note: "For saline or wet soil", rate: 1620 },
    ],
    def: [0, 0, 0, 0],
  },
  {
    id: "steel",
    cat: "structure",
    label: "Steel bars",
    unit: "kg",
    options: [
      { id: "g40", label: "Grade 40", note: "Mild deformed bars", rate: 238 },
      { id: "g60", label: "Grade 60", note: "Standard for RCC", rate: 255 },
      { id: "g60p", label: "Grade 60, premium mill", note: "Certified, earthquake-grade", rate: 270 },
    ],
    def: [1, 1, 2, 2],
  },
  {
    id: "sand",
    cat: "structure",
    label: "Sand",
    unit: "cft",
    options: [
      { id: "mix", label: "Ravi + Chenab mix", rate: 72 },
      { id: "chenab", label: "Chenab sand", rate: 95 },
      { id: "lawrencepur", label: "Lawrencepur sand", rate: 120 },
    ],
    def: [0, 0, 1, 1],
  },
  {
    id: "crush",
    cat: "structure",
    label: "Crush / aggregate",
    unit: "cft",
    options: [
      { id: "sargodha", label: "Sargodha crush", rate: 150 },
      { id: "margalla", label: "Margalla crush", rate: 178 },
    ],
    def: [0, 0, 1, 1],
  },
  {
    id: "roofing",
    cat: "roof",
    label: "Roof waterproofing & insulation",
    unit: "sq ft",
    options: [
      { id: "basic", label: "Bitumen, polythene & mud", note: "With brick tiles", rate: 95 },
      { id: "thermo", label: "Thermopore insulation", note: "1\" thermopore, polythene, brick tiles", rate: 140 },
      { id: "membrane", label: "Membrane + XPS insulation", note: "Chemical membrane, heat-reflective tiles", rate: 240 },
    ],
    def: [0, 1, 2, 2],
  },
  {
    id: "pipes",
    cat: "roughin",
    label: "Plumbing pipes",
    unit: "sq ft",
    options: [
      { id: "local", label: "Local PVC + PPR", rate: 80 },
      { id: "branded", label: "Branded PPR", note: "Hot and cold lines", rate: 105 },
      { id: "premium", label: "Imported PPR / PEX", note: "Long warranty", rate: 150 },
    ],
    def: [0, 1, 1, 2],
  },
  {
    id: "greyLabour",
    cat: "greyLabour",
    label: "Grey structure labour",
    help: "Mistri and mazdoor rate per sq ft of covered area.",
    unit: "sq ft",
    options: [
      { id: "local", label: "Local thekedar", rate: 450 },
      { id: "experienced", label: "Experienced contractor", rate: 520 },
      { id: "company", label: "Construction company", rate: 620 },
    ],
    def: [0, 1, 1, 2],
  },

  // ----- Flooring & tiles -----
  {
    id: "floorMain",
    cat: "flooring",
    label: "Rooms, lounges & corridors",
    unit: "sq ft",
    options: floorOpts("ceramic", "porcelain", "imported", "marble", "importedMarble", "granite", "laminate", "engineered", "terrazzo", "spc", "epoxy"),
    def: [0, 1, 3, 4],
    defBy: { office: [0, 1, 2, 2], commercial: [0, 1, 2, 4] },
  },
  {
    id: "floorKitchen",
    cat: "flooring",
    label: "Kitchen floor",
    unit: "sq ft",
    options: floorOpts("ceramic", "porcelain", "imported", "marble", "granite", "spc"),
    def: [0, 1, 2, 2],
  },
  {
    id: "floorBath",
    cat: "flooring",
    label: "Bathroom floors",
    help: "Anti-skid finish recommended.",
    unit: "sq ft",
    options: floorOpts("ceramic", "porcelain", "imported", "marble"),
    def: [0, 1, 2, 2],
  },
  {
    id: "floorOutdoor",
    cat: "flooring",
    label: "Porch, driveway & outdoor",
    unit: "sq ft",
    options: [
      { id: "tuff", label: "Tuff tiles / pavers", rate: 160, fix: 45 },
      { id: "stamped", label: "Stamped concrete", rate: 210, fix: 70 },
      { id: "exterior", label: "Anti-skid porcelain", rate: 330, fix: 75 },
      { id: "stone", label: "Granite / natural stone", rate: 620, fix: 120 },
    ],
    def: [0, 0, 2, 3],
  },
  {
    id: "wallBath",
    cat: "tiles",
    label: "Bathroom wall tiles",
    unit: "sq ft",
    options: [
      { id: "ceramic", label: "Ceramic wall tiles", rate: 140, fix: 65 },
      { id: "porcelain", label: "Porcelain tiles", rate: 270, fix: 75 },
      { id: "imported", label: "Imported porcelain", note: "Large format", rate: 540, fix: 95 },
      { id: "marble", label: "Local marble", rate: 380, fix: 120 },
      { id: "designer", label: "Designer / mosaic feature", rate: 750, fix: 130 },
    ],
    def: [0, 1, 2, 4],
  },
  {
    id: "bathHeight",
    cat: "tiles",
    label: "Bathroom wall tiling height",
    unit: "",
    options: [
      { id: "dado", label: "Up to 4 ft", note: "Paint above", rate: 0, factor: 0.5 },
      { id: "seven", label: "Up to 7 ft", rate: 0, factor: 0.85 },
      { id: "full", label: "Full height", note: "Floor to ceiling", rate: 0, factor: 1 },
    ],
    def: [1, 2, 2, 2],
  },
  {
    id: "wallKitchen",
    cat: "tiles",
    label: "Kitchen backsplash",
    unit: "sq ft",
    options: [
      { id: "ceramic", label: "Ceramic tiles", rate: 140, fix: 65 },
      { id: "subway", label: "Subway / designer tiles", rate: 320, fix: 90 },
      { id: "mosaic", label: "Glass mosaic", rate: 650, fix: 130 },
      { id: "slab", label: "Quartz / stone slab", rate: 1100, fix: 150 },
    ],
    def: [0, 1, 2, 3],
  },

  // ----- Marble & stone -----
  {
    id: "stairs",
    cat: "marble",
    label: "Staircase steps",
    help: "Per step, tread and riser, about 4 ft wide.",
    unit: "step",
    options: [
      { id: "terrazzo", label: "Terrazzo / chips", rate: 3500, fix: 1200 },
      { id: "porcelain", label: "Porcelain step tiles", rate: 5500, fix: 1300 },
      { id: "marble", label: "Local marble", note: "Sunny grey, Botticino", rate: 7500, fix: 1500 },
      { id: "granite", label: "Granite", rate: 11000, fix: 1700 },
      { id: "imported", label: "Imported marble", rate: 22000, fix: 2200 },
    ],
    def: [0, 2, 3, 4],
  },
  {
    id: "sills",
    cat: "marble",
    label: "Window sills & door thresholds",
    unit: "rft",
    options: [
      { id: "marble", label: "Local marble", rate: 550, fix: 150 },
      { id: "granite", label: "Granite", rate: 1100, fix: 180 },
      { id: "imported", label: "Imported marble", rate: 2200, fix: 220 },
    ],
    def: [0, 0, 1, 2],
  },
  {
    id: "skirting",
    cat: "marble",
    label: "Skirting",
    unit: "rft",
    options: [
      { id: "tile", label: "Tile skirting", rate: 90, fix: 45 },
      { id: "marble", label: "Marble skirting", rate: 180, fix: 55 },
      { id: "granite", label: "Granite skirting", rate: 280, fix: 60 },
      { id: "wood", label: "Wooden / MDF skirting", rate: 260, fix: 40 },
    ],
    def: [0, 0, 1, 2],
  },

  // ----- Doors -----
  {
    id: "doorMain",
    cat: "doors",
    label: "Main entrance doors",
    unit: "door",
    options: [
      { id: "ply", label: "Ply panel door", note: "Veneer finish", rate: 65000, fix: 5000 },
      { id: "kail", label: "Solid Kail wood", rate: 110000, fix: 6000 },
      { id: "deyar", label: "Solid Deyar wood", rate: 160000, fix: 7000 },
      { id: "teak", label: "Solid Ash / Teak, carved", rate: 320000, fix: 9000 },
      { id: "steel", label: "Steel security door", note: "Imported, multi-point lock", rate: 240000, fix: 8000 },
    ],
    def: [0, 2, 3, 3],
  },
  {
    id: "doorInternal",
    cat: "doors",
    label: "Room doors",
    unit: "door",
    options: [
      { id: "flush", label: "Flush door, laminated", rate: 18000, fix: 3000 },
      { id: "semi", label: "Semi-solid, Ash veneer", rate: 38000, fix: 3500 },
      { id: "solid", label: "Solid Kail / Deyar", rate: 62000, fix: 4000 },
      { id: "ash", label: "Solid Ash / Teak", rate: 110000, fix: 5000 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "doorBath",
    cat: "doors",
    label: "Bathroom doors",
    unit: "door",
    options: [
      { id: "pvc", label: "PVC door", note: "With frame", rate: 9000, fix: 1500 },
      { id: "wpc", label: "WPC / fibre door", note: "Waterproof", rate: 17000, fix: 2000 },
      { id: "ply", label: "Marine ply, laminated", rate: 24000, fix: 3000 },
      { id: "solid", label: "Solid wood", note: "Matches room doors", rate: 55000, fix: 4000 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "doorFrame",
    cat: "doors",
    label: "Door frames (chaukhat)",
    unit: "frame",
    options: [
      { id: "steel", label: "Pressed steel frame", rate: 8000 },
      { id: "kail", label: "Kail wood frame", rate: 9500 },
      { id: "deyar", label: "Deyar wood frame", rate: 15000 },
      { id: "ash", label: "Ash / Teak frame", rate: 26000 },
    ],
    def: [1, 2, 2, 3],
  },
  {
    id: "doorPolish",
    cat: "doors",
    label: "Door finish",
    unit: "door",
    options: [
      { id: "lacquer", label: "Lacquer polish", rate: 4500 },
      { id: "pu", label: "PU polish", rate: 9000 },
      { id: "duco", label: "Duco / lacquer paint", rate: 12000 },
    ],
    def: [0, 1, 1, 1],
  },
  {
    id: "doorHardware",
    cat: "doors",
    label: "Locks, handles & hinges",
    unit: "door",
    options: [
      { id: "local", label: "Local hardware", rate: 3500 },
      { id: "branded", label: "Branded hardware", rate: 7500 },
      { id: "imported", label: "Premium imported", rate: 16000 },
      { id: "designer", label: "Designer + digital main lock", rate: 30000 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "gate",
    cat: "doors",
    label: "Main gate",
    only: ["home", "residential"],
    unit: "sq ft",
    options: [
      { id: "ms", label: "MS sheet gate", rate: 1800, fix: 250 },
      { id: "wrought", label: "Wrought iron design", rate: 3200, fix: 300 },
      { id: "auto", label: "Automatic sliding gate", note: "With motor and remote", rate: 4600, fix: 400 },
    ],
    def: [0, 0, 1, 2],
  },
  {
    id: "shutter",
    cat: "doors",
    label: "Shop shutters",
    only: ["commercial"],
    unit: "shutter",
    options: [
      { id: "manual", label: "Manual rolling shutter", rate: 110000, fix: 8000 },
      { id: "motor", label: "Motorised shutter", rate: 210000, fix: 12000 },
      { id: "glass", label: "Glass shopfront + shutter", rate: 340000, fix: 15000 },
    ],
    def: [0, 0, 1, 2],
  },

  // ----- Windows -----
  {
    id: "winFrame",
    cat: "windows",
    label: "Window frames",
    unit: "sq ft",
    options: [
      { id: "alu", label: "Aluminium, standard section", rate: 450, fix: 60 },
      { id: "aluHeavy", label: "Aluminium, heavy section", rate: 750, fix: 70 },
      { id: "upvc", label: "UPVC", note: "Better sound and heat seal", rate: 1100, fix: 80 },
      { id: "thermal", label: "Thermal-break aluminium", rate: 1900, fix: 90 },
      { id: "wood", label: "Solid wood (Deyar)", rate: 1300, fix: 80 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "winGlass",
    cat: "windows",
    label: "Glass",
    unit: "sq ft",
    options: [
      { id: "clear5", label: "5 mm clear", rate: 220 },
      { id: "tinted", label: "6 mm tinted / reflective", rate: 310 },
      { id: "tempered", label: "8 mm tempered", rate: 650 },
      { id: "double", label: "Double glazed", note: "5 + air gap + 5 mm", rate: 1100 },
    ],
    def: [0, 1, 3, 3],
  },
  {
    id: "winGrill",
    cat: "windows",
    label: "Safety grills",
    unit: "sq ft",
    options: [
      { id: "none", label: "No grills", rate: 0 },
      { id: "ms", label: "MS safety grills", rate: 420 },
      { id: "wrought", label: "Wrought iron design", rate: 750 },
    ],
    def: [1, 1, 2, 0],
  },
  {
    id: "winNet",
    cat: "windows",
    label: "Mosquito nets",
    unit: "sq ft",
    options: [
      { id: "none", label: "No nets", rate: 0 },
      { id: "fixed", label: "Fixed fly screens", rate: 110 },
      { id: "pleated", label: "Pleated / roll-up nets", rate: 380 },
    ],
    def: [1, 1, 2, 2],
  },

  // ----- Kitchen -----
  {
    id: "kitchenCabinets",
    cat: "kitchen",
    label: "Kitchen cabinets",
    help: "Per running foot of kitchen, base and wall cabinets together.",
    unit: "rft",
    options: [
      { id: "lasani", label: "Chipboard / Lasani laminate", rate: 8500 },
      { id: "mdf", label: "MDF, high-gloss / UV", rate: 15000 },
      { id: "acrylic", label: "Acrylic / PU lacquer", rate: 24000 },
      { id: "solid", label: "Solid wood", rate: 30000 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "kitchenHardware",
    cat: "kitchen",
    label: "Cabinet hardware",
    unit: "rft",
    options: [
      { id: "basic", label: "Basic hinges & channels", rate: 800 },
      { id: "soft", label: "Soft-close", rate: 2000 },
      { id: "premium", label: "Premium imported soft-close", note: "Lift-ups, tandem boxes", rate: 4500 },
    ],
    def: [0, 1, 2, 2],
  },
  {
    id: "kitchenTop",
    cat: "kitchen",
    label: "Countertop",
    unit: "rft",
    options: [
      { id: "marble", label: "Local marble", rate: 2000 },
      { id: "granite", label: "Granite", rate: 4500 },
      { id: "corian", label: "Corian / solid surface", rate: 9500 },
      { id: "quartz", label: "Quartz", rate: 11000 },
      { id: "sintered", label: "Sintered stone", rate: 16000 },
    ],
    def: [0, 1, 3, 4],
  },
  {
    id: "kitchenSink",
    cat: "kitchen",
    label: "Sink & mixer",
    unit: "kitchen",
    options: [
      { id: "single", label: "Steel single bowl + tap", rate: 12000 },
      { id: "double", label: "Double bowl + branded mixer", rate: 32000 },
      { id: "granite", label: "Granite composite + pull-out mixer", rate: 75000 },
      { id: "imported", label: "Imported undermount + premium mixer", rate: 140000 },
    ],
    def: [0, 1, 2, 3],
  },

  // ----- Washrooms -----
  {
    id: "wc",
    cat: "washrooms",
    label: "Commode (WC)",
    unit: "bathroom",
    options: [
      { id: "floor", label: "Floor-mounted, local", rate: 16000 },
      { id: "onepiece", label: "One-piece, branded", rate: 38000 },
      { id: "wallhung", label: "Wall-hung + concealed cistern", rate: 95000 },
      { id: "smart", label: "Imported wall-hung / smart toilet", rate: 260000 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "basin",
    cat: "washrooms",
    label: "Basin & vanity",
    unit: "bathroom",
    options: [
      { id: "pedestal", label: "Pedestal basin", rate: 9000 },
      { id: "vanity", label: "Counter basin + laminated vanity", rate: 32000 },
      { id: "stone", label: "Vanity with marble / quartz top", rate: 70000 },
      { id: "designer", label: "Designer vanity, imported", rate: 160000 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "taps",
    cat: "washrooms",
    label: "Mixers & taps",
    help: "Basin mixer, shower mixer, Muslim shower and valves.",
    unit: "bathroom",
    options: [
      { id: "local", label: "Local brands", rate: 12000 },
      { id: "branded", label: "Branded local", rate: 30000 },
      { id: "imported", label: "Premium imported", rate: 85000 },
      { id: "thermo", label: "Luxury concealed thermostatic", rate: 190000 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "shower",
    cat: "washrooms",
    label: "Shower set",
    unit: "bathroom",
    options: [
      { id: "basic", label: "Simple shower head", rate: 3500 },
      { id: "rain", label: "Rain shower + hand shower", rate: 14000 },
      { id: "concealed", label: "Concealed rain shower set", rate: 45000 },
      { id: "panel", label: "Luxury rain panel", rate: 110000 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "accessories",
    cat: "washrooms",
    label: "Accessories & mirror",
    help: "Towel rail, ring, soap dish, paper holder, hooks, shelf and mirror.",
    unit: "bathroom",
    options: [
      { id: "basic", label: "Basic set + mirror", rate: 7000 },
      { id: "branded", label: "Branded set + framed mirror", rate: 18000 },
      { id: "led", label: "Premium set + LED mirror", rate: 45000 },
      { id: "smart", label: "Luxury set + smart mirror", rate: 95000 },
    ],
    def: [0, 1, 2, 3],
  },

  // ----- Electrical -----
  {
    id: "wiring",
    cat: "electrical",
    label: "Wiring",
    unit: "point",
    options: [
      { id: "local", label: "Local copper wire", rate: 1900 },
      { id: "branded", label: "Branded copper wire", rate: 2600 },
      { id: "lszh", label: "Fire-retardant (LSZH) wire", rate: 3600 },
    ],
    def: [0, 1, 1, 2],
  },
  {
    id: "switches",
    cat: "electrical",
    label: "Switches & sockets",
    unit: "point",
    options: [
      { id: "local", label: "Local switches", rate: 250 },
      { id: "modular", label: "Branded modular", rate: 600 },
      { id: "imported", label: "Imported glass / metal plates", rate: 1400 },
      { id: "smart", label: "Smart touch switches", note: "App and voice control", rate: 3800 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "lights",
    cat: "electrical",
    label: "Light fittings",
    unit: "light",
    options: [
      { id: "bulbs", label: "LED bulbs & tube lights", rate: 600 },
      { id: "panels", label: "LED panels & downlights", rate: 1400 },
      { id: "designer", label: "COB spots & profile lights", rate: 3200 },
      { id: "architectural", label: "Architectural lighting", rate: 6000 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "db",
    cat: "electrical",
    label: "Distribution boards & breakers",
    unit: "floor",
    options: [
      { id: "local", label: "Local breakers", rate: 22000 },
      { id: "branded", label: "Branded MCBs", rate: 45000 },
      { id: "protected", label: "MCBs + RCD & surge protection", rate: 85000 },
    ],
    def: [0, 1, 2, 2],
  },

  // ----- Fans -----
  {
    id: "fanCeiling",
    cat: "fans",
    label: "Ceiling fans",
    unit: "fan",
    options: [
      { id: "ac", label: "Standard AC fan", rate: 12000 },
      { id: "dc", label: "Energy-saver DC inverter fan", rate: 19000 },
      { id: "designer", label: "Designer fan with light", rate: 42000 },
    ],
    def: [0, 1, 1, 2],
  },
  {
    id: "fanExhaust",
    cat: "fans",
    label: "Exhaust fans",
    unit: "fan",
    options: [
      { id: "plastic", label: "Plastic exhaust fan", rate: 3500 },
      { id: "metal", label: "Metal / ducted exhaust", rate: 7000 },
      { id: "inline", label: "Silent inline exhaust", rate: 14000 },
    ],
    def: [0, 1, 1, 2],
  },

  // ----- ACs -----
  {
    id: "acCover",
    cat: "acs",
    label: "Which rooms get an AC",
    unit: "",
    options: [
      { id: "none", label: "No ACs", rate: 0, factor: 0 },
      { id: "rooms", label: "Bedrooms / cabins only", rate: 0, factor: 1 },
      { id: "living", label: "Bedrooms + living areas", rate: 0, factor: 2 },
      { id: "all", label: "Every room", note: "Includes kitchens and stores", rate: 0, factor: 3 },
    ],
    def: [1, 2, 2, 3],
    defBy: { commercial: [0, 0, 2, 3] },
  },
  {
    id: "acType",
    cat: "acs",
    label: "AC type",
    help: "Price per ton of cooling.",
    unit: "ton",
    options: [
      { id: "split", label: "Split AC, non-inverter", rate: 78000, fix: 0 },
      { id: "inverter", label: "DC inverter split", rate: 125000, fix: 0 },
      { id: "premium", label: "Premium inverter (Japanese)", rate: 185000, fix: 0 },
      { id: "vrf", label: "VRF / ducted central", note: "Includes ducting", rate: 260000, fix: 0 },
    ],
    def: [0, 1, 2, 3],
    defBy: { office: [1, 1, 3, 3], commercial: [1, 1, 3, 3] },
  },

  // ----- Paint, ceilings -----
  {
    id: "paintInterior",
    cat: "paint",
    label: "Interior paint",
    unit: "sq ft",
    options: [
      { id: "distemper", label: "Distemper", rate: 18, fix: 22 },
      { id: "emulsion", label: "Matt emulsion", rate: 32, fix: 28 },
      { id: "premium", label: "Premium washable emulsion", rate: 48, fix: 32 },
      { id: "luxury", label: "Luxury silk + feature textures", rate: 90, fix: 55 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "elevation",
    cat: "paint",
    label: "Front elevation",
    unit: "sq ft",
    options: [
      { id: "paint", label: "Weather-shield paint", rate: 55, fix: 30 },
      { id: "texture", label: "Texture coat + weather-shield", rate: 120, fix: 45 },
      { id: "cladding", label: "Stone / brick cladding", rate: 520, fix: 120 },
      { id: "marble", label: "Marble / granite cladding", rate: 850, fix: 150 },
      { id: "acp", label: "ACP / glass facade", rate: 1100, fix: 150 },
    ],
    def: [0, 1, 2, 3],
    defBy: { office: [0, 1, 4, 4], commercial: [0, 1, 4, 4] },
  },
  {
    id: "ceilingType",
    cat: "ceiling",
    label: "False ceiling type",
    unit: "sq ft",
    options: [
      { id: "none", label: "No false ceiling", note: "Paint only", rate: 0 },
      { id: "pop", label: "POP, plain", rate: 75, fix: 40 },
      { id: "gypsum", label: "Gypsum board", rate: 105, fix: 45 },
      { id: "design", label: "Gypsum with design & cove lights", rate: 170, fix: 70 },
      { id: "tiles", label: "Acoustic tiles 2×2", note: "For offices", rate: 85, fix: 35 },
      { id: "wood", label: "Wooden / PVC panels", rate: 250, fix: 70 },
    ],
    def: [0, 2, 3, 3],
    defBy: { office: [4, 4, 3, 3], commercial: [0, 4, 3, 3] },
  },

  // ----- Woodwork -----
  {
    id: "wardrobe",
    cat: "woodwork",
    label: "Wardrobes & storage",
    help: "Per sq ft of wardrobe front.",
    only: ["home", "residential", "office"],
    unit: "sq ft",
    options: [
      { id: "lasani", label: "Chipboard / Lasani laminate", rate: 1100 },
      { id: "mdf", label: "MDF / UV high-gloss", rate: 1800 },
      { id: "veneer", label: "Solid wood / veneer", rate: 2700 },
      { id: "acrylic", label: "Acrylic / glass fronts", rate: 3400 },
    ],
    def: [0, 1, 2, 3],
  },
  {
    id: "railing",
    cat: "woodwork",
    label: "Stair & balcony railings",
    unit: "rft",
    options: [
      { id: "ms", label: "MS railing, painted", rate: 2300 },
      { id: "ss", label: "Stainless steel", rate: 4800 },
      { id: "wrought", label: "Wrought iron design", rate: 6000 },
      { id: "wood", label: "Solid wood", rate: 7000 },
      { id: "glass", label: "Glass with steel fittings", rate: 8500 },
    ],
    def: [0, 1, 4, 4],
  },

  // ----- Water -----
  {
    id: "geyser",
    cat: "water",
    label: "Water heaters",
    unit: "geyser",
    options: [
      { id: "gas", label: "Gas geyser, 35–55 gallon", rate: 58000, fix: 4000 },
      { id: "instant", label: "Instant gas geyser", rate: 45000, fix: 4000 },
      { id: "hybrid", label: "Electric + gas hybrid", rate: 95000, fix: 5000 },
      { id: "solar", label: "Solar water heater", rate: 190000, fix: 12000 },
      { id: "heatpump", label: "Heat pump", rate: 380000, fix: 15000 },
    ],
    def: [0, 2, 3, 4],
  },
  {
    id: "pump",
    cat: "water",
    label: "Water pumps",
    unit: "set",
    options: [
      { id: "basic", label: "Water pump, 0.5–1 HP", rate: 28000, fix: 4000 },
      { id: "booster", label: "Pump + pressure booster", rate: 85000, fix: 6000 },
      { id: "system", label: "Pressure system with controller", rate: 160000, fix: 10000 },
    ],
    def: [0, 1, 1, 2],
  },
  {
    id: "applianceRange",
    cat: "appliances",
    label: "Appliance range",
    help: "Sets the price of every appliance you switch on below.",
    unit: "",
    options: [
      { id: "local", label: "Local brands", rate: 0, factor: 0 },
      { id: "standard", label: "Standard brands", rate: 0, factor: 1 },
      { id: "premium", label: "Premium / imported", rate: 0, factor: 2 },
    ],
    def: [0, 1, 2, 2],
  },
];

export const SPEC = Object.fromEntries(SPECS.map((s) => [s.id, s])) as Record<string, Spec>;

export function tierIndex(t: Tier): number {
  return TIER_KEYS.indexOf(t);
}

export function defaultOption(spec: Spec, tier: Tier, type: BuildingType): Opt {
  const idx = (spec.defBy?.[type] ?? spec.def)[tierIndex(tier)];
  return spec.options[idx] ?? spec.options[0];
}

// ---------- Add-ons: optional items with a quantity ----------

export interface AddonCtx {
  type: BuildingType;
  tier: Tier;
  floors: number;
  plotSqft: number;
  coveredSqft: number;
  footprint: number;
  rooms: Record<RoomKey, number>;
}

export interface Addon {
  id: string;
  cat: Cat;
  name: string;
  note?: string;
  unit: string;
  rate: number | [number, number, number]; // a triple is priced by the appliance range
  labour?: number; // share of the amount that is labour
  only?: BuildingType[];
  on: (c: AddonCtx) => boolean;
  qty: (c: AddonCtx) => number;
}

const ti = (c: AddonCtx) => tierIndex(c.tier);
const homeLike = (c: AddonCtx) => c.type === "home" || c.type === "residential";

export const ADDONS: Addon[] = [
  // Washrooms
  {
    id: "glassPartition",
    cat: "washrooms",
    name: "Glass shower partitions",
    note: "10 mm tempered glass with fittings",
    unit: "bathroom",
    rate: 75000,
    labour: 0.15,
    on: (c) => ti(c) >= 2 && homeLike(c),
    qty: (c) => c.rooms.rooms,
  },
  {
    id: "bathtub",
    cat: "washrooms",
    name: "Bathtubs",
    unit: "tub",
    rate: 220000,
    labour: 0.1,
    on: (c) => ti(c) >= 3 && c.type === "home",
    qty: () => 1,
  },
  {
    id: "handDryer",
    cat: "washrooms",
    name: "Hand dryers",
    unit: "dryer",
    rate: 18000,
    on: (c) => !homeLike(c),
    qty: (c) => c.rooms.baths,
  },
  // Electrical
  {
    id: "chandelier",
    cat: "electrical",
    name: "Chandeliers",
    unit: "piece",
    rate: 65000,
    labour: 0.05,
    on: (c) => ti(c) >= 2 && homeLike(c),
    qty: (c) => Math.max(1, Math.round(c.rooms.halls / 2)),
  },
  {
    id: "earthing",
    cat: "electrical",
    name: "Earthing & lightning protection",
    unit: "system",
    rate: 65000,
    labour: 0.3,
    on: () => true,
    qty: (c) => Math.max(1, Math.ceil(c.coveredSqft / 10000)),
  },
  // Fans
  {
    id: "bracketFan",
    cat: "fans",
    name: "Bracket / wall fans",
    unit: "fan",
    rate: 9500,
    on: () => false,
    qty: (c) => c.rooms.kitchens,
  },
  // Woodwork
  {
    id: "featureWall",
    cat: "woodwork",
    name: "TV / feature wall panelling",
    note: "WPC or wood panels with lighting",
    unit: "sq ft",
    rate: 1400,
    labour: 0.3,
    on: (c) => ti(c) >= 2 && homeLike(c),
    qty: (c) => c.rooms.halls * 80,
  },
  // Water
  {
    id: "tank",
    cat: "water",
    name: "Overhead water tanks",
    note: "Plastic, multi-layer",
    unit: "gallon",
    rate: 90,
    labour: 0.05,
    on: () => true,
    qty: (c) => Math.min(10000, Math.max(500, Math.round(c.coveredSqft / 3 / 100) * 100)),
  },
  {
    id: "filter",
    cat: "water",
    name: "Whole-house water filter",
    unit: "system",
    rate: [60000, 120000, 250000],
    on: (c) => ti(c) >= 2,
    qty: () => 1,
  },
  // Appliances
  { id: "hob", cat: "appliances", name: "Kitchen hob", note: "Built-in gas hob", unit: "piece", rate: [32000, 65000, 150000], on: (c) => homeLike(c), qty: (c) => c.rooms.kitchens },
  { id: "hood", cat: "appliances", name: "Kitchen hood", unit: "piece", rate: [28000, 60000, 170000], on: (c) => homeLike(c), qty: (c) => c.rooms.kitchens },
  { id: "oven", cat: "appliances", name: "Built-in oven", unit: "piece", rate: [70000, 140000, 320000], on: (c) => ti(c) >= 2 && homeLike(c), qty: () => 1 },
  { id: "microwave", cat: "appliances", name: "Microwave", unit: "piece", rate: [28000, 45000, 90000], on: (c) => ti(c) >= 3 && homeLike(c), qty: (c) => c.rooms.kitchens },
  { id: "fridge", cat: "appliances", name: "Refrigerator", unit: "piece", rate: [130000, 220000, 480000], on: () => false, qty: (c) => c.rooms.kitchens },
  { id: "washer", cat: "appliances", name: "Washing machine", unit: "piece", rate: [55000, 130000, 320000], on: () => false, qty: () => 1 },
  { id: "dishwasher", cat: "appliances", name: "Dishwasher", unit: "piece", rate: [120000, 190000, 380000], on: (c) => ti(c) >= 3 && c.type === "home", qty: () => 1 },
  { id: "dispenser", cat: "appliances", name: "Water dispenser / RO", unit: "piece", rate: [25000, 55000, 140000], on: () => false, qty: (c) => c.rooms.kitchens },
  { id: "ups", cat: "appliances", name: "UPS / inverter with batteries", unit: "set", rate: [150000, 260000, 480000], on: (c) => ti(c) >= 1, qty: (c) => (c.type === "residential" ? c.rooms.kitchens : Math.max(1, Math.round(c.coveredSqft / 5000))) },
  { id: "generator", cat: "appliances", name: "Generator", unit: "set", rate: [250000, 550000, 1400000], on: (c) => ti(c) >= 3 || c.type === "office" || c.type === "commercial", qty: () => 1 },
  // External works & extras
  {
    id: "boundary",
    cat: "site",
    name: "Boundary wall",
    note: "7 ft brick wall with plaster, per running foot",
    unit: "rft",
    rate: 6500,
    labour: 0.3,
    on: (c) => c.type === "home",
    qty: (c) => Math.round(Math.sqrt(c.plotSqft) * 3),
  },
  { id: "ugtank", cat: "site", name: "Underground water tank", note: "RCC, per gallon", unit: "gallon", rate: 160, labour: 0.35, on: (c) => c.type === "home", qty: (c) => (c.coveredSqft > 4000 ? 2000 : 1000) },
  { id: "septic", cat: "site", name: "Septic tank & soakage pit", note: "Where there is no sewer line", unit: "set", rate: 180000, labour: 0.4, on: () => false, qty: () => 1 },
  {
    id: "landscaping",
    cat: "external",
    name: "Lawn & landscaping",
    note: "Grass, plants, pavers and garden lights",
    unit: "sq ft",
    rate: 350,
    labour: 0.4,
    on: (c) => ti(c) >= 3 && c.type === "home",
    qty: (c) => Math.max(0, Math.round((c.plotSqft - c.footprint) * 0.6)),
  },
  {
    id: "solar",
    cat: "external",
    name: "Solar system (on-grid)",
    note: "Panels, inverter, structure and net metering",
    unit: "kW",
    rate: 120000,
    labour: 0.1,
    on: (c) => ti(c) >= 2,
    qty: (c) => Math.max(3, Math.round(c.coveredSqft / 600)),
  },
  { id: "cctv", cat: "external", name: "CCTV cameras", note: "With recorder and cabling", unit: "camera", rate: 18000, labour: 0.2, on: (c) => ti(c) >= 1, qty: (c) => Math.max(4, c.floors * 3) },
  { id: "intercom", cat: "external", name: "Video door phone / intercom", unit: "set", rate: 45000, labour: 0.1, on: (c) => ti(c) >= 1 && homeLike(c), qty: (c) => (c.type === "residential" ? c.rooms.kitchens : 1) },
  { id: "smart", cat: "external", name: "Smart home hub & sensors", unit: "system", rate: 350000, labour: 0.2, on: (c) => ti(c) >= 3 && c.type === "home", qty: () => 1 },
  {
    id: "lift",
    cat: "external",
    name: "Passenger lift",
    note: "8 person lift including installation, per stop",
    unit: "stop",
    rate: 850000,
    labour: 0.1,
    on: (c) => c.floors >= 4 && c.type !== "home",
    qty: (c) => c.floors,
  },
  {
    id: "fire",
    cat: "external",
    name: "Fire safety system",
    note: "Alarms, extinguishers and hose reels, per sq ft",
    unit: "sq ft",
    rate: 45,
    labour: 0.25,
    on: (c) => c.type !== "home",
    qty: (c) => c.coveredSqft,
  },
  { id: "pool", cat: "external", name: "Swimming pool", note: "Per sq ft of pool, with filtration", unit: "sq ft", rate: 9000, labour: 0.35, on: () => false, qty: () => 300 },
];

// Percentages applied on the construction subtotal.
export const DEFAULT_PERCENTAGES = {
  designFee: 2, // architect & structural design
  approvals: 1, // map approval, NOC, utility connections
  contractor: 10, // contractor overhead & profit (0 if self-managed)
  contingency: 5,
};

export const BASEMENT_FACTOR = 1.35; // basement grey work is ~35% costlier per sq ft

// Grey structure thumb-rule quantities per sq ft of covered area.
export const GREY_QTY = {
  bricks: 24,
  cement: 0.42,
  steel: 3.5,
  sand: 1.8,
  crush: 1.3,
};

export const GREY_TYPE_FACTOR: Record<string, Partial<Record<BuildingType, number>>> = {
  bricks: { office: 0.85, commercial: 0.8, residential: 0.95 },
  cement: { office: 1.1, commercial: 1.15, residential: 1.1 },
  steel: { residential: 1.15, office: 1.2, commercial: 1.3 },
  crush: { office: 1.1, commercial: 1.15, residential: 1.1 },
  excavation: { office: 1.1, commercial: 1.2, residential: 1.15 },
  pipes: { office: 0.7, commercial: 0.7, residential: 1.1 },
  conduits: { office: 1.3, commercial: 1.2 },
};

// Fixed grey-stage rates (Lahore).
export const FIXED = {
  excavation: 55, // per sq ft covered
  shuttering: 55, // per sq ft covered
  termite: 35, // DPC & termite proofing, per sq ft of footprint
  conduits: 50, // electrical conduits & boxes, per sq ft covered
  gasPipe: 25000, // per kitchen
  acPiping: 9500, // copper pre-piping & drain per split AC
  adhesive: 32, // tile adhesive, grout & bedding per sq ft tiled
  putty: 14, // wall putty & primer per sq ft painted
  electricianPoint: 650, // per point
  fanFix: 1000, // per fan
  acKit: 18000, // installation kit & copper pipe per split unit
  plumberBath: 14000, // per bathroom
  bathDrains: 4500, // floor drains, traps & angle valves per bathroom
  kitchenFix: 12000, // per kitchen
  glassDoor: 185000, // frameless 12 mm glass entrance door with fittings
};
