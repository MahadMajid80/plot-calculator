import { createRoot } from "react-dom/client";
import { useSyncExternalStore } from "react";
import { getRoute, navigate, subscribe } from "./router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/app/page";
import CalculatorPage from "@/app/calculator/page";
import RatesPage from "@/app/rates/page";
import HowItWorks from "@/app/how-it-works/page";
import CostHubPage from "@/app/house-construction-cost/page";
import GreyPage from "@/app/grey-structure-cost/page";
import OverseasPage from "@/app/overseas-pakistanis/page";
import AboutPage from "@/app/about/page";
import PrivacyPage from "@/app/privacy/page";
import CostPageView from "@/components/CostPages";
import { COST_BASE, parseCostSlug } from "@/lib/seo";

const PAGES: Record<string, () => React.ReactNode> = {
  "/": Home,
  "/calculator/": CalculatorPage,
  "/rates/": RatesPage,
  "/how-it-works/": HowItWorks,
  [`${COST_BASE}/`]: CostHubPage,
  "/grey-structure-cost/": GreyPage,
  "/overseas-pakistanis/": OverseasPage,
  "/about/": AboutPage,
  "/privacy/": PrivacyPage,
};

// Size and city pages, e.g. /house-construction-cost/10-marla-lahore/.
function resolve(path: string): () => React.ReactNode {
  if (PAGES[path]) return PAGES[path];
  if (path.startsWith(`${COST_BASE}/`)) {
    const page = parseCostSlug(path.slice(COST_BASE.length + 1).replace(/\/$/, ""));
    if (page) return () => <CostPageView page={page} />;
  }
  return Home;
}

function App() {
  const r = useSyncExternalStore(subscribe, getRoute);
  const Page = resolve(r.path);
  return (
    <>
      <Header />
      <main id="main" key={r.path + "?" + r.query}>
        <Page />
      </main>
      <Footer />
    </>
  );
}

// Open a named view from the artifact link, e.g. #calculator or #rates.
const start = window.location.hash.replace("#", "");
if (start) navigate(`/${start.replace(/^\/|\/$/g, "")}/`);
createRoot(document.getElementById("root")!).render(<App />);
