import { beforeEach, describe, expect, it, vi } from "vitest";
import { beagleDogsQueryKeyRoot } from "@/queries/public/beagle/dogs/profile/query-keys";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { adminDogProfileQueryKeyRoot } from "@web/queries/admin/dogs/profile/query-keys";
import { adminDogDiseasesQueryKeyRoot } from "../query-keys";
import { useCreateAdminDogDiseaseMutation } from "../use-create-admin-dog-disease-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  createAdminDogDiseaseActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  createAdminDogDiseaseActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/dogs/diseases", () => ({
  createAdminDogDiseaseAction: createAdminDogDiseaseActionMock,
}));

describe("useCreateAdminDogDiseaseMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    createAdminDogDiseaseActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls create disease action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    createAdminDogDiseaseActionMock.mockResolvedValue({
      hasError: false,
      data: { id: "row-1" },
    });

    useCreateAdminDogDiseaseMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = {
      evidenceKind: "DOG",
      diseaseCode: "epi",
      registrationNo: "FI12345/21",
      public: false,
    };
    await expect(options.mutationFn(input)).resolves.toEqual({ id: "row-1" });
    expect(createAdminDogDiseaseActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    createAdminDogDiseaseActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "DOG_NOT_FOUND",
      message: "Dog was not found.",
    });

    useCreateAdminDogDiseaseMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        evidenceKind: "DOG",
        diseaseCode: "epi",
        registrationNo: "FI12345/21",
        public: false,
      }),
    ).rejects.toBeInstanceOf(AdminMutationError);
  });

  it("invalidates disease and profile query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useCreateAdminDogDiseaseMutation();
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
