/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
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
