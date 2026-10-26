import type { Metadata } from "next";
import Calculator from "@/components/Calculator";
import PageHead from "@/components/PageHead";
import { SITE, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  `Construction Cost Calculator Pakistan ${SITE.year}: Every Item Priced`,
  `Free itemised house construction cost calculator for Pakistan (${SITE.year}). Price bricks, cement, steel, tiles, marble, doors, windows, kitchens, washrooms, wiring, ACs and appliances in PKR, USD, GBP or AED.`,
  "/calculator/",
);

export default function CalculatorPage() {
  return (
    <>
      <PageHead
        crumbs={[{ name: "Home", href: "/" }, { name: "Calculator", href: "/calculator/" }]}
        eyebrow={`Construction cost calculator ${SITE.year}`}
        title="Price your house, item by item,"
        accent="from plot to handover."
        lead="Set the building and rooms, then choose the floors, marble, doors, windows, fittings, ACs and finishes. The total updates as you go."
        note={
          <>
            Indicative Lahore rates, last reviewed {SITE.ratesUpdated}. Quantities use contractor thumb rules, and you can type your own
            quantities and rates in the bill of quantities.
          </>
        }
      />
      <Calculator />
    </>
  );
}
