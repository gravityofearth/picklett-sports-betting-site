import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://s2.coinmarketcap.com/**"),
    ],
  },
};

export default nextConfig;
