import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Middleware clones request bodies; default ~10MB truncates uploads and breaks FormData parsing.
    proxyClientMaxBodySize: "110mb",
    serverActions: {
      bodySizeLimit: "110mb",
    },
    optimizePackageImports: ["react-icons", "lucide-react", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [384, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/projects/caritas-portal",
        destination: "/projects/caritas-systems",
        statusCode: 301,
      },
      {
        source: "/ventures",
        destination: "/about",
        statusCode: 301,
      },
      {
        source: "/ventures/:path*",
        destination: "/about",
        statusCode: 301,
      },
      {
        source: "/speaking",
        destination: "/#speaking",
        statusCode: 301,
      },
      {
        source: "/speaking/:path*",
        destination: "/#speaking",
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/dashboard",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/dashboard/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/feed.xml",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
    ];
  },
};

export default nextConfig;
