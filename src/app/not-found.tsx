import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold">Page not found</h1>
      <p className="mt-3 text-muted">The page you were looking for has moved or never existed.</p>
      <Link href="/calculator/" className="mt-8 inline-flex rounded-full bg-navy px-6 py-3 font-semibold text-white hover:bg-navy-2">Go to the calculator</Link>
    </div>
  );
}
