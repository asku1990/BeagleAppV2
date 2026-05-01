import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/trials/[trialId]/pdf": ["./public/templates/*.pdf"],
  },
};

export default nextConfig;
