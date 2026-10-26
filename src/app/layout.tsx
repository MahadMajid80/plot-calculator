import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `House Construction Cost Calculator Pakistan ${SITE.year} | Plot.pk`,
    template: "%s | Plot.pk",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    `construction cost in Pakistan ${SITE.year}`,
    "house construction cost calculator Pakistan",
    "10 marla house construction cost",
    "5 marla house construction cost",
    "1 kanal house construction cost",
    "grey structure cost per sq ft",
    "construction cost per square foot Lahore",
    "build a house in Pakistan from abroad",
    "overseas Pakistani house construction",
    "material rates Pakistan",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Construction",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_PK",
    url: "/",
    title: `House Construction Cost Calculator Pakistan ${SITE.year}`,
    description: SITE.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Plot.pk construction cost calculator for Pakistan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `House Construction Cost Calculator Pakistan ${SITE.year}`,
    description: SITE.description,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon.png", sizes: "512x512", type: "image/png" }], apple: "/apple-icon.png" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#f5f6fa", width: "device-width", initialScale: 1, viewportFit: "cover" };

const siteLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#org`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon.png`,
    description: SITE.tagline,
    areaServed: { "@type": "Country", name: "Pakistan" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: "en-PK",
    publisher: { "@id": `${SITE.url}/#org` },
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PK" className={jakarta.variable}>
      <body className="min-h-screen font-sans">
        <JsonLd data={siteLd} />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
