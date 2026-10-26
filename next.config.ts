import type { NextConfig } from "next";

// Static export so the site can be hosted anywhere (Vercel, cPanel, Netlify).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  // Security headers can't be set here for a static export; they live in
  // vercel.json (Vercel), public/_headers (Netlify, Cloudflare) and public/.htaccess (cPanel).
};

export default nextConfig;
