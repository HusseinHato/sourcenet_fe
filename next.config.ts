import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api.pramadani.site/api/:path*',
      },
    ];
  },
};

export default nextConfig;
