import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Azure deploys the traced standalone server; include workspace packages above apps/web.
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  outputFileTracingIncludes: {
    "/api/trials/[trialEntryId]/pdf": ["./public/templates/*.pdf"],
  },
};

export default nextConfig;
