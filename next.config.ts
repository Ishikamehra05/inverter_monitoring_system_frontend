import type { NextConfig } from "next";

const apiProxyTarget = process.env.API_PROXY_TARGET ?? "api.solarlogger.in";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
