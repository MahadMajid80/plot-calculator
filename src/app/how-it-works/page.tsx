import { pageMeta } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/PageHead";
import { Eyebrow, Headline, Panel, PillLink } from "@/components/Section";
import { FAQ } from "@/lib/faq";
import { DEFAULT_PERCENTAGES } from "@/lib/rates";

export const metadata: Metadata = pageMeta(
  "How We Estimate Construction Cost in Pakistan",
  "The method behind every Plot.pk estimate: covered area, room counts, thumb-rule quantities of bricks, cement and steel per sq ft, item rates, city factors, fees and contingency.",
  "/how-it-works/",
);

export default function HowItWorks() {
  const steps = [
    ["Covered area", "Plot area × coverage % × number of floors, plus the basement if selected. You can also enter your architect's covered area directly."],
    ["Rooms", "We suggest bedrooms, bathrooms, kitchens, lounges and stores for your size and building type. You can change every count."],
    ["Grey structure", "Thumb-rule quantities per sq ft of covered area: about 24 bricks, 0.42 bags of cement, 3.5 kg of steel, 1.8 cft of sand and 1.3 cft of crush for a house, adjusted for building type, structure and basement."],
    ["Finishing quantities", "Floor and wall tile areas, stair steps, sill lengths, doors, window area, light and socket points, fans, AC tonnage and paint area are worked out from the covered area and rooms."],
    ["Item rates", "Each item has options from basic to luxury with a supply rate and a fixing labour rate. A quality preset picks typical options, and you can change any of them."],
    ["City factor", "Lahore rates are multiplied by a factor for your city, from about 0.92 to 1.10."],
    ["Fees & allowances", `Design (${DEFAULT_PERCENTAGES.designFee}%), approvals (${DEFAULT_PERCENTAGES.approvals}%), contractor overhead and profit (${DEFAULT_PERCENTAGES.contractor}%) and contingency (${DEFAULT_PERCENTAGES.contingency}%) go on top. Each one is adjustable. Land is shown separately.`],
  ];
  return (
    <>
      <PageHead
        crumbs={[{ name: "Home", href: "/" }, { name: "How we estimate", href: "/how-it-works/" }]}
        eyebrow="Our method"
        title="How we estimate"
        accent="your construction cost."
        lead="Plain thumb rules used by Pakistani contractors and quantity surveyors, with every number visible and editable."
      />
      <Panel>
        <div className="mx-auto max-w-4xl space-y-4">
          {steps.map(([t, d], i) => (
            <div key={t} className="flex gap-5 rounded-[28px] bg-white p-6 shadow-sm sm:p-7">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-bold text-white">{i + 1}</span>
              <div>
                <h2 className="text-xl font-extrabold">{t}</h2>
                <p className="mt-1 text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <div className="mx-auto max-w-4xl">
          <Eyebrow n="02">FAQ&apos;s</Eyebrow>
          <Headline size="md" accent="answered.">Common questions,</Headline>
          <div className="mt-10 space-y-3">
            {FAQ.map((f) => (
              <div key={f.q} className="rounded-[28px] bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">{f.q}</h3>
                <p className="mt-2 text-muted">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <PillLink Comp={Link} href="/calculator/" dark>
              Try the calculator
            </PillLink>
          </div>
        </div>
      </Panel>
    </>
  );
}
