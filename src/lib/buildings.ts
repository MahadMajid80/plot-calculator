// Building types, kept apart from the rates so the header menu stays light.
export type BuildingType = "home" | "residential" | "office" | "commercial";

export const BUILDING_TYPES: Record<
  BuildingType,
  { label: string; short: string; description: string; coverage: number; icon: string }
> = {
  home: {
    label: "Home",
    short: "House / Bungalow",
    description: "Single-family house on a 3 marla to 2 kanal plot.",
    coverage: 0.8,
    icon: "🏠",
  },
  residential: {
    label: "Residential",
    short: "Apartments / Flats",
    description: "Multi-unit apartment or flat buildings with shared stairs and lifts.",
    coverage: 0.75,
    icon: "🏢",
  },
  office: {
    label: "Office",
    short: "Corporate / Office block",
    description: "Open-plan or partitioned office space with ceilings and HVAC.",
    coverage: 0.7,
    icon: "💼",
  },
  commercial: {
    label: "Commercial",
    short: "Shops / Plaza / Mall",
    description: "Shops, plazas and mixed-use buildings with heavier loads.",
    coverage: 0.85,
    icon: "🏬",
  },
};
