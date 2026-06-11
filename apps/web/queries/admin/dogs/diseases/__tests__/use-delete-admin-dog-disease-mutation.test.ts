import { beforeEach, describe, expect, it, vi } from "vitest";
import { beagleDogsQueryKeyRoot } from "@/queries/public/beagle/dogs/profile/query-keys";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { adminDogProfileQueryKeyRoot } from "@web/queries/admin/dogs/profile/query-keys";
import { adminDogDiseasesQueryKeyRoot } from "../query-keys";
import { useDeleteAdminDogDiseaseMutation } from "../use-delete-admin-dog-disease-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  deleteAdminDogDiseaseActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  deleteAdminDogDiseaseActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/dogs/diseases", () => ({
  deleteAdminDogDiseaseAction: deleteAdminDogDiseaseActionMock,
}));

describe("useDeleteAdminDogDiseaseMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    deleteAdminDogDiseaseActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls delete disease action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminDogDiseaseActionMock.mockResolvedValue({
      hasError: false,
      data: { deletedDiseaseId: "row-1" },
    });

    useDeleteAdminDogDiseaseMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(options.mutationFn({ id: "row-1" })).resolves.toEqual({
      deletedDiseaseId: "row-1",
    });
    expect(deleteAdminDogDiseaseActionMock).toHaveBeenCalledWith({
      id: "row-1",
    });
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminDogDiseaseActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "DISEASE_ROW_NOT_FOUND",
      message: "Disease row was not found.",
    });

    useDeleteAdminDogDiseaseMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(options.mutationFn({ id: "missing" })).rejects.toBeInstanceOf(
      AdminMutationError,
    );
  });

  it("invalidates disease and profile query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useDeleteAdminDogDiseaseMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess: () => Promise<void>;
    };

    await options.onSuccess();

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminDogDiseasesQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminDogProfileQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: beagleDogsQueryKeyRoot,
    });
  });
});
