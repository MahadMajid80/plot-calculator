// Keeps an estimate in the URL so it can be shared or bookmarked.
// Basic choices are plain query params; item-level choices go in one compact `c` param.
import { DEFAULT_INPUTS, Inputs, coverageFor } from "./calculate";
import { AREA_UNITS, BUILDING_TYPES, BuildingType, CITIES, CONTRACTS, Contract, SCOPES, Scope, TIERS, Tier } from "./rates";

type Custom = Pick<Inputs, "rooms" | "specs" | "addons" | "dims" | "rateOverrides" | "qtyOverrides" | "percentages">;

function encode(o: unknown): string {
  const json = JSON.stringify(o);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(s: string): unknown {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

export function toQuery(inp: Inputs): string {
  const q = new URLSearchParams({
    type: inp.type,
    size: String(inp.plotSize),
    unit: inp.plotUnit,
    floors: String(inp.floors),
    tier: inp.tier,
    scope: inp.scope,
    city: inp.city,
  });
  if (inp.basement) q.set("basement", "1");
  if (inp.contract !== "turnkey") q.set("contract", inp.contract);
  if (inp.coverage !== coverageFor(inp.type)) q.set("cover", String(inp.coverage));
  if (inp.coveredOverride) q.set("covered", String(inp.coveredOverride));
  if (inp.land > 0) q.set("land", String(inp.land));
  const c: Partial<Custom> = {};
  if (Object.keys(inp.rooms).length) c.rooms = inp.rooms;
  if (Object.keys(inp.specs).length) c.specs = inp.specs;
  if (Object.keys(inp.addons).length) c.addons = inp.addons;
  if (Object.keys(inp.dims).length) c.dims = inp.dims;
  if (Object.keys(inp.rateOverrides).length) c.rateOverrides = inp.rateOverrides;
  if (Object.keys(inp.qtyOverrides).length) c.qtyOverrides = inp.qtyOverrides;
  if (JSON.stringify(inp.percentages) !== JSON.stringify(DEFAULT_INPUTS.percentages)) c.percentages = inp.percentages;
  if (Object.keys(c).length) q.set("c", encode(c));
  return q.toString();
}

export function fromQuery(search: string, cur: Inputs): Inputs {
  const q = new URLSearchParams(search);
  const next: Inputs = { ...cur };
  const type = q.get("type") as BuildingType | null;
  if (type && type in BUILDING_TYPES) {
    next.type = type;
    next.coverage = coverageFor(type);
  }
  const unit = q.get("unit");
  if (unit && unit in AREA_UNITS) next.plotUnit = unit;
  const size = Number(q.get("size"));
  if (size > 0) next.plotSize = size;
  const floors = Number(q.get("floors"));
  if (floors >= 1) next.floors = Math.min(30, Math.round(floors));
  const tier = q.get("tier") as Tier | null;
  if (tier && tier in TIERS) next.tier = tier;
  const scope = q.get("scope") as Scope | null;
  if (scope && scope in SCOPES) next.scope = scope;
  const city = q.get("city");
  if (city && city in CITIES) next.city = city;
  if (q.get("basement") === "1") next.basement = true;
  const contract = q.get("contract") as Contract | null;
  if (contract && contract in CONTRACTS) next.contract = contract;
  if (q.get("labour") === "1") next.contract = "labour"; // links from the first version
  const cover = Number(q.get("cover"));
  if (cover >= 20 && cover <= 100) next.coverage = cover;
  const covered = Number(q.get("covered"));
  if (covered > 0) next.coveredOverride = covered;
  const land = Number(q.get("land"));
  if (land > 0) next.land = land;
  const c = q.get("c");
  if (c) {
    try {
      const o = decode(c) as Partial<Custom>;
      for (const k of ["rooms", "specs", "addons", "dims", "rateOverrides", "qtyOverrides"] as const) {
        if (o[k] && typeof o[k] === "object") (next as unknown as Record<string, unknown>)[k] = o[k];
      }
      if (o.percentages && typeof o.percentages === "object") next.percentages = { ...next.percentages, ...o.percentages };
    } catch {
      /* ignore a damaged link */
    }
  }
  return next;
}
