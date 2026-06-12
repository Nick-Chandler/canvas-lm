import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [{ source: '/canvas', destination: '/', permanent: true }];
  },
};

export default nextConfig;
