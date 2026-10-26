// Light page sections: a pale rounded panel, a numbered eyebrow, and a big headline
// whose last line is in brand blue. Only the calculator card itself is dark.

export function Panel({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className="px-2 py-1.5 sm:px-4 sm:py-2">
      <div className={`mx-auto max-w-[1400px] rounded-[28px] bg-panel px-4 py-12 sm:rounded-[40px] sm:px-10 sm:py-16 lg:px-16 lg:py-20 ${className}`}>
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ n, children, light }: { n?: string; children: React.ReactNode; light?: boolean }) {
  return (
    <p className="flex items-center gap-4 text-[12px] font-semibold uppercase tracking-[0.22em] sm:text-[13px]">
      {n && <span className={light ? "text-peri" : "text-brand"}>{n}</span>}
      {n && <span className={`h-px w-10 ${light ? "bg-white/25" : "bg-ink/25"}`} aria-hidden />}
      <span className={light ? "text-white/70" : "text-ink/70"}>{children}</span>
    </p>
  );
}

// Headline with an optional accent line, e.g. "What under-insurance" / "really costs you."
export function Headline({
  children,
  accent,
  as: Tag = "h2",
  size = "lg",
}: {
  children: React.ReactNode;
  accent?: React.ReactNode;
  as?: "h1" | "h2";
  size?: "lg" | "md";
}) {
  const cls =
    size === "lg"
      ? "text-[40px] leading-[1.02] sm:text-6xl lg:text-[76px]"
      : "text-[34px] leading-[1.05] sm:text-5xl lg:text-[56px]";
  return (
    <Tag className={`mt-6 text-balance font-extrabold tracking-[-0.04em] text-ink ${cls}`}>
      {children}
      {accent && <span className="block text-brand">{accent}</span>}
    </Tag>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{children}</p>;
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex max-w-xl gap-3 rounded-2xl border border-line bg-canvas/70 p-4 text-[15px] leading-relaxed text-muted sm:p-5">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand" aria-hidden>
        i
      </span>
      <span>{children}</span>
    </div>
  );
}

// White pill button with a round blue arrow, as on the reference calculator.
export function PillLink({
  href,
  children,
  dark,
  arrow = "→",
  Comp = "a",
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
  arrow?: string;
  Comp?: React.ElementType;
}) {
  return (
    <Comp
      href={href}
      className={`inline-flex items-center gap-4 rounded-full py-2 pl-6 pr-2 text-base font-semibold transition sm:text-lg ${
        dark ? "bg-navy text-white hover:bg-navy-2" : "bg-white text-navy hover:bg-canvas"
      }`}
    >
      {children}
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-white" aria-hidden>
        {arrow}
      </span>
    </Comp>
  );
}
