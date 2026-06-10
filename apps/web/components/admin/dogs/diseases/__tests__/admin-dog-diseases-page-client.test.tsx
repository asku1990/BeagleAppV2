import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminDogDiseaseBrowseResponse } from "@beagle/contracts";
import { messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/types";
import { AdminDogDiseasesPageClient } from "../admin-dog-diseases-page-client";

const {
  useAdminDogDiseasesQueryMock,
  useCreateAdminDogDiseaseMutationMock,
  useDeleteAdminDogDiseaseMutationMock,
} = vi.hoisted(() => ({
  useAdminDogDiseasesQueryMock: vi.fn(),
  useCreateAdminDogDiseaseMutationMock: vi.fn(),
  useDeleteAdminDogDiseaseMutationMock: vi.fn(),
}));

const { useAdminDogDiseasesUiStateMock } = vi.hoisted(() => ({
  useAdminDogDiseasesUiStateMock: vi.fn(),
}));

const { localeState } = vi.hoisted(() => ({
  localeState: {
    current: "fi" as Locale,
  },
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

vi.mock("@/queries/admin/dogs", () => ({
  useAdminDogDiseasesQuery: useAdminDogDiseasesQueryMock,
  useCreateAdminDogDiseaseMutation: useCreateAdminDogDiseaseMutationMock,
  useDeleteAdminDogDiseaseMutation: useDeleteAdminDogDiseaseMutationMock,
}));

vi.mock("@/hooks/admin/dogs/diseases", () => ({
  useAdminDogDiseasesUiState: useAdminDogDiseasesUiStateMock,
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    locale: localeState.current,
    setLocale: vi.fn(),
    t: (key: keyof (typeof messages)["fi"]) =>
      messages[localeState.current][key],
  }),
}));

function buildInitialData(): AdminDogDiseaseBrowseResponse {
  return {
    selectedDiseaseCode: "epi",
    query: "",
    total: 174,
    totalPages: 12,
    page: 1,
    diseaseOptions: [
      { diseaseCode: "epi", diseaseText: "Epilepsia", count: 174 },
      { diseaseCode: "pur", diseaseText: "Purenta", count: 8 },
    ],
    items: [
      {
        id: "row-1",
        evidenceKind: "DOG",
        diseaseCode: "epi",
        diseaseText: "Epilepsia",
        pentue: "PENTUE-1",
        kuvaus: "Kuvaus koiralle",
        public: true,
        registrationNo: "FI12345/21",
        tietolahde: "Lomake",
        ekNo: 5588,
        sex: "FEMALE",
        name: "Metsapolun Kide",
        dogId: "dog-1",
        trialCount: 7,
        showCount: 4,
        sire: {
          registrationNo: "FI54321/20",
          name: "Korven Aatos",
        },
        dam: {
          registrationNo: "FI77777/18",
          name: "Havupolun Helmi",
        },
      },
      {
        id: "row-2",
        evidenceKind: "LITTER",
        diseaseCode: "epi",
        diseaseText: "Epilepsia",
        pentue: null,
        kuvaus: "",
        public: false,
        registrationNo: "EPI_1/94",
        tietolahde: null,
        ekNo: null,
        sex: null,
        name: "Nimi ei ole tiedossa",
        dogId: null,
        trialCount: null,
        showCount: null,
        sire: {
          registrationNo: "SF14404/90",
          name: "Isäkoira",
        },
        dam: {
          registrationNo: "SF19531/89",
          name: "Emäkoira",
        },
      },
    ],
  };
}

describe("AdminDogDiseasesPageClient", () => {
  beforeEach(() => {
    useAdminDogDiseasesQueryMock.mockReset();
    useCreateAdminDogDiseaseMutationMock.mockReset();
    useDeleteAdminDogDiseaseMutationMock.mockReset();
    useAdminDogDiseasesUiStateMock.mockReset();
    localeState.current = "fi";
    useCreateAdminDogDiseaseMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useDeleteAdminDogDiseaseMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
  });

  it("renders localized Finnish disease browser text", () => {
    useAdminDogDiseasesUiStateMock.mockReturnValue({
      diseaseCode: "epi",
      query: "",
      page: 1,
      isPending: false,
      submitSearch: vi.fn(),
      setPage: vi.fn(),
    });
    useAdminDogDiseasesQueryMock.mockReturnValue({
      data: buildInitialData(),
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminDogDiseasesPageClient, {
        initialData: buildInitialData(),
      }),
    );

    expect(html).toContain("BEAGLEHAKU sairaustiedoilla");
    expect(html).toContain("Sairaustiedot");
    expect(html).toContain("Haulla löytyi 174 sairausriviä.");
    expect(html).toContain("Kaikki 182 kpl");
    expect(html).toContain("Epilepsia 174 kpl");
    expect(html).toContain("Nimi tai rekisterinumero");
    expect(html).toContain("Hae");
    expect(html).toContain("TERVEYSTIETO");
    expect(html).toContain("TYYPPI");
    expect(html).toContain("Lisää sairaustieto");
    expect(html).toContain("Sairaustiedon toiminnot");
    expect(html).toContain("JULKINEN");
    expect(html).toContain("LISÄTIEDOT");
    expect(html).toContain("Koira");
    expect(html).toContain("Pentue");
    expect(html).toContain("Lisätiedot");
    expect(html).toContain("Tietolähde");
    expect(html).toContain("PENTUE-1");
    expect(html).toContain("Kuvaus koiralle");
    expect(html).toContain("Lomake");
    expect(html).toContain("Pentue:</span> -");
    expect(html).toContain("Lisätiedot:</span> -");
    expect(html).toContain("Tietolähde:</span> -");
    expect(html).toContain("FI12345/21 / EK 5588");
    expect(html).toContain("/admin/dogs/dog-1/profile");
    expect(html).toContain("EPI_1/94 / -");
    expect(html).toContain("Nimi ei ole tiedossa");
    expect(html).toContain(
      "I: Korven Aatos (FI54321/20) | E: Havupolun Helmi (FI77777/18)",
    );
    expect(html).toContain(
      "I: Isäkoira (SF14404/90) | E: Emäkoira (SF19531/89)",
    );
    expect(html).toContain("Edelliset");
    expect(html).toContain("Seuraavat");
    expect(useAdminDogDiseasesQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        diseaseCode: "epi",
        query: "",
        page: 1,
      }),
    );
  });

  it("renders localized Swedish disease browser text", () => {
    localeState.current = "sv";
    useAdminDogDiseasesUiStateMock.mockReturnValue({
      diseaseCode: "epi",
      query: "",
      page: 1,
      isPending: false,
      submitSearch: vi.fn(),
      setPage: vi.fn(),
    });
    useAdminDogDiseasesQueryMock.mockReturnValue({
      data: buildInitialData(),
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminDogDiseasesPageClient, {
        initialData: buildInitialData(),
      }),
    );

    expect(html).toContain("BEAGLESÖK med sjukdomsuppgifter");
    expect(html).toContain("Sjukdomsuppgifter");
    expect(html).toContain("Sökningen hittade 174 sjukdomsrader.");
    expect(html).toContain("Alla 182 st");
    expect(html).toContain("SJUKDOMSUPPGIFT");
    expect(html).toContain("TYP");
    expect(html).toContain("TILLÄGGSUPPGIFTER");
    expect(html).toContain("OFFENTLIG");
    expect(html).toContain("Namnet är okänt");
    expect(html).toContain("Föregående");
    expect(html).toContain("Nästa");
  });

  it("renders loading, empty, and error states", () => {
    useAdminDogDiseasesUiStateMock.mockReturnValue({
      diseaseCode: undefined,
      query: "",
      page: 1,
      isPending: false,
      submitSearch: vi.fn(),
      setPage: vi.fn(),
    });
    useAdminDogDiseasesQueryMock.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    const loadingHtml = renderToStaticMarkup(
      React.createElement(AdminDogDiseasesPageClient, {
        initialData: null,
      }),
    );
    expect(loadingHtml).toContain("Ladataan sairaustietoja...");

    useAdminDogDiseasesQueryMock.mockReturnValue({
      data: {
        ...buildInitialData(),
        total: 0,
        totalPages: 0,
        items: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const emptyHtml = renderToStaticMarkup(
      React.createElement(AdminDogDiseasesPageClient, {
        initialData: null,
      }),
    );
    expect(emptyHtml).toContain("Ei sairaustietoja valitulla rajauksella.");

    useAdminDogDiseasesQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error("Failed to load admin dog diseases."),
    });

    const errorHtml = renderToStaticMarkup(
      React.createElement(AdminDogDiseasesPageClient, {
        initialData: null,
      }),
    );
    expect(errorHtml).toContain("Failed to load admin dog diseases.");
  });

  it("uses the api-clamped page for pagination controls", () => {
    useAdminDogDiseasesUiStateMock.mockReturnValue({
      diseaseCode: undefined,
      query: "",
      page: 999,
      isPending: false,
      submitSearch: vi.fn(),
      setPage: vi.fn(),
    });
    useAdminDogDiseasesQueryMock.mockReturnValue({
      data: {
        ...buildInitialData(),
        page: 3,
        totalPages: 3,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminDogDiseasesPageClient, {
        initialData: null,
      }),
    );

    expect(html).toContain("Sivu 3 / 3");
    expect(html).not.toContain("Sivu 999 / 3");
  });
});
