import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid Turbopack warning when another lockfile exists above this project path.
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
