import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminDogProfilePage } from "../admin-dog-profile-page";

vi.mock("@/components/listing", () => ({
  ListingSectionShell: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => React.createElement("section", null, [title, children]),
}));

describe("AdminDogProfilePage", () => {
  it("renders the v1 basics with epi placeholders", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminDogProfilePage, {
        dog: {
          id: "dog-1",
          name: "JALLU",
          registrationNo: "FIN28284/01",
          registrationNos: ["FIN28284/01"],
          birthDate: "2001-05-25",
          sex: "MALE",
          color: null,
          ekNo: null,
          offspringCount: 0,
          offspringLitterCount: 0,
          inbreedingCoefficientPct: 3.0724,
          epiLuku: null,
          laforaLuku: null,
          epiRiskLuku: null,
          healthSummary: "Epilepsia",
          diseases: [],
          sire: {
            id: "sire-1",
            name: "JUHANNIN ROOPE",
            registrationNo: "FIN21285/96",
            ekNo: null,
          },
          dam: {
            id: "dam-1",
            name: "HUPI",
            registrationNo: "FIN31655/98",
            ekNo: null,
          },
          owners: [
            {
              name: "Hurskainen Jaakko",
              postalCode: "82900",
              city: "Ilomantsi",
            },
          ],
          breeder: {
            name: "Karppi Raija",
            ownerName: null,
            city: "Maukkula",
            detailsSource: null,
          },
          breederNameText: null,
          note: null,
        },
      }),
    );

    expect(html).toContain("JALLU");
    expect(html).toContain("FIN28284/01 ()");
    expect(html).toContain("Uros");
    expect(html).toContain("25.5.2001");
    expect(html).toContain("Vanhemmat");
    expect(html).toContain("Väri");
    expect(html).toContain("Jälkeläisiä(EK)[2p]");
    expect(html).toContain("3.0724 %");
    expect(html).toContain("PERUSTIEDOT");
    expect(html).toContain("TERVEYSTIEDOT");
    expect(html).toContain("Terveystiedot");
    expect(html).toContain("Epilepsia");
    expect(html).toContain("JUHANNIN ROOPE");
    expect(html).toContain("HUPI");
    expect(html).toContain("Hurskainen Jaakko");
    expect(html).toContain("82900 Ilomantsi");
    expect(html).toContain("Karppi Raija");
    expect(html).toContain("Maukkula");
  });

  it("shows breeder text fallback with warning tooltip when breeder link is missing", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminDogProfilePage, {
        dog: {
          id: "dog-2",
          name: "TAVAJS BARR",
          registrationNo: "SE12345/01",
          registrationNos: ["SE12345/01"],
          birthDate: "2001-05-25",
          sex: "MALE",
          color: null,
          ekNo: null,
          offspringCount: 0,
          offspringLitterCount: 0,
          inbreedingCoefficientPct: null,
          epiLuku: null,
          laforaLuku: null,
          epiRiskLuku: null,
          healthSummary: null,
          diseases: [],
          sire: null,
          dam: null,
          owners: [],
          breeder: null,
          breederNameText: "ROLIN CHRISTINA",
          note: null,
        },
      }),
    );

    expect(html).toContain("ROLIN CHRISTINA");
    expect(html).toContain(
      "Kasvattaja tulee koirataulusta suoraan eik\u00E4 ole linkitetty kasvattaja tauluun",
    );
  });
});
