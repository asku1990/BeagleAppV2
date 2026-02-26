import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogFormModal } from "../dog-form-modal";
import type { AdminDogFormValues, AdminDogRecord } from "../types";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h2", null, children),
}));

vi.mock("@/components/ui/combobox", () => ({
  Combobox: ({
    value,
    options,
  }: {
    value: string;
    options: Array<{ value: string; label: string }>;
  }) => {
    const selected = options.find((option) => option.value === value);
    return React.createElement("input", {
      value: selected?.label ?? "",
      readOnly: true,
    });
  },
}));

function buildEditValues(): AdminDogFormValues {
  return {
    name: "Metsapolun Kide",
    sex: "FEMALE",
    birthDate: "2021-04-09",
    breederNameText: "Metsapolun",
    ownershipNames: ["Tiina Virtanen", "Antti Virtanen"],
    ekNo: "5588",
    note: "Important note",
    registrationNo: "FI12345/21",
    secondaryRegistrationNos: ["FI54321/21"],
    sirePreviewName: "Korven Aatos",
    sirePreviewRegistrationNo: "FI54321/20",
    damPreviewName: "Havupolun Helmi",
    damPreviewRegistrationNo: "FI77777/18",
  };
}

function buildDog(values: AdminDogFormValues): AdminDogRecord {
  return {
    id: "dog_1",
    name: values.name,
    sex: values.sex,
    birthDate: values.birthDate,
    breederNameText: values.breederNameText,
    ownershipPreview: values.ownershipNames,
    sirePreview: {
      name: values.sirePreviewName,
      registrationNo: values.sirePreviewRegistrationNo,
    },
    damPreview: {
      name: values.damPreviewName,
      registrationNo: values.damPreviewRegistrationNo,
    },
    trialCount: 1,
    showCount: 2,
    ekNo: Number(values.ekNo),
    note: values.note,
    registrationNo: values.registrationNo,
    secondaryRegistrationNos: values.secondaryRegistrationNos,
  };
}

describe("DogFormModal", () => {
  it("renders edit form with prefilled persisted values", () => {
    const values = buildEditValues();
    const html = renderToStaticMarkup(
      React.createElement(DogFormModal, {
        mode: "edit",
        dog: buildDog(values),
        values,
        breederOptions: [{ id: "b_1", name: "Metsapolun" }],
        ownerOptions: [
          { id: "o_1", name: "Tiina Virtanen" },
          { id: "o_2", name: "Antti Virtanen" },
        ],
        parentOptions: [
          { registrationNo: "FI54321/20", name: "Korven Aatos" },
          { registrationNo: "FI77777/18", name: "Havupolun Helmi" },
        ],
        onBreederSearchChange: vi.fn(),
        onOwnerSearchChange: vi.fn(),
        onParentSearchChange: vi.fn(),
        open: true,
        onClose: vi.fn(),
        onValuesChange: vi.fn(),
        onSubmit: vi.fn(),
      }),
    );

    expect(html).toContain('value="FI12345/21"');
    expect(html).toContain('value="FI54321/21"');
    expect(html).toContain('value="Metsapolun Kide"');
    expect(html).toContain('value="2021-04-09"');
    expect(html).toContain('value="Metsapolun"');
    expect(html).toContain(">Tiina Virtanen<");
    expect(html).toContain(">Antti Virtanen<");
    expect(html).toContain('value="5588"');
    expect(html).toContain('value="Important note"');
    expect(html).toContain("admin.dogs.form.recordIdPrefix dog_1");
  });
});
