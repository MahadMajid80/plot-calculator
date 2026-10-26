# Plot.pk construction cost calculator

Next.js 16 + React 19 + Tailwind 4 website that estimates the cost to build a home, apartment building, office or commercial building in Pakistan (PKR), from grey structure to finishing.

## Deploy to Vercel

The site is a static Next.js export with security headers in `vercel.json`. Nothing else needs configuring: no environment variables, database or API keys.

1. Unzip, then push the folder to a new GitHub repository:
   ```bash
   git init && git add . && git commit -m "Plot.pk website"
   git branch -M main
   git remote add origin https://github.com/<you>/plotpk.git
   git push -u origin main
   ```
2. In Vercel, choose **Add New → Project**, import the repository and press **Deploy**. Vercel picks up the settings from `vercel.json` (framework Next.js, `npm ci`, `npm run build`, Node 20.9 or newer).
3. Under **Settings → Domains**, add `plot.pk` (and `www.plot.pk` redirecting to it).
4. If the live domain is not `https://plot.pk`, change `SITE.url` in `src/lib/site.ts` and redeploy. Canonical links, the sitemap and share cards all use it.
5. Submit `https://<domain>/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

Optional CLI route instead of GitHub: `npm i -g vercel && vercel --prod` from the project folder.

## Run locally

Needs Node 20.9 or newer (`.nvmrc` pins 22).

```bash
npm ci
npm run dev      # http://localhost:3000
npm run build    # static site in ./out (also works on Netlify or cPanel public_html)
npm start        # serve ./out locally after a build
```

## Where things live

| File | What it holds |
|---|---|
| `src/lib/rates.ts` | Every rate in one file: item choices (specs) with Basic/Standard/Premium/Luxury defaults, optional items, city factors, room suggestions. Update rates here. |
| `src/lib/calculate.ts` | The cost engine (covered area + rooms → quantities → 100+ line items → fees → payment plan, plus the quality comparison). |
| `src/lib/share.ts` | Saves an estimate in the URL so it can be shared. |
| `src/lib/site.ts` | Site name, URL, "rates last reviewed" date, currency rates for overseas visitors (`FX`) and the `pageMeta` helper for titles, canonicals and share cards. **Update `ratesUpdated` and `FX` together each month.** |
| `src/lib/seo.ts`, `src/lib/sizes.ts` | Plot sizes and cities behind the 90 landing pages, plus structured data (FAQ, breadcrumbs, article). |
| `src/components/Calculator.tsx` | The 15-step dark calculator card (project, rooms, grey structure, flooring & tiles, marble, doors, windows, kitchen, washrooms, electrical & fans, ACs, paint & ceilings, woodwork, appliances, extras/land/fees). |
| `src/components/ResultPanel.tsx` | Live estimate beside the steps. |
| `src/components/Breakdown.tsx` | Summary, quality comparison, quantities, filterable/editable bill of quantities, payment plan. |
| `src/components/Section.tsx` | Light page sections (numbered eyebrow, big headline with blue accent line). |
| `src/app/` | Pages: home, calculator, house-construction-cost (hub + 90 size/city pages), grey-structure-cost, overseas-pakistanis, rates, how-it-works, about, privacy, plus sitemap, robots and manifest. |
| `src/components/CostPages.tsx` | Layout and copy for the size/city landing pages. |
| `src/components/OverseasCalc.tsx` | Cost in USD, GBP, AED, SAR and 6 more currencies. |
| `vercel.json`, `public/_headers`, `public/.htaccess` | Security headers (CSP, HSTS, frame blocking) and caching for Vercel, Netlify/Cloudflare and cPanel. |
| `scripts/og/` | Re-renders the share image and icons with Playwright. |

Only the homepage animates (framer-motion with a 3.5 s CSS failsafe, Lenis smooth scroll). Inner pages render fully from static HTML.

## SEO checklist after launch

1. Set the real domain in `src/lib/site.ts` (`SITE.url`) if it isn't `https://plot.pk`.
2. Add the site to Google Search Console and Bing Webmaster Tools and submit `/sitemap.xml`.
3. Refresh `ratesUpdated` and `FX` monthly; every page and title picks up the new date.
