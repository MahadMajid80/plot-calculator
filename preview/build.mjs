// Builds a single self-contained HTML file for a claude.ai Artifact preview.
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = process.argv[2] ?? path.join(root, "preview", "plotpk-preview.html");

const cssIn = readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const css = (await postcss([tailwind({ base: root })]).process(cssIn, { from: path.join(root, "src/app/globals.css") })).css;

const js = await build({
  entryPoints: [path.join(root, "preview/entry.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  jsx: "automatic",
  alias: {
    "@": path.join(root, "src"),
    "next/link": path.join(root, "preview/shims/link.tsx"),
    "next/navigation": path.join(root, "preview/shims/navigation.ts"),
  },
  define: { "process.env.NEXT_PUBLIC_PREVIEW": '"1"', "process.env.NODE_ENV": '"production"' },
  loader: { ".css": "empty" },
});

const html = `<title>Plot.pk Cost Calculator</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
<style>:root{--font-jakarta:"Plus Jakarta Sans";color-scheme:light}${css}
body{background:#f5f6fa;color:#14172b;font-family:"Plus Jakarta Sans",ui-sans-serif,system-ui,sans-serif;font-size:16px}</style>
<div id="root"></div>
<script>${js.outputFiles[0].text.replace(/<\/script/g, "<\\/script")}</script>
`;
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
