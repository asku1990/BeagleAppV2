import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "../mutation-error";
import { adminUsersQueryKey } from "../query-keys";
import { useSetAdminUserPasswordMutation } from "../use-set-admin-user-password-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  setAdminUserPasswordActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  setAdminUserPasswordActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/set-admin-user-password", () => ({
  setAdminUserPasswordAction: setAdminUserPasswordActionMock,
}));

describe("useSetAdminUserPasswordMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    setAdminUserPasswordActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls set password action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    setAdminUserPasswordActionMock.mockResolvedValue({
      hasError: false,
      data: { success: true },
    });

    useSetAdminUserPasswordMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };
    const input = { userId: "u_1", newPassword: "password-123456" };

    await expect(options.mutationFn(input)).resolves.toEqual({ success: true });
    expect(setAdminUserPasswordActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    setAdminUserPasswordActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INVALID_PASSWORD",
      message: "Password length must be between 12 and 128 characters.",
    });

    useSetAdminUserPasswordMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({ userId: "u_1", newPassword: "short" }),
    ).rejects.toMatchObject({
      name: "AdminMutationError",
      errorCode: "INVALID_PASSWORD",
    });
  });

  it("invalidates admin users query on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useSetAdminUserPasswordMutation();
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
    setAdminUserPasswordActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INVALID_PASSWORD",
      message: "Password length must be between 12 and 128 characters.",
    });

    useSetAdminUserPasswordMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({ userId: "u_1", newPassword: "short" }),
    ).rejects.toBeInstanceOf(AdminMutationError);
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
