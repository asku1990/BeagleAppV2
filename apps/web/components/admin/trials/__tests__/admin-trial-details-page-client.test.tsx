import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminTrialDetailsPageClient } from "../admin-trial-details-page-client";

const { useAdminTrialQueryMock } = vi.hoisted(() => ({
  useAdminTrialQueryMock: vi.fn(),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) =>
    asChild
      ? React.createElement(React.Fragment, null, children)
      : React.createElement(
          "button",
          props as Record<string, string>,
          children,
        ),
}));

vi.mock("@/queries/admin/trials", () => ({
  useAdminTrialQuery: useAdminTrialQueryMock,
  isAdminTrialQueryError: (error: unknown) =>
    Boolean(
      error &&
      typeof error === "object" &&
      "errorCode" in error &&
      typeof (error as { errorCode?: unknown }).errorCode === "string",
    ),
}));

vi.mock("@/lib/admin/core/date", () => ({
  formatDateForFinland: (value: string | null | undefined) => value ?? "-",
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => React.createElement("hr"),
}));

vi.mock("@/components/listing", () => ({
  ListingSectionShell: ({
    title,
    subtitle,
    children,
  }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    children: React.ReactNode;
  }) => React.createElement("section", null, title, subtitle, children),
}));

describe("AdminTrialDetailsPageClient", () => {
  beforeEach(() => {
    useAdminTrialQueryMock.mockReset();
    vi.stubEnv("NODE_ENV", "test");
    useAdminTrialQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders invalid state for empty trial id", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialDetailsPageClient, { trialId: "   " }),
    );

    expect(html).toContain("admin.trials.detail.state.invalid");
  });

  it("renders loading state", () => {
    useAdminTrialQueryMock.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialDetailsPageClient, { trialId: "trial-1" }),
    );

    expect(html).toContain("admin.trials.detail.state.loading");
  });

  it("renders not found state when query returns TRIAL_NOT_FOUND error", () => {
    useAdminTrialQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: {
        message: "Trial not found.",
        errorCode: "TRIAL_NOT_FOUND",
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialDetailsPageClient, {
        trialId: "trial-404",
      }),
    );

    expect(html).toContain("admin.trials.detail.state.notFound");
    expect(html).not.toContain("Trial not found.");
  });

  it("renders grouped detail fields and raw fallback", () => {
    useAdminTrialQueryMock.mockReturnValue({
      data: {
        trial: {
          trialId: "trial-1",
          dogId: null,
          dogName: "Rex",
          registrationNo: "FI12345/21",
          sklKoeId: 54321,
          entryKey: "entry-1",
          eventDate: "2026-04-14",
          eventName: "Kevätkoe",
          eventPlace: "Helsinki",
          rotukoodi: "161/1",
          jarjestaja: "Kevätkoe",
          koemuoto: "AJOK",
          kennelDistrict: null,
          kennelDistrictNo: "01",
          ylituomariNumero: "123",
          keli: "KE",
          luokka: "A",
          koiriaLuokassa: 10,
          palkinto: "VOI1",
          loppupisteet: 88.5,
          sijoitus: "2",
          era1Alkoi: "08:10",
          era2Alkoi: "11:20",
          hakuMin1: 20,
          hakuMin2: 18,
          ajoMin1: 40,
          ajoMin2: 35,
          hyvaksytytAjominuutit: 75,
          ajoajanPisteet: 7,
          ansiopisteetYhteensa: 80,
          hakuKeskiarvo: 12,
          haukkuKeskiarvo: 10.5,
          ajotaitoKeskiarvo: 9.5,
          yleisvaikutelmaPisteet: 9,
          hakuloysyysTappioYhteensa: 1,
          ajoloysyysTappioYhteensa: 2,
          tappiopisteetYhteensa: 3,
          tieJaEstetyoskentelyPisteet: 3,
          metsastysintoPisteet: 4,
          ylituomariNimi: "Judge One",
          ryhmatuomariNimi: "Group Judge",
          palkintotuomariNimi: "Prize Judge",
          isanNimi: "Sire",
          isanRekisterinumero: "FI0001/20",
          emanNimi: "Dam",
          emanRekisterinumero: "FI0002/19",
          omistaja: "Owner",
          omistajanKotikunta: "Helsinki",
          sukupuoli: "U",
          rokotusOk: true,
          tunnistusOk: true,
          luopui: false,
          suljettu: false,
          keskeytetty: false,
          huomautusTeksti: null,
          lisatiedot: [
            {
              koodi: "11",
              nimi: "Paljas maa",
              era1Arvo: null,
              era2Arvo: null,
              era3Arvo: null,
              era4Arvo: null,
              jarjestys: 11,
            },
          ],
          notes: "L",
          rawPayloadJson: '{"source":"raw"}',
          createdAt: "2026-04-14T10:00:00.000Z",
          updatedAt: "2026-04-14T10:30:00.000Z",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialDetailsPageClient, { trialId: "trial-1" }),
    );

    expect(html).toContain("admin.trials.detail.title");
    expect(html).toContain("admin.trials.detail.section.title");
    expect(html).toContain("admin.trials.detail.sections.trialInfo");
    expect(html).toContain("admin.trials.detail.sections.dogInfo");
    expect(html).toContain("admin.trials.detail.sections.resultSummary");
    expect(html).toContain("admin.trials.detail.sections.scoreBreakdown");
    expect(html).toContain("admin.trials.detail.sections.metadata");
    expect(html).toContain("admin.trials.detail.sections.raw");
    expect(html).toContain("admin.trials.validation.title");
    expect(html).toContain("admin.trials.validation.sections.missing");
    expect(html).toContain("admin.trials.validation.sections.incomplete");
    expect(html).toContain("admin.trials.detail.fields.sklKoeId");
    expect(html).toContain("admin.trials.detail.fields.entryKey");
    expect(html).toContain("kennelpiiri");
    expect(html).toContain("Rex");
    expect(html).toContain("54321");
    expect(html).toContain("entry-1");
    expect(html).toContain("source");
    expect(html).not.toContain("/api/trials/trial-1/pdf");
  });

  it("shows the dev-only pdf link in development", () => {
    vi.stubEnv("NODE_ENV", "development");

    useAdminTrialQueryMock.mockReturnValue({
      data: {
        trial: {
          trialId: "trial-1",
          dogId: null,
          dogName: "Rex",
          registrationNo: "FI12345/21",
          sklKoeId: 54321,
          entryKey: "entry-1",
          eventDate: "2026-04-14",
          eventName: "Kevätkoe",
          eventPlace: "Helsinki",
          rotukoodi: "161/1",
          jarjestaja: "Kevätkoe",
          koemuoto: "AJOK",
          kennelDistrict: null,
          kennelDistrictNo: "01",
          ylituomariNumero: "123",
          keli: "KE",
          luokka: "A",
          koiriaLuokassa: 10,
          palkinto: "VOI1",
          loppupisteet: 88.5,
          sijoitus: "2",
          era1Alkoi: "08:10",
          era2Alkoi: "11:20",
          hakuMin1: 20,
          hakuMin2: 18,
          ajoMin1: 40,
          ajoMin2: 35,
          hyvaksytytAjominuutit: 75,
          ajoajanPisteet: 7,
          ansiopisteetYhteensa: 80,
          hakuKeskiarvo: 12,
          haukkuKeskiarvo: 10.5,
          ajotaitoKeskiarvo: 9.5,
          yleisvaikutelmaPisteet: 9,
          hakuloysyysTappioYhteensa: 1,
          ajoloysyysTappioYhteensa: 2,
          tappiopisteetYhteensa: 3,
          tieJaEstetyoskentelyPisteet: 3,
          metsastysintoPisteet: 4,
          ylituomariNimi: "Judge One",
          ryhmatuomariNimi: "Group Judge",
          palkintotuomariNimi: "Prize Judge",
          isanNimi: "Sire",
          isanRekisterinumero: "FI0001/20",
          emanNimi: "Dam",
          emanRekisterinumero: "FI0002/19",
          omistaja: "Owner",
          omistajanKotikunta: "Helsinki",
          sukupuoli: "U",
          rokotusOk: true,
          tunnistusOk: true,
          luopui: false,
          suljettu: false,
          keskeytetty: false,
          huomautusTeksti: null,
          lisatiedot: [],
          notes: "L",
          rawPayloadJson: '{"source":"raw"}',
          createdAt: "2026-04-14T10:00:00.000Z",
          updatedAt: "2026-04-14T10:30:00.000Z",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialDetailsPageClient, { trialId: "trial-1" }),
    );

    expect(html).toContain('href="/api/trials/trial-1/pdf"');
    expect(html).toContain("admin.trials.detail.pdf.open");
  });
});
