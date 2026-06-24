import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AdminDogProfileDto } from "@beagle/contracts";
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
  function buildDog(
    overrides?: Partial<AdminDogProfileDto>,
  ): AdminDogProfileDto {
    return {
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
      epiLuku: 0.375,
      epiTeksti: "-----",
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
      ...overrides,
    };
  }

  it("renders the v1 basics with computed EPI text", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminDogProfilePage, {
        dog: buildDog(),
      }),
    );

    expect(html).toContain("JALLU");
    expect(html).toContain("FIN28284/01 ()");
    expect(html).toContain("Uros");
    expect(html).toContain("25.5.2001");
    expect(html).toContain("Vanhemmat");
    expect(html).toContain("Väri");
    expect(html).not.toContain("Tulossa");
    expect(html).toContain("Jälkeläisiä(EK)[2p]");
    expect(html).toContain("3.0724 %");
    expect(html).toContain("0.3750 -----");
    expect(html).toContain("PERUSTIEDOT");
    expect(html).toContain("TERVEYSTIEDOT");
    expect(html).toContain("Terveystiedot");
    expect(html).toContain("Epilepsia");
    expect(html).toContain("JUHANNIN ROOPE");
    expect(html).toContain("HUPI");
    expect(html).toContain("Hurskainen Jaakko");
    expect(html).toContain("82900 Ilomantsi");
    expect(html).not.toContain("Kennel");
    expect(html).not.toContain("Karppi Raija");
    expect(html).not.toContain("Maukkula");
    expect(html).toContain('data-epi-flag="green"');
    expect(html).toContain("=&gt; Vihreä(1)");
    expect(html).toContain("- Vihreä(1) jos Epi &lt; 1.0");
    expect(html).toContain("( 1 )");
  });

  it("shows yellow EPI flag and tooltip when epiLuku is between 1.0 and 1.5", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminDogProfilePage, {
        dog: buildDog({
          epiLuku: 1.25,
          epiTeksti: "I----",
        }),
      }),
    );

    expect(html).toContain("1.2500 I----");
    expect(html).toContain('data-epi-flag="yellow"');
    expect(html).toContain("=&gt; Keltainen(2)");
    expect(html).toContain("( 2 )");
  });

  it("shows red EPI flag and tooltip when epiLuku is over 1.5", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminDogProfilePage, {
        dog: buildDog({
          epiLuku: 1.5625,
          epiTeksti: "I----",
        }),
      }),
    );

    expect(html).toContain("1.5625 I----");
    expect(html).toContain('data-epi-flag="red"');
    expect(html).toContain("=&gt; Punainen(3)");
    expect(html).toContain("( 3 )");
  });

  it("hides breeder fallback text when breeder link is missing", () => {
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
          epiTeksti: null,
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

    expect(html).not.toContain("ROLIN CHRISTINA");
    expect(html).not.toContain("Kasvattaja tulee koirataulusta");
    expect(html).not.toContain("data-epi-flag=");
  });
});
