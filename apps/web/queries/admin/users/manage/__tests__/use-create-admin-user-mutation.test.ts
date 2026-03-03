import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "../mutation-error";
import { adminUsersQueryKey } from "../query-keys";
import { useCreateAdminUserMutation } from "../use-create-admin-user-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  createAdminUserActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  createAdminUserActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/users/manage/create-admin-user", () => ({
  createAdminUserAction: createAdminUserActionMock,
}));

describe("useCreateAdminUserMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    createAdminUserActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls create admin action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    createAdminUserActionMock.mockResolvedValue({
      hasError: false,
      data: { id: "u_1" },
    });

    useCreateAdminUserMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };
    const input = {
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      password: "password-123456",
    };

    await expect(options.mutationFn(input)).resolves.toEqual({ id: "u_1" });
    expect(createAdminUserActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    createAdminUserActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "EMAIL_EXISTS",
      message: "Email already exists.",
    });

    useCreateAdminUserMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN",
        password: "password-123456",
      }),
    ).rejects.toMatchObject({
      name: "AdminMutationError",
      errorCode: "EMAIL_EXISTS",
    });
  });

  it("invalidates admin users query on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useCreateAdminUserMutation();
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
    createAdminUserActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "EMAIL_EXISTS",
      message: "Email already exists.",
    });

    useCreateAdminUserMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN",
        password: "password-123456",
      }),
    ).rejects.toBeInstanceOf(AdminMutationError);
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
