import type { NextConfig } from "next";

const config: NextConfig = {
  //start
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Company logos come from our object storage; add the host once storage is chosen.
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default config;
