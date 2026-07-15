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
    inbreedingCoefficientPct: null,
    colorCode: "121",
    note: "Important note",
    registrationNo: "FI12345/21",
    secondaryRegistrationNos: ["FI54321/21"],
    sirePreviewName: "Korven Aatos",
    sirePreviewRegistrationNo: "FI54321/20",
    damPreviewName: "Havupolun Helmi",
    damPreviewRegistrationNo: "FI77777/18",
    titles: [
      {
        awardedOn: "2022-01-10",
        titleCode: "FI JVA",
        titleName: "Valio",
      },
    ],
  };
}

function buildCreateValues(): AdminDogFormValues {
  return {
    name: "",
    sex: "UNKNOWN",
    birthDate: "",
    breederNameText: "",
    ownershipNames: [],
    ekNo: "",
    inbreedingCoefficientPct: null,
    colorCode: "",
    note: "",
    registrationNo: "",
    secondaryRegistrationNos: [],
    sirePreviewName: "",
    sirePreviewRegistrationNo: "",
    damPreviewName: "",
    damPreviewRegistrationNo: "",
    titles: [],
  };
}

function buildDog(values: AdminDogFormValues): AdminDogRecord {
  return {
    id: "dog_1",
    status: "NORMAL",
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
    titlesText:
      values.titles.map((title) => title.titleCode).join(", ") || null,
    ekNo: Number(values.ekNo),
    colorCode: values.colorCode ? Number(values.colorCode) : null,
    note: values.note,
    registrationNo: values.registrationNo,
    secondaryRegistrationNos: values.secondaryRegistrationNos,
    titles: values.titles.map((title, index) => ({
      id: `title_${index + 1}`,
      awardedOn: title.awardedOn,
      titleCode: title.titleCode,
      titleName: title.titleName,
      sortOrder: index,
    })),
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
        formStatus: "NORMAL",
        colorOptions: [{ value: "121", label: "121 - Kolmivärinen" }],
        ownerOptions: [
          { id: "o_1", name: "Tiina Virtanen" },
          { id: "o_2", name: "Antti Virtanen" },
        ],
        parentOptions: [
          { registrationNo: "FI54321/20", name: "Korven Aatos" },
          { registrationNo: "FI77777/18", name: "Havupolun Helmi" },
        ],
        onOwnerSearchChange: vi.fn(),
        onParentSearchChange: vi.fn(),
        open: true,
        onClose: vi.fn(),
        onValuesChange: vi.fn(),
        onFormStatusChange: vi.fn(),
        onSubmit: vi.fn(),
        onCalculateInbreeding: vi.fn(),
      }),
    );

    expect(html).toContain('value="FI12345/21"');
    expect(html).toContain('value="FI54321/21"');
    expect(html).toContain('value="Metsapolun Kide"');
    expect(html).toContain('value="2021-04-09"');
    expect(html).not.toContain("admin.dogs.form.breederSelectLabel");
    expect(html).toContain(">Tiina Virtanen<");
    expect(html).toContain(">Antti Virtanen<");
    expect(html).toContain('value="5588"');
    expect(html).toContain('value="Important note"');
    expect(html).toContain('value="2022-01-10"');
    expect(html).toContain('value="FI JVA"');
    expect(html).toContain('value="Valio"');
    expect(html).toContain("admin.dogs.form.inbreedingLabel");
    expect(html).toContain("admin.dogs.form.sireSelectLabel *");
    expect(html).toContain("admin.dogs.form.damSelectLabel *");
    expect(html).toContain("admin.dogs.form.inbreedingEmpty");
    expect(html).toContain("admin.dogs.form.recordIdPrefix dog_1");
  });

  it("caps the birth date picker at today", () => {
    const values = buildEditValues();
    const today = new Date().toISOString().slice(0, 10);
    const html = renderToStaticMarkup(
      React.createElement(DogFormModal, {
        mode: "edit",
        dog: buildDog(values),
        values,
        formStatus: "NORMAL",
        colorOptions: [{ value: "121", label: "121 - Kolmivärinen" }],
        ownerOptions: [
          { id: "o_1", name: "Tiina Virtanen" },
          { id: "o_2", name: "Antti Virtanen" },
        ],
        parentOptions: [
          { registrationNo: "FI54321/20", name: "Korven Aatos" },
          { registrationNo: "FI77777/18", name: "Havupolun Helmi" },
        ],
        onOwnerSearchChange: vi.fn(),
        onParentSearchChange: vi.fn(),
        open: true,
        onClose: vi.fn(),
        onValuesChange: vi.fn(),
        onFormStatusChange: vi.fn(),
        onSubmit: vi.fn(),
        onCalculateInbreeding: vi.fn(),
      }),
    );

    expect(html).toContain(`max="${today}"`);
  });

  it("shows explicit set-date control when birth date is empty", () => {
    const values = buildCreateValues();
    const html = renderToStaticMarkup(
      React.createElement(DogFormModal, {
        mode: "create",
        dog: null,
        values,
        formStatus: "NORMAL",
        colorOptions: [],
        ownerOptions: [],
        parentOptions: [],
        onOwnerSearchChange: vi.fn(),
        onParentSearchChange: vi.fn(),
        open: true,
        onClose: vi.fn(),
        onValuesChange: vi.fn(),
        onFormStatusChange: vi.fn(),
        onSubmit: vi.fn(),
        onCalculateInbreeding: vi.fn(),
      }),
    );

    expect(html).toContain("admin.dogs.form.birthDateUnknown");
    expect(html).toContain("admin.dogs.form.birthDateSet");
    expect(html).not.toContain("admin.dogs.form.birthDateClear");
    expect(html).toContain("admin.dogs.form.inbreedingCalculate");
    expect(html).toContain("disabled");
  });

  it("shows reference status and makes name and parents optional", () => {
    const values = buildCreateValues();
    values.registrationNo = "FI12345/21";

    const html = renderToStaticMarkup(
      React.createElement(DogFormModal, {
        mode: "create",
        dog: null,
        values,
        formStatus: "REFERENCE_ONLY",
        colorOptions: [],
        ownerOptions: [],
        parentOptions: [],
        onOwnerSearchChange: vi.fn(),
        onParentSearchChange: vi.fn(),
        open: true,
        onClose: vi.fn(),
        onValuesChange: vi.fn(),
        onFormStatusChange: vi.fn(),
        onSubmit: vi.fn(),
        onCalculateInbreeding: vi.fn(),
      }),
    );

    expect(html).toContain("admin.dogs.form.statusReferenceOnly");
    expect(html).toContain("admin.dogs.form.statusReferenceOnlyHelp");
    expect(html).not.toContain("admin.dogs.form.namePlaceholder *");
    expect(html).not.toContain("admin.dogs.form.sireSelectLabel *");
    expect(html).not.toContain("admin.dogs.form.damSelectLabel *");
    const submitButton = html.match(
      /<button[^>]*>admin\.dogs\.form\.createSubmit<\/button>/,
    )?.[0];
    expect(submitButton).toBeDefined();
    expect(submitButton).not.toContain(' disabled=""');
  });

  it("applies reference-only rules in edit mode", () => {
    const values = buildCreateValues();
    values.registrationNo = "FI12345/21";
    const dog = buildDog(values);
    dog.status = "REFERENCE_ONLY";

    const html = renderToStaticMarkup(
      React.createElement(DogFormModal, {
        mode: "edit",
        dog,
        values,
        formStatus: "REFERENCE_ONLY",
        colorOptions: [],
        ownerOptions: [],
        parentOptions: [],
        onOwnerSearchChange: vi.fn(),
        onParentSearchChange: vi.fn(),
        open: true,
        onClose: vi.fn(),
        onValuesChange: vi.fn(),
        onFormStatusChange: vi.fn(),
        onSubmit: vi.fn(),
        onCalculateInbreeding: vi.fn(),
      }),
    );

    expect(html).toContain("admin.dogs.form.statusReferenceOnlyHelp");
    expect(html).not.toContain("admin.dogs.form.namePlaceholder *");
    expect(html).not.toContain("admin.dogs.form.sireSelectLabel *");
    expect(html).not.toContain("admin.dogs.form.damSelectLabel *");
    const submitButton = html.match(
      /<button[^>]*>admin\.dogs\.form\.editSubmit<\/button>/,
    )?.[0];
    expect(submitButton).toBeDefined();
    expect(submitButton).not.toContain(' disabled=""');
  });
});
