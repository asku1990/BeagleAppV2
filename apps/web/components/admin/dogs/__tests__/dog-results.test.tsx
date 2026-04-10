import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogResults } from "../dog-results";
import type { AdminDogRecord } from "../types";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    locale: "fi",
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/listing", () => ({
  ListingResponsiveResults: ({
    desktop,
    mobile,
  }: {
    desktop: React.ReactNode;
    mobile: React.ReactNode;
  }) => React.createElement("div", null, desktop, mobile),
}));

vi.mock("@/components/admin", () => ({
  AdminRowActionsMenu: () => React.createElement("div", null, "actions"),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

function buildDog(overrides: Partial<AdminDogRecord> = {}): AdminDogRecord {
  return {
    id: "dog_1",
    registrationNo: "FI12345/21",
    secondaryRegistrationNos: [],
    name: "Metsapolun Kide",
    sex: "FEMALE",
    birthDate: "2021-04-09",
    breederNameText: "Metsapolun",
    trialCount: 2,
    showCount: 1,
    titlesText: "FI JVA, SE JCH",
    ownershipPreview: ["Tiina Virtanen"],
    ekNo: 5588,
    note: "Important",
    sirePreview: { name: "Korven Aatos", registrationNo: "FI54321/20" },
    damPreview: { name: "Havupolun Helmi", registrationNo: "FI77777/18" },
    titles: [],
    ...overrides,
  };
}

describe("DogResults", () => {
  it("shows compact title code column and mobile field", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogResults, {
        dogs: [buildDog()],
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      }),
    );

    expect(html).toContain("admin.dogs.columns.titles");
    expect(html).toContain("FI JVA, SE JCH");
    expect(html).toContain("admin.dogs.mobile.titlesLabel");
  });

  it("shows dash when titlesText is missing", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogResults, {
        dogs: [buildDog({ titlesText: null })],
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      }),
    );

    expect(html).toContain("admin.dogs.mobile.titlesLabel: -");
  });
});
