import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminUsersQueryKey } from "../query-keys";
import { useAdminUsersQuery } from "../use-admin-users-query";

const { useQueryMock, getAdminUsersActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getAdminUsersActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/admin/get-admin-users", () => ({
  getAdminUsersAction: getAdminUsersActionMock,
}));

describe("useAdminUsersQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminUsersActionMock.mockReset();
  });

  it("uses the expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminUsersQuery();

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
    };

    expect(options.queryKey).toEqual(adminUsersQueryKey);
    expect(options.staleTime).toBe(60_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it("returns items when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminUsersActionMock.mockResolvedValue({
      hasError: false,
      data: {
        items: [
          {
            id: "u_1",
            email: "admin@example.com",
            name: "Admin",
            role: "ADMIN",
            status: "active",
            createdAt: "2026-02-19T10:00:00.000Z",
            lastSignInAt: null,
          },
        ],
      },
    });

    useAdminUsersQuery();
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual([
      {
        id: "u_1",
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN",
        status: "active",
        createdAt: "2026-02-19T10:00:00.000Z",
        lastSignInAt: null,
      },
    ]);
  });

  it("throws when action returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminUsersActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INTERNAL_ERROR",
    });

    useAdminUsersQuery();
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load admin users.",
    );
  });
});
