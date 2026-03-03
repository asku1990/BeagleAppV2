import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  beagleNewestQueryKeyRoot,
  beagleSearchQueryKeyRoot,
} from "@/queries/public/beagle/search/query-keys";
import { homeStatisticsQueryKey } from "@/queries/public/home/statistics/query-keys";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminDogBreederOptionsQueryKeyRoot,
  adminDogOwnerOptionsQueryKeyRoot,
  adminDogParentOptionsQueryKeyRoot,
  adminDogsQueryKeyRoot,
} from "../query-keys";
import { useDeleteAdminDogMutation } from "../use-delete-admin-dog-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  deleteAdminDogActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  deleteAdminDogActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/dogs/manage/delete-admin-dog", () => ({
  deleteAdminDogAction: deleteAdminDogActionMock,
}));

describe("useDeleteAdminDogMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    deleteAdminDogActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls delete action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminDogActionMock.mockResolvedValue({
      hasError: false,
      data: {
        deletedDogId: "dog_1",
      },
    });

    useDeleteAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = { id: "dog_1" };
    await expect(options.mutationFn(input)).resolves.toEqual({
      deletedDogId: "dog_1",
    });
    expect(deleteAdminDogActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminDogActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "DOG_NOT_FOUND",
      message: "Dog not found.",
    });

    useDeleteAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(options.mutationFn({ id: "dog_1" })).rejects.toMatchObject({
      name: "AdminMutationError",
      errorCode: "DOG_NOT_FOUND",
    });
  });

  it("invalidates admin and public dog query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useDeleteAdminDogMutation();
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
    deleteAdminDogActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "DOG_NOT_FOUND",
      message: "Dog not found.",
    });

    useDeleteAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(options.mutationFn({ id: "dog_1" })).rejects.toBeInstanceOf(
      AdminMutationError,
    );
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
