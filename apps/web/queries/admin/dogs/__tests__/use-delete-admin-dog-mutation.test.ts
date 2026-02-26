import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { adminDogsQueryKeyRoot } from "../query-keys";
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

vi.mock("@/app/actions/admin/dogs/delete-admin-dog", () => ({
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

  it("invalidates admin dogs query on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useDeleteAdminDogMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess: () => Promise<void>;
    };

    await options.onSuccess();

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminDogsQueryKeyRoot,
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
