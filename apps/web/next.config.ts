import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/trials/[trialEntryId]/pdf": ["./public/templates/*.pdf"],
  },
};

export default nextConfig;
