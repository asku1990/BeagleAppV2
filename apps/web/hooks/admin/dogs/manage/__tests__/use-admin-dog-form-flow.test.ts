import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import type {
  AdminDogFormValues,
  AdminDogRecord,
} from "@/components/admin/dogs/types";
import { useAdminDogFormFlow } from "../use-admin-dog-form-flow";

const { useStateMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  useStateMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useState: useStateMock,
  };
});

vi.mock("@/components/ui/sonner", () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

function buildFormValues(): AdminDogFormValues {
  return {
    name: "Metsapolun Kide",
    sex: "FEMALE",
    birthDate: "2021-04-09",
    breederNameText: "Metsapolun",
    ownershipNames: ["Tiina Virtanen"],
    ekNo: "5588",
    note: "Important note",
    registrationNo: "fi12345/21",
    secondaryRegistrationNos: [" fi54321/21 "],
    sirePreviewName: "Korven Aatos",
    sirePreviewRegistrationNo: "FI54321/20",
    damPreviewName: "Havupolun Helmi",
    damPreviewRegistrationNo: "FI77777/18",
    titles: [
      {
        awardedOn: "2022-01-10",
        titleCode: " FI JVA ",
        titleName: " Valio ",
      },
    ],
  };
}

function buildTargetDog(): AdminDogRecord {
  return {
    id: "dog_1",
    name: "Metsapolun Kide",
    sex: "FEMALE",
    birthDate: "2021-04-09",
    breederNameText: "Metsapolun",
    trialCount: 1,
    showCount: 2,
    ownershipPreview: ["Tiina Virtanen"],
    ekNo: 5588,
    note: "Important note",
    registrationNo: "FI12345/21",
    secondaryRegistrationNos: ["FI54321/21"],
    sirePreview: { name: "Korven Aatos", registrationNo: "FI54321/20" },
    damPreview: { name: "Havupolun Helmi", registrationNo: "FI77777/18" },
    titles: [],
  };
}

describe("useAdminDogFormFlow", () => {
  beforeEach(() => {
    useStateMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("submits create payload, normalizes values, and closes modal on success", async () => {
    const setDeleteTarget = vi.fn();
    const setFormState = vi.fn();
    const setFormValues = vi.fn();
    const setBreederLookupQuery = vi.fn();
    const setOwnerLookupQuery = vi.fn();
    const setParentLookupQuery = vi.fn();

    useStateMock
      .mockImplementationOnce((initial) => [initial, setDeleteTarget])
      .mockImplementationOnce(() => [
        { open: true, mode: "create", target: null },
        setFormState,
      ])
      .mockImplementationOnce((initial) => [initial, setFormValues])
      .mockImplementationOnce((initial) => [initial, setBreederLookupQuery])
      .mockImplementationOnce((initial) => [initial, setOwnerLookupQuery])
      .mockImplementationOnce((initial) => [initial, setParentLookupQuery]);

    const createMutateAsync = vi.fn().mockResolvedValue({ id: "dog_1" });
    const hook = useAdminDogFormFlow({
      t: (key) => key,
      createDogMutation: { isPending: false, mutateAsync: createMutateAsync },
      updateDogMutation: { isPending: false, mutateAsync: vi.fn() },
      deleteDogMutation: { isPending: false, mutateAsync: vi.fn() },
    });

    await hook.handleSubmit(buildFormValues());

    expect(createMutateAsync).toHaveBeenCalledWith({
      name: "Metsapolun Kide",
      sex: "FEMALE",
      birthDate: "2021-04-09",
      breederNameText: "Metsapolun",
      ownerNames: ["Tiina Virtanen"],
      ekNo: 5588,
      note: "Important note",
      registrationNo: "fi12345/21",
      secondaryRegistrationNos: ["FI54321/21"],
      sireRegistrationNo: "FI54321/20",
      damRegistrationNo: "FI77777/18",
      titles: [
        {
          awardedOn: "2022-01-10",
          titleCode: "FI JVA",
          titleName: "Valio",
        },
      ],
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("admin.dogs.create.success");
    expect(setFormState).toHaveBeenCalledWith({
      open: false,
      mode: "create",
      target: null,
    });
  });

  it("submits update payload in edit mode", async () => {
    const target = buildTargetDog();

    useStateMock
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce(() => [
        { open: true, mode: "edit", target },
        vi.fn(),
      ])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()]);

    const updateMutateAsync = vi.fn().mockResolvedValue({ id: "dog_1" });
    const hook = useAdminDogFormFlow({
      t: (key) => key,
      createDogMutation: { isPending: false, mutateAsync: vi.fn() },
      updateDogMutation: { isPending: false, mutateAsync: updateMutateAsync },
      deleteDogMutation: { isPending: false, mutateAsync: vi.fn() },
    });

    await hook.handleSubmit(buildFormValues());

    expect(updateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "dog_1",
        name: "Metsapolun Kide",
        registrationNo: "fi12345/21",
      }),
    );
    expect(toastSuccessMock).toHaveBeenCalledWith("admin.dogs.edit.success");
  });

  it("deletes selected target and clears dialog state", async () => {
    const setDeleteTarget = vi.fn();

    useStateMock
      .mockImplementationOnce(() => [buildTargetDog(), setDeleteTarget])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()]);

    const deleteMutateAsync = vi.fn().mockResolvedValue({});
    const hook = useAdminDogFormFlow({
      t: (key) => key,
      createDogMutation: { isPending: false, mutateAsync: vi.fn() },
      updateDogMutation: { isPending: false, mutateAsync: vi.fn() },
      deleteDogMutation: { isPending: false, mutateAsync: deleteMutateAsync },
    });

    await hook.handleDeleteConfirm();

    expect(deleteMutateAsync).toHaveBeenCalledWith({ id: "dog_1" });
    expect(setDeleteTarget).toHaveBeenCalledWith(null);
    expect(toastSuccessMock).toHaveBeenCalledWith("admin.dogs.delete.success");
  });

  it("maps mutation errors to translated error keys", async () => {
    useStateMock
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce(() => [
        { open: true, mode: "create", target: null },
        vi.fn(),
      ])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()]);

    const createMutateAsync = vi
      .fn()
      .mockRejectedValue(new AdminMutationError("Nope", "INVALID_NAME"));

    const hook = useAdminDogFormFlow({
      t: (key) => `tr:${key}`,
      createDogMutation: { isPending: false, mutateAsync: createMutateAsync },
      updateDogMutation: { isPending: false, mutateAsync: vi.fn() },
      deleteDogMutation: { isPending: false, mutateAsync: vi.fn() },
    });

    await hook.handleSubmit(buildFormValues());

    expect(toastErrorMock).toHaveBeenCalledWith(
      "tr:admin.dogs.mutation.errorInvalidName",
    );
  });

  it("keeps create modal birth date empty by default", () => {
    const setFormValues = vi.fn();

    useStateMock
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, setFormValues])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()])
      .mockImplementationOnce((initial) => [initial, vi.fn()]);

    const hook = useAdminDogFormFlow({
      t: (key) => key,
      createDogMutation: { isPending: false, mutateAsync: vi.fn() },
      updateDogMutation: { isPending: false, mutateAsync: vi.fn() },
      deleteDogMutation: { isPending: false, mutateAsync: vi.fn() },
    });

    hook.openCreateModal();

    expect(setFormValues).toHaveBeenCalledWith(
      expect.objectContaining({
        birthDate: "",
      }),
    );
  });
});
