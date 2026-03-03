import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  beagleNewestQueryKeyRoot,
  beagleSearchQueryKeyRoot,
} from "@/queries/public/beagle/search/query-keys";
import { homeStatisticsQueryKey } from "@/queries/public/home/statistics/query-keys";
import { AdminMutationError } from "@/queries/admin/dogs/manage/mutation-error";
import {
  adminDogBreederOptionsQueryKeyRoot,
  adminDogOwnerOptionsQueryKeyRoot,
  adminDogParentOptionsQueryKeyRoot,
  adminDogsQueryKeyRoot,
} from "../query-keys";
import { useCreateAdminDogMutation } from "../use-create-admin-dog-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  createAdminDogActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  createAdminDogActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/dogs/manage/create-admin-dog", () => ({
  createAdminDogAction: createAdminDogActionMock,
}));

describe("useCreateAdminDogMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    createAdminDogActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls create dog action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    createAdminDogActionMock.mockResolvedValue({
      hasError: false,
      data: {
        id: "dog_1",
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      },
    });

    useCreateAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = {
      name: "Metsapolun Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    };
    await expect(options.mutationFn(input)).resolves.toEqual({
      id: "dog_1",
      name: "Metsapolun Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });
    expect(createAdminDogActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    createAdminDogActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "DUPLICATE_DOG",
      message: "Dog already exists.",
    });

    useCreateAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).rejects.toMatchObject({
      name: "AdminMutationError",
      errorCode: "DUPLICATE_DOG",
    });
  });

  it("invalidates admin and public dog query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useCreateAdminDogMutation();
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
    createAdminDogActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "DUPLICATE_DOG",
      message: "Dog already exists.",
    });

    useCreateAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).rejects.toBeInstanceOf(AdminMutationError);
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
