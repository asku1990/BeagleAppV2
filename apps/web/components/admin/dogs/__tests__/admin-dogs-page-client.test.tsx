import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminDogFormValues } from "../types";

const {
  useAdminDogsQueryMock,
  useAdminDogBreederOptionsQueryMock,
  useAdminDogOwnerOptionsQueryMock,
  useAdminDogParentOptionsQueryMock,
  useCreateAdminDogMutationMock,
  useUpdateAdminDogMutationMock,
  useDeleteAdminDogMutationMock,
  useAdminDogFormFlowMock,
  buttonPropsMock,
  dogFormModalPropsMock,
  deleteModalPropsMock,
  dogResultsPropsMock,
} = vi.hoisted(() => ({
  useAdminDogsQueryMock: vi.fn(),
  useAdminDogBreederOptionsQueryMock: vi.fn(),
  useAdminDogOwnerOptionsQueryMock: vi.fn(),
  useAdminDogParentOptionsQueryMock: vi.fn(),
  useCreateAdminDogMutationMock: vi.fn(),
  useUpdateAdminDogMutationMock: vi.fn(),
  useDeleteAdminDogMutationMock: vi.fn(),
  useAdminDogFormFlowMock: vi.fn(),
  buttonPropsMock: vi.fn(),
  dogFormModalPropsMock: vi.fn(),
  deleteModalPropsMock: vi.fn(),
  dogResultsPropsMock: vi.fn(),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/admin/dogs/manage", () => ({
  useAdminDogFormFlow: useAdminDogFormFlowMock,
}));

vi.mock("@/queries/admin/dogs", () => ({
  useAdminDogsQuery: useAdminDogsQueryMock,
  useAdminDogBreederOptionsQuery: useAdminDogBreederOptionsQueryMock,
  useAdminDogOwnerOptionsQuery: useAdminDogOwnerOptionsQueryMock,
  useAdminDogParentOptionsQuery: useAdminDogParentOptionsQueryMock,
  useCreateAdminDogMutation: useCreateAdminDogMutationMock,
  useUpdateAdminDogMutation: useUpdateAdminDogMutationMock,
  useDeleteAdminDogMutation: useDeleteAdminDogMutationMock,
}));

vi.mock("@/components/listing", () => ({
  ListingSectionShell: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    buttonPropsMock(props);
    return React.createElement(
      "button",
      props as Record<string, string>,
      children,
    );
  },
}));

vi.mock("../dog-filters", () => ({
  DogFilters: () => React.createElement("div", null, "filters"),
}));

vi.mock("../dog-results", () => ({
  DogResults: (props: Record<string, unknown>) => {
    dogResultsPropsMock(props);
    return React.createElement("div", null, "results");
  },
}));

vi.mock("../dog-form-modal", () => ({
  DogFormModal: (props: Record<string, unknown>) => {
    dogFormModalPropsMock(props);
    return React.createElement("div", null, "form");
  },
}));

vi.mock("../delete-dog-confirm-modal", () => ({
  DeleteDogConfirmModal: (props: Record<string, unknown>) => {
    deleteModalPropsMock(props);
    return React.createElement("div", null, "delete");
  },
}));

import { AdminDogsPageClient } from "../admin-dogs-page-client";

function buildFormValues(): AdminDogFormValues {
  return {
    name: "Metsapolun Kide",
    sex: "FEMALE",
    birthDate: "2021-04-09",
    breederNameText: "Selected Breeder",
    ownershipNames: ["Tiina Virtanen"],
    ekNo: "5588",
    note: "",
    registrationNo: "FI12345/21",
    secondaryRegistrationNos: [],
    sirePreviewName: "Korven Aatos",
    sirePreviewRegistrationNo: "FI54321/20",
    damPreviewName: "Havupolun Helmi",
    damPreviewRegistrationNo: "FI77777/18",
    titles: [],
  };
}

describe("AdminDogsPageClient", () => {
  beforeEach(() => {
    useAdminDogsQueryMock.mockReset();
    useAdminDogBreederOptionsQueryMock.mockReset();
    useAdminDogOwnerOptionsQueryMock.mockReset();
    useAdminDogParentOptionsQueryMock.mockReset();
    useCreateAdminDogMutationMock.mockReset();
    useUpdateAdminDogMutationMock.mockReset();
    useDeleteAdminDogMutationMock.mockReset();
    useAdminDogFormFlowMock.mockReset();
    buttonPropsMock.mockReset();
    dogFormModalPropsMock.mockReset();
    deleteModalPropsMock.mockReset();
    dogResultsPropsMock.mockReset();

    useCreateAdminDogMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useUpdateAdminDogMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
    useDeleteAdminDogMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });

    useAdminDogsQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: "dog_1",
            registrationNo: "FI12345/21",
            secondaryRegistrationNos: [],
            name: "Metsapolun Kide",
            sex: "FEMALE",
            birthDate: "2021-04-09",
            breederName: "Metsapolun",
            ownerNames: ["Tiina Virtanen"],
            sire: { name: "Korven Aatos", registrationNo: "FI54321/20" },
            dam: { name: "Havupolun Helmi", registrationNo: "FI77777/18" },
            trialCount: 2,
            showCount: 1,
            titlesText: null,
            ekNo: 5588,
            note: null,
            titles: [],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    useAdminDogBreederOptionsQueryMock.mockReturnValue({
      data: [{ id: "b_1", name: "Metsapolun" }],
    });
    useAdminDogOwnerOptionsQueryMock.mockReturnValue({
      data: [{ id: "o_1", name: "Tiina Virtanen" }],
    });
    useAdminDogParentOptionsQueryMock.mockReturnValue({
      data: [
        {
          id: "dog_2",
          name: "Korven Aatos",
          registrationNo: "FI54321/20",
          sex: "MALE",
        },
      ],
    });
    useAdminDogFormFlowMock.mockReturnValue({
      deleteTarget: null,
      setDeleteTarget: vi.fn(),
      formState: { open: true, mode: "create", target: null },
      formValues: buildFormValues(),
      setFormValues: vi.fn(),
      breederLookupQuery: "",
      setBreederLookupQuery: vi.fn(),
      ownerLookupQuery: "",
      setOwnerLookupQuery: vi.fn(),
      parentLookupQuery: "",
      setParentLookupQuery: vi.fn(),
      openCreateModal: vi.fn(),
      openEditModal: vi.fn(),
      closeFormModal: vi.fn(),
      handleSubmit: vi.fn(),
      handleDeleteConfirm: vi.fn(),
      isSubmitting: false,
      isDeleting: false,
    });
  });

  it("wires create/edit/delete handlers from form flow into page composition", () => {
    renderToStaticMarkup(React.createElement(AdminDogsPageClient));

    const formFlow = useAdminDogFormFlowMock.mock.results[0].value;
    const firstButtonProps = buttonPropsMock.mock.calls[0][0];
    const dogResultsProps = dogResultsPropsMock.mock.calls[0][0];
    const dogFormProps = dogFormModalPropsMock.mock.calls[0][0];
    const deleteProps = deleteModalPropsMock.mock.calls[0][0];

    firstButtonProps.onClick();
    deleteProps.onCancel();

    expect(formFlow.openCreateModal).toHaveBeenCalledTimes(1);
    expect(formFlow.setDeleteTarget).toHaveBeenCalledWith(null);
    expect(dogResultsProps.onEdit).toBe(formFlow.openEditModal);
    expect(dogResultsProps.onDelete).toBe(formFlow.setDeleteTarget);
    expect(dogFormProps.onSubmit).toBe(formFlow.handleSubmit);
    expect(deleteProps.onConfirm).toBe(formFlow.handleDeleteConfirm);
  });

  it("passes shaped breeder/owner/parent options into DogFormModal", () => {
    renderToStaticMarkup(React.createElement(AdminDogsPageClient));

    const dogFormProps = dogFormModalPropsMock.mock.calls[0][0];
    const dogResultsProps = dogResultsPropsMock.mock.calls[0][0];

    expect(dogFormProps.breederOptions).toEqual([
      { id: "selected:Selected Breeder", name: "Selected Breeder" },
      { id: "b_1", name: "Metsapolun" },
    ]);
    expect(dogFormProps.ownerOptions).toEqual([
      { id: "o_1", name: "Tiina Virtanen" },
    ]);
    expect(dogFormProps.parentOptions).toEqual([
      { registrationNo: "FI77777/18", name: "Havupolun Helmi" },
      { registrationNo: "FI54321/20", name: "Korven Aatos" },
    ]);
    expect(dogResultsProps.dogs[0]?.titlesText).toBeNull();
  });
});
