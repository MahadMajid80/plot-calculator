import type { Metadata } from "next";
import { CostHub } from "@/components/CostPages";
import { SITE, pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta(
  `House Construction Cost in Pakistan ${SITE.year}: By Plot Size & City`,
  "What it costs to build a 3 marla, 5 marla, 10 marla, 1 kanal or 2 kanal house in Lahore, Karachi, Islamabad and 9 more cities. Grey structure and complete costs, basic to luxury, in PKR.",
  "/house-construction-cost/",
);

export default function Page() {
  return <CostHub />;
}
