import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://media.licdn.com/**"),
      new URL("https://static.licdn.com/**"),
    ],
  },
};

export default nextConfig;