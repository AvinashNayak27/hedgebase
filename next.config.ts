import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "www.avantisfi.com", pathname: "/images/pairs/equities/**" }],
  },
};

export default nextConfig;
