import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "pub-51048733eaa64d01adfa44b607b28a12.r2.dev",
      },
    ],
  },
  // Rewrite everything from /api/* to the backend running on port 8000
  // This solves ALL CORS and cross-origin persistent HttpOnly Cookie issues (like Refresh Token)
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
