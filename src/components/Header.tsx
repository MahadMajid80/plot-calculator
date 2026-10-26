"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BUILDING_TYPES, BuildingType } from "@/lib/buildings";
import { SIZES, costHref } from "@/lib/sizes";

const TYPES = Object.entries(BUILDING_TYPES) as [BuildingType, (typeof BUILDING_TYPES)[BuildingType]][];

const NAV: [string, string][] = [
  ["/house-construction-cost/", "House costs"],
  ["/grey-structure-cost/", "Grey structure"],
  ["/overseas-pakistanis/", "Overseas Pakistanis"],
  ["/rates/", "Material rates"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const pathname = usePathname();
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setMega(false), setOpen(false));
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMega(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const link = "rounded-full px-3 py-2 text-[15px] xl:px-4 font-medium text-ink/75 hover:bg-panel hover:text-ink";

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/90 text-ink backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-peri" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6" />
            </svg>
          </span>
          <span>Plot<span className="text-brand">.pk</span></span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          <div className="relative" ref={megaRef}>
            <button
              className={`${link} inline-flex items-center gap-1`}
              aria-expanded={mega}
              aria-controls="mega-menu"
              onClick={() => setMega((m) => !m)}
            >
              Calculators
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition ${mega ? "rotate-180" : ""}`} aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {mega && (
              <div id="mega-menu" className="absolute left-1/2 top-full mt-3 w-[620px] -translate-x-1/2 rounded-3xl bg-white p-4 text-ink shadow-2xl">
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(([key, t]) => (
                    <Link key={key} href={`/calculator/?type=${key}`} className="flex gap-3 rounded-2xl p-4 hover:bg-page">
                      <span className="text-2xl" aria-hidden>{t.icon}</span>
                      <span>
                        <span className="block font-bold">{t.label} cost calculator</span>
                        <span className="block text-sm text-muted">{t.description}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="mt-2 rounded-2xl bg-page px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">House construction cost by plot size</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SIZES.map((sz) => (
                      <Link key={sz.slug} href={costHref(sz)} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold hover:text-brand">
                        {sz.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className={link} aria-current={pathname === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/calculator/"
            className="hidden items-center gap-3 rounded-full bg-navy py-1.5 pl-5 pr-1.5 font-semibold text-white hover:bg-navy-2 sm:inline-flex"
          >
            Calculate cost
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-white" aria-hidden>→</span>
          </Link>
          <button
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-line bg-canvas px-4 pb-6 pt-2 lg:hidden" aria-label="Mobile">
          <Link href="/" className="block rounded-xl px-3 py-3 font-medium">Home</Link>
          <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wider text-muted">Calculators</p>
          {TYPES.map(([key, t]) => (
            <Link key={key} href={`/calculator/?type=${key}`} className="flex items-center gap-3 rounded-xl px-3 py-3">
              <span aria-hidden>{t.icon}</span> {t.label} <span className="text-sm text-muted">{t.short}</span>
            </Link>
          ))}
          <p className="px-3 pt-4 text-xs font-semibold uppercase tracking-wider text-muted">Cost guides</p>
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="block rounded-xl px-3 py-3 font-medium">{label}</Link>
          ))}
          <Link href="/how-it-works/" className="block rounded-xl px-3 py-3 font-medium">How we estimate</Link>
          <Link href="/calculator/" className="mt-4 flex items-center justify-between rounded-full bg-navy py-1.5 pl-5 pr-1.5 font-semibold text-white">
            Calculate cost
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white" aria-hidden>→</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
