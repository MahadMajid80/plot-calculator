// Homepage intro animation in plain CSS, so it needs no JavaScript. Headings only slide
// (no fade), which keeps them visible at first paint for a fast Largest Contentful Paint.
export default function Reveal({
  children,
  delay = 0,
  className = "",
  fade = true,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  fade?: boolean;
}) {
  return (
    <div className={`${fade ? "reveal" : "reveal-slide"} ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}
