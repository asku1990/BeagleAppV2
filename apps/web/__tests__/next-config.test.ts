import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("Next.js redirects", () => {
  it("permanently redirects the www hostname to the canonical hostname", async () => {
    expect(nextConfig.redirects).toBeTypeOf("function");

    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual([
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
    ]);
  });
});
