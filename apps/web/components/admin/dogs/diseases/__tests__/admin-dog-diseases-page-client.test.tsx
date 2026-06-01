import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminDogDiseaseBrowseResponse } from "@beagle/contracts";
import { AdminDogDiseasesPageClient } from "../admin-dog-diseases-page-client";

const { useAdminDogDiseasesQueryMock } = vi.hoisted(() => ({
  useAdminDogDiseasesQueryMock: vi.fn(),
}));

const { useAdminDogDiseasesUiStateMock } = vi.hoisted(() => ({
  useAdminDogDiseasesUiStateMock: vi.fn(),
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
}));

vi.mock("@/hooks/admin/dogs/diseases", () => ({
  useAdminDogDiseasesUiState: useAdminDogDiseasesUiStateMock,
}));

function buildInitialData(): AdminDogDiseaseBrowseResponse {
  return {
    selectedDiseaseCode: "epi",
    total: 174,
    totalPages: 12,
    page: 1,
    diseaseOptions: [
      { diseaseCode: "epi", diseaseText: "Epilepsia", count: 174 },
      { diseaseCode: "pur", diseaseText: "Purema", count: 8 },
    ],
    items: [
      {
        id: "row-1",
        evidenceKind: "DOG",
        diseaseCode: "epi",
        diseaseText: "Epilepsia",
        public: true,
        registrationNo: "FI12345/21",
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
        public: false,
        registrationNo: "EPI_1/94",
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
    useAdminDogDiseasesUiStateMock.mockReset();
  });

  it("renders the default disease browse table and mobile cards", () => {
    useAdminDogDiseasesUiStateMock.mockReturnValue({
      diseaseCode: "epi",
      page: 1,
      isPending: false,
      setDiseaseCode: vi.fn(),
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

    expect(html).toContain("Sairaustiedot");
    expect(html).toContain("Haulla löytyi 174 beaglea.");
    expect(html).toContain("Kaikki");
    expect(html).toContain("Epilepsia 174 kpl");
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
  });

  it("renders loading, empty, and error states", () => {
    useAdminDogDiseasesUiStateMock.mockReturnValue({
      diseaseCode: "epi",
      page: 1,
      isPending: false,
      setDiseaseCode: vi.fn(),
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
      diseaseCode: "epi",
      page: 999,
      isPending: false,
      setDiseaseCode: vi.fn(),
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
