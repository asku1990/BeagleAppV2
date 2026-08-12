import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Azure deploys the traced standalone server; include workspace packages above apps/web.
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  outputFileTracingIncludes: {
    "/api/trials/[trialEntryId]/pdf": ["./public/templates/*.pdf"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.tietokanta.beaglejarjesto.fi",
          },
        ],
        destination: "https://tietokanta.beaglejarjesto.fi/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.develop.tietokanta.beaglejarjesto.fi",
          },
        ],
        destination: "https://develop.tietokanta.beaglejarjesto.fi/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
