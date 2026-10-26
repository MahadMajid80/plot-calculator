import Link from "next/link";
import type { Result } from "@/lib/calculate";
import { pkr, pkrShort, num } from "@/lib/format";

interface Props {
  result: Result;
  sentence: string;
  children?: React.ReactNode; // sliders shown above the results
  cta?: { href: string; label: string };
  className?: string;
}

// The homepage navy calculator card: sliders, a material/labour split bar, two big tiles and one plain sentence.
export default function ResultCard({ result, sentence, children, cta, className = "" }: Props) {
  const matPct = result.subtotal > 0 ? (result.materialTotal / result.subtotal) * 100 : 0;
  const labPct = 100 - matPct;
  return (
    <div className={`dots print-plain rounded-[28px] bg-navy p-6 text-white sm:rounded-[36px] shadow-[0_30px_60px_-20px_rgb(22_28_55/45%)] sm:p-9 ${className}`}>
      {children}

      <div className={children ? "mt-8" : ""}>
        <p className="text-[15px] text-white/70">Estimated total cost</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl" aria-live="polite">
          {pkrShort(result.total)}
        </p>
        <p className="mt-1 text-sm text-white/60">
          {pkr(result.total)} · {pkr(result.perSqft)} per sq ft · {num(result.coveredSqft)} sq ft covered
        </p>
      </div>

      <div className="mt-6 flex gap-2" aria-hidden>
        <div className="h-3 rounded-full bg-peri transition-all duration-300" style={{ width: `${matPct}%` }} />
        {labPct > 0.5 && <div className="h-3 rounded-full bg-salmon transition-all duration-300" style={{ width: `${labPct}%` }} />}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-white/5 bg-navy-2 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm text-white/70">
            <span className="h-2.5 w-2.5 rounded-full bg-peri" /> Materials
          </p>
          <p className="mt-1 whitespace-nowrap text-xl font-extrabold tracking-tight sm:text-2xl">{pkrShort(result.materialTotal)}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-navy-2 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm text-white/70">
            <span className="h-2.5 w-2.5 rounded-full bg-salmon" /> Labour
          </p>
          <p className="mt-1 whitespace-nowrap text-xl font-extrabold tracking-tight text-salmon sm:text-2xl">{pkrShort(result.labourTotal)}</p>
        </div>
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-white/75">{sentence}</p>

      {cta && (
        <Link
          href={cta.href}
          className="no-print mt-6 inline-flex items-center gap-4 rounded-full bg-white py-2 pl-6 pr-2 text-base font-semibold text-navy transition hover:bg-page sm:text-lg"
        >
          {cta.label}
          <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white" aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
