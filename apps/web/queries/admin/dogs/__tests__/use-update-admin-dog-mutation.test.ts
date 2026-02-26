import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  beagleNewestQueryKeyRoot,
  beagleSearchQueryKeyRoot,
} from "@/queries/beagle-search/query-keys";
import { homeStatisticsQueryKey } from "@/queries/home/query-keys";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminDogBreederOptionsQueryKeyRoot,
  adminDogOwnerOptionsQueryKeyRoot,
  adminDogParentOptionsQueryKeyRoot,
  adminDogsQueryKeyRoot,
} from "../query-keys";
import { useUpdateAdminDogMutation } from "../use-update-admin-dog-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  updateAdminDogActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  updateAdminDogActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/dogs/update-admin-dog", () => ({
  updateAdminDogAction: updateAdminDogActionMock,
}));

describe("useUpdateAdminDogMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    updateAdminDogActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls update action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminDogActionMock.mockResolvedValue({
      hasError: false,
      data: {
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      },
    });

    useUpdateAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = {
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    };
    await expect(options.mutationFn(input)).resolves.toEqual({
      id: "dog_1",
      name: "Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });
    expect(updateAdminDogActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminDogActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "DOG_NOT_FOUND",
      message: "Dog not found.",
    });

    useUpdateAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).rejects.toMatchObject({
      name: "AdminMutationError",
      errorCode: "DOG_NOT_FOUND",
    });
  });

  it("invalidates admin and public dog query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useUpdateAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess: () => Promise<void>;
    };

    await options.onSuccess();

    expect(invalidateQueriesMock).toHaveBeenCalledTimes(7);
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminDogsQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminDogBreederOptionsQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminDogOwnerOptionsQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminDogParentOptionsQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: beagleSearchQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: beagleNewestQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: homeStatisticsQueryKey,
    });
  });

  it("does not invalidate cache when mutation fails", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminDogActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "DOG_NOT_FOUND",
      message: "Dog not found.",
    });

    useUpdateAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).rejects.toBeInstanceOf(AdminMutationError);
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
