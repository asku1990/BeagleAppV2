import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { adminUsersQueryKey } from "../query-keys";
import { useSetAdminUserStatusMutation } from "../use-set-admin-user-status-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  setAdminUserStatusActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  setAdminUserStatusActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/users/manage/set-admin-user-status", () => ({
  setAdminUserStatusAction: setAdminUserStatusActionMock,
}));

describe("useSetAdminUserStatusMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    setAdminUserStatusActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls set status action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    setAdminUserStatusActionMock.mockResolvedValue({
      hasError: false,
      data: { success: true },
    });

    useSetAdminUserStatusMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };
    const input = { userId: "u_1", status: "suspended" };

    await expect(options.mutationFn(input)).resolves.toEqual({ success: true });
    expect(setAdminUserStatusActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    setAdminUserStatusActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "LAST_ACTIVE_ADMIN",
      message: "Cannot suspend the last active admin user.",
    });

    useSetAdminUserStatusMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({ userId: "u_1", status: "suspended" }),
    ).rejects.toMatchObject({
      name: "AdminMutationError",
      errorCode: "LAST_ACTIVE_ADMIN",
    });
  });

  it("invalidates admin users query on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useSetAdminUserStatusMutation();
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
    setAdminUserStatusActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "LAST_ACTIVE_ADMIN",
      message: "Cannot suspend the last active admin user.",
    });

    useSetAdminUserStatusMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({ userId: "u_1", status: "suspended" }),
    ).rejects.toBeInstanceOf(AdminMutationError);
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
