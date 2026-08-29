import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import PrivacyPage from "../page";

describe("privacy page", () => {
  it("describes the current controller, data flow, and privacy boundaries", () => {
    const html = renderToStaticMarkup(<PrivacyPage />);

    expect(html).toContain("Y-tunnus: 1742495-0");
    expect(html).toContain("tietosuoja@beaglejarjesto.fi");
    expect(html).toContain("Suomen Kennelliitolta");
    expect(html).toContain("Koiratietokanta.fi-palvelun");
    expect(html).toContain("Microsoft Azure");
    expect(html).toContain("Julkiset ja rajatut tiedot");
    expect(html).toContain("Tietosuojavaltuutetun toimistolle");
    expect(html).toContain("https://www.beaglejarjesto.fi/tietosuojaseloste/");
  });

  it("does not contain obsolete or incomplete privacy details", () => {
    const html = renderToStaticMarkup(<PrivacyPage />);

    expect(html).not.toContain("[täydennä]");
    expect(html).not.toContain("jasenrekisteri@beaglejarjesto.fi");
    expect(html).not.toContain("Kannistontie 21");
    expect(html).not.toContain("Vercel (hosting)");
    expect(html).not.toContain("analytiikkasuostumus");
  });
});
