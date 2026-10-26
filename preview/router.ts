// Tiny in-page router for the single-file claude.ai preview build.
type Route = { path: string; query: string };
let route: Route = { path: "/", query: "" };
const subs = new Set<() => void>();

export function getRoute() {
  return route;
}
export function subscribe(fn: () => void) {
  subs.add(fn);
  return () => subs.delete(fn);
}
export function navigate(href: string) {
  const [p, q = ""] = href.split("?");
  const path = p.endsWith("/") ? p : `${p}/`;
  route = { path, query: q };
  try {
    window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
  } catch {
    /* ignore */
  }
  subs.forEach((f) => f());
  window.scrollTo(0, 0);
}
