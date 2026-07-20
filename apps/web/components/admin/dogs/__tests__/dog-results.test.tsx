import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogResults } from "../dog-results";
import type { AdminDogRecord } from "../types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, ...props }, children),
}));

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
    status: "NORMAL",
    registrationNo: "FI12345/21",
    secondaryRegistrationNos: [],
    name: "Metsapolun Kide",
    sex: "FEMALE",
    birthDate: "2021-04-09",
    breederNameText: "Hidden Breeder",
    trialCount: 2,
    showCount: 1,
    titlesText: "FI JVA, SE JCH",
    ownershipPreview: ["Tiina Virtanen"],
    ekNo: 5588,
    ekNoAssignedOn: null,
    colorCode: 121,
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
    expect(html).toContain("admin.dogs.columns.status");
    expect(html).toContain("admin.dogs.status.normal");
    expect(html).toContain("admin.dogs.mobile.statusLabel");
    expect(html).not.toContain("admin.dogs.columns.breeder");
    expect(html).not.toContain("admin.dogs.mobile.breederLabel");
    expect(html).not.toContain("Hidden Breeder");
    expect(html).toContain("FI JVA, SE JCH");
    expect(html).toContain("admin.dogs.mobile.titlesLabel");
    expect(html).toContain('href="/admin/dogs/dog_1/profile"');
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

  it("shows the reference-only status label", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogResults, {
        dogs: [buildDog({ status: "REFERENCE_ONLY" })],
        onEdit: vi.fn(),
        onDelete: vi.fn(),
      }),
    );

    expect(html).toContain("admin.dogs.status.referenceOnly");
  });
});
