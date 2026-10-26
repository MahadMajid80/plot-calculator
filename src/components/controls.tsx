"use client";

// Form controls styled for the dark navy calculator card.
import type { Opt } from "@/lib/rates";
import { num } from "@/lib/format";

export const darkInput =
  "w-full min-h-12 rounded-xl border border-white/15 bg-navy-2 px-4 py-3 text-base text-white outline-none transition [color-scheme:dark] placeholder:text-white/35 focus:border-peri focus:ring-4 focus:ring-peri/20";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (v: number) => void;
}

export function Slider({ label, value, min, max, step = 1, display, onChange }: SliderProps) {
  const v = Math.min(max, Math.max(min, value));
  const pct = ((v - min) / (max - min)) * 100;
  const id = `s-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[15px] text-white/80">
          {label}
        </label>
        <span className="text-right font-bold text-white">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={v}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[15px] text-white/80">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-sm text-white/50">{hint}</span>}
    </label>
  );
}

export function Pills<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="mb-6">
      <legend className="mb-2 text-[15px] text-white/80">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([k, l]) => (
          <button
            key={k}
            type="button"
            aria-pressed={value === k}
            onClick={() => onChange(k)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              value === k ? "bg-peri text-navy" : "bg-navy-2 text-white/80 hover:bg-navy-3"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// A row of option cards for one item, e.g. floor material. Shows the rate per unit.
export function OptionGrid({
  label,
  help,
  unit,
  options,
  value,
  presetId,
  onChange,
  columns = 3,
}: {
  label: string;
  help?: string;
  unit: string;
  options: Opt[];
  value: string;
  presetId: string;
  onChange: (id: string) => void;
  columns?: 2 | 3;
}) {
  const priced = options.some((o) => o.rate > 0);
  return (
    <fieldset className="mb-8 last:mb-0">
      <legend className="mb-1 font-semibold text-white">{label}</legend>
      {help && <p className="mb-3 text-sm text-white/55">{help}</p>}
      <div className={`mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 ${columns === 3 ? "xl:grid-cols-3" : ""}`}>
        {options.map((o) => {
          const on = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.id)}
              className={`relative rounded-2xl border p-3.5 text-left transition ${
                on ? "border-peri bg-peri/15" : "border-white/10 bg-navy-2/70 hover:border-white/30"
              }`}
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-[15px] font-semibold leading-snug text-white">{o.label}</span>
                <span
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${on ? "border-peri bg-peri" : "border-white/30"}`}
                  aria-hidden
                >
                  {on && <span className="h-1.5 w-1.5 rounded-full bg-navy" />}
                </span>
              </span>
              {o.note && <span className="mt-0.5 block text-[13px] text-white/55">{o.note}</span>}
              <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
                {priced && (
                  <span className="font-semibold text-peri">
                    {o.rate > 0 ? `Rs ${num(o.rate + (o.fix ?? 0), o.rate < 100 ? 1 : 0)} / ${unit}` : "Rs 0"}
                  </span>
                )}
                {o.id === presetId && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/60">Preset</span>}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Stepper({
  label,
  value,
  suggested,
  onChange,
  onReset,
  max = 200,
}: {
  label: string;
  value: number;
  suggested?: number;
  onChange: (v: number) => void;
  onReset?: () => void;
  max?: number;
}) {
  const changed = suggested !== undefined && suggested !== value;
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-navy-2/70 p-3 pl-4">
      <div className="min-w-0">
        <p className="font-semibold leading-snug text-white">{label}</p>
        {suggested !== undefined && (
          <p className="text-[13px] text-white/50">
            Suggested {suggested}
            {changed && onReset && (
              <>
                {" · "}
                <button type="button" className="font-semibold text-peri underline" onClick={onReset}>
                  reset
                </button>
              </>
            )}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label={`Fewer ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="grid h-10 w-10 place-items-center rounded-full bg-navy-3 text-lg font-bold text-white hover:bg-white/20"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-label={label}
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(max, Math.round(Number(e.target.value) || 0))))}
          className={`w-14 rounded-lg bg-transparent text-center text-lg font-bold tabular-nums outline-none focus:ring-2 focus:ring-peri ${changed ? "text-peri" : "text-white"}`}
        />
        <button
          type="button"
          aria-label={`More ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="grid h-10 w-10 place-items-center rounded-full bg-navy-3 text-lg font-bold text-white hover:bg-white/20"
        >
          +
        </button>
      </div>
    </div>
  );
}

// An optional item: switch it on and set the quantity.
export function AddonRow({
  name,
  note,
  rateText,
  on,
  qty,
  unit,
  onToggle,
  onQty,
  showQty = true,
}: {
  showQty?: boolean;
  name: string;
  note?: string;
  rateText: string;
  on: boolean;
  qty: number;
  unit: string;
  onToggle: (on: boolean) => void;
  onQty: (q: number | null) => void;
}) {
  return (
    <div className={`rounded-2xl border p-3.5 transition ${on ? "border-peri/60 bg-peri/10" : "border-white/10 bg-navy-2/70"}`}>
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" className="peer sr-only" checked={on} onChange={(e) => onToggle(e.target.checked)} />
        <span
          className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition peer-focus-visible:ring-2 peer-focus-visible:ring-peri ${on ? "bg-peri" : "bg-navy-3"}`}
          aria-hidden
        >
          <span className={`h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-5" : ""}`} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap justify-between gap-x-3">
            <span className="font-semibold text-white">{name}</span>
            {rateText && <span className="text-[13px] font-semibold text-peri">{rateText}</span>}
          </span>
          {note && <span className="block text-[13px] text-white/55">{note}</span>}
        </span>
      </label>
      {on && showQty && (
        <div className="mt-3 flex items-center gap-3 pl-14 text-sm">
          <span className="text-white/60">Quantity</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            aria-label={`${name} quantity`}
            className={`${darkInput} !min-h-10 max-w-28 !py-1.5`}
            value={Math.round(qty * 100) / 100}
            onChange={(e) => onQty(e.target.value === "" ? null : Math.max(0, Number(e.target.value)))}
          />
          <span className="text-white/60">{unit}</span>
        </div>
      )}
    </div>
  );
}
