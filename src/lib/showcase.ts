// What the homepage and rates page say about each itemised section.
import { SPEC, SPECS, Spec } from "./rates";

export const SHOWCASE: { title: string; icon: string; spec: string; items: string[] }[] = [
  { title: "Windows", icon: "🪟", spec: "winFrame", items: ["Aluminium, UPVC or wood frames", "Clear, tinted, tempered or double glass", "Grills and mosquito nets"] },
  { title: "Doors", icon: "🚪", spec: "doorInternal", items: ["Main, room and bathroom doors", "Kail, Deyar, Ash or Teak", "Frames, polish and hardware"] },
  { title: "Marble & stone", icon: "🪨", spec: "stairs", items: ["Staircase steps", "Window sills and thresholds", "Skirting and cladding"] },
  { title: "Tiles & flooring", icon: "🧱", spec: "floorMain", items: ["Ceramic, porcelain or imported", "Marble, granite or wood floors", "Bathroom and kitchen walls"] },
  { title: "Kitchen", icon: "🍳", spec: "kitchenCabinets", items: ["Cabinets per running foot", "Granite, quartz or Corian tops", "Sink, mixer and hardware"] },
  { title: "Washrooms", icon: "🚿", spec: "wc", items: ["Commodes, basins and vanities", "Mixers, showers and accessories", "Glass partitions and bathtubs"] },
  { title: "Electrical & lights", icon: "💡", spec: "wiring", items: ["Wiring per point", "Switches, sockets and breakers", "LED panels to chandeliers"] },
  { title: "Fans & ACs", icon: "❄️", spec: "acType", items: ["Ceiling and exhaust fans", "Split, inverter or VRF per ton", "Pick which rooms get an AC"] },
  { title: "Paint & ceilings", icon: "🎨", spec: "paintInterior", items: ["Distemper to luxury emulsion", "Elevation paint or cladding", "POP or gypsum false ceilings"] },
  { title: "Woodwork", icon: "🪵", spec: "wardrobe", items: ["Wardrobes per sq ft", "Stair and balcony railings", "TV and feature walls"] },
  { title: "Appliances & water", icon: "🔌", spec: "geyser", items: ["Hob, hood and oven", "Geysers, pumps and tanks", "UPS, solar and generators"] },
  { title: "Grey structure", icon: "🏗️", spec: "steel", items: ["Bricks, cement, steel, sand, crush", "Roof insulation and plumbing", "Mistri and mazdoor labour"] },
];

export function fromRate(s: Spec): string {
  const priced = s.options.filter((o) => o.rate > 0).map((o) => o.rate + (o.fix ?? 0));
  const min = Math.min(...priced);
  return `from Rs ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 1 }).format(min)} / ${s.unit}`;
}

export const OPTION_COUNT = SPECS.reduce((s, x) => s + (x.options.some((o) => o.rate > 0) ? x.options.length : 0), 0);
export const showcaseSpec = (id: string) => SPEC[id];
