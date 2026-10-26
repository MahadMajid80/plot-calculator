import type { Inputs, Result } from "./calculate";
import { BUILDING_TYPES, CITIES, TIERS } from "./rates";
import { num, pkr, pkrWords } from "./format";

export function unitShort(u: string): string {
  return ({ marla225: "marla", marla272: "marla", kanal: "kanal", sqyd: "sq yd", sqft: "sq ft" } as Record<string, string>)[u] ?? u;
}

export function floorsLabel(n: number): string {
  return n === 1 ? "Ground only" : `Ground + ${n - 1}`;
}

// One plain-English line summarising the estimate.
export function describe(inp: Inputs, r: Result): string {
  const size = `${num(inp.plotSize, 1)} ${unitShort(inp.plotUnit)}`;
  const storeys = inp.floors === 1 ? "single-storey" : `${inp.floors}-storey`;
  const what = `${TIERS[inp.tier].label.toLowerCase()} ${BUILDING_TYPES[inp.type].label.toLowerCase()}`;
  const scope =
    inp.scope === "grey" ? "Grey structure" : inp.scope === "finishing" ? "Finishing" : "Complete construction";
  const land = r.land > 0 ? ` With the land, the whole project is about ${pkrWords(r.projectTotal)}.` : "";
  return `${scope} of a ${size}, ${storeys} ${what} in ${CITIES[inp.city]?.label ?? "Pakistan"} comes to about ${pkrWords(
    r.total,
  )}, or ${pkr(r.perSqft)} per sq ft.${land}`;
}
