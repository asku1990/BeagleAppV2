import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "../mutation-error";
import { adminUsersQueryKey } from "../query-keys";
import { useDeleteAdminUserMutation } from "../use-delete-admin-user-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  deleteAdminUserActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  deleteAdminUserActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/delete-admin-user", () => ({
  deleteAdminUserAction: deleteAdminUserActionMock,
}));

describe("useDeleteAdminUserMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    deleteAdminUserActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls delete admin action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminUserActionMock.mockResolvedValue({
      hasError: false,
      data: { success: true },
    });

    useDeleteAdminUserMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };
    const input = { userId: "u_1" };

    await expect(options.mutationFn(input)).resolves.toEqual({ success: true });
    expect(deleteAdminUserActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminUserActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "LAST_ADMIN",
      message: "Cannot delete the last admin user.",
    });

    useDeleteAdminUserMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(options.mutationFn({ userId: "u_1" })).rejects.toMatchObject({
      name: "AdminMutationError",
      errorCode: "LAST_ADMIN",
    });
  });

  it("invalidates admin users query on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useDeleteAdminUserMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess: () => Promise<void>;
    };

    await options.onSuccess();

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminUsersQueryKey,
    });
  });

  it("does not invalidate cache when mutation fails", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminUserActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "LAST_ADMIN",
      message: "Cannot delete the last admin user.",
    });

    useDeleteAdminUserMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(options.mutationFn({ userId: "u_1" })).rejects.toBeInstanceOf(
      AdminMutationError,
    );
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
