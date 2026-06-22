import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DeleteDogConfirmModal } from "../delete-dog-confirm-modal";
import type { AdminDogRecord } from "../types";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

function buildDog(): AdminDogRecord {
  return {
    id: "dog_1",
    registrationNo: "FI12345/21",
    secondaryRegistrationNos: [],
    name: "Metsapolun Kide",
    sex: "FEMALE",
    birthDate: "2021-04-09",
    breederNameText: null,
    ownershipPreview: [],
    sirePreview: null,
    damPreview: null,
    trialCount: 0,
    showCount: 0,
    titlesText: null,
    ekNo: null,
    note: null,
    titles: [],
  };
}

describe("DeleteDogConfirmModal", () => {
  it("renders backend delete impact counts and orphan warnings", () => {
    const html = renderToStaticMarkup(
      React.createElement(DeleteDogConfirmModal, {
        dog: buildDog(),
        impact: {
          dogId: "dog_1",
          deleted: {
            registrations: 1,
            ownerships: 2,
            titles: 3,
            legacyTrialResults: 4,
          },
          detached: {
            canonicalTrialEntries: 5,
            showEntries: 6,
            diseaseRows: 7,
            sireReferences: 8,
            damReferences: 9,
          },
          orphanWarnings: {
            owners: [{ id: "owner_1", name: "Tiina Virtanen" }],
            breeder: { id: "breeder_1", name: "Metsapolun" },
          },
        },
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      }),
    );

    expect(html).toContain("admin.dogs.delete.impact.deletedTitle");
    expect(html).toContain("<strong>1</strong>");
    expect(html).toContain("admin.dogs.delete.impact.detachedTitle");
    expect(html).toContain("<strong>9</strong>");
    expect(html).toContain("Tiina Virtanen");
    expect(html).toContain("Metsapolun");
  });

  it("renders fallback message when impact fetch fails", () => {
    const html = renderToStaticMarkup(
      React.createElement(DeleteDogConfirmModal, {
        dog: buildDog(),
        isImpactError: true,
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
      }),
    );

    expect(html).toContain("admin.dogs.delete.impact.error");
  });
});
