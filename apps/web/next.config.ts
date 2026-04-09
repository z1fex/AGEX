import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@agency/shared", "@agency/execution-engine", "@agency/vault-engine"],
};

export default nextConfig;
