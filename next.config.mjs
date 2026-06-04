/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloud Run deploys a single container. `standalone` produces a
  // self-contained .next/standalone folder with only what's needed to
  // run, shaving ~70% off the image size and cold-start time.
  output: "standalone",

  images: {
    unoptimized: true,
    remotePatterns: [
      // Legacy Shopify CDN URLs — kept until every product is migrated.
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      // Cloudflare R2 direct (only used as a fallback if MEDIA_CDN_URL is unset)
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      // Custom CDN domain in front of the R2 bucket. We can't read
      // process.env at module evaluation reliably across both dev/build,
      // so we list both the apex and the www subdomain explicitly.
      {
        protocol: "https",
        hostname: "thedesignfactoryshop.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.thedesignfactoryshop.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.thedesignfactoryshop.com",
        pathname: "/**",
      },
    ],
  },
  // Disable Turbopack to avoid font loading issues
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
