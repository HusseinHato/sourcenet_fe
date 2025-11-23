import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'http://103.150.196.240:3001/:path*',
      },
    ];
  },
};

export default nextConfig;
