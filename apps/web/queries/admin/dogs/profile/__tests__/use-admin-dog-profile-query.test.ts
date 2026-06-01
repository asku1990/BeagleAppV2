import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminDogProfileQueryKey } from "../query-keys";
import { useAdminDogProfileQuery } from "../use-admin-dog-profile-query";

const { useQueryMock, getAdminDogProfileMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getAdminDogProfileMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@beagle/api-client", () => ({
  createAdminDogsApiClient: () => ({
    getAdminDogProfile: getAdminDogProfileMock,
  }),
}));

describe("useAdminDogProfileQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminDogProfileMock.mockReset();
  });

  it("uses the expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminDogProfileQuery({ dogId: " dog-1 " });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(adminDogProfileQueryKey("dog-1"));
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(false);
    expect(options.enabled).toBe(true);
  });

  it("is disabled for an empty dog id", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminDogProfileQuery({ dogId: "   " });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      enabled: boolean;
    };

    expect(options.enabled).toBe(false);
  });

  it("returns the admin profile when the request succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminDogProfileMock.mockResolvedValue({
      ok: true,
      data: { dog: { id: "dog-1" } },
    });

    useAdminDogProfileQuery({ dogId: "dog-1" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual({ dog: { id: "dog-1" } });
  });

  it.each([
    ["FORBIDDEN", "Admin access required."],
    ["UNAUTHENTICATED", "Sign in required."],
    ["DOG_NOT_FOUND", "Dog profile not found."],
    ["INTERNAL_ERROR", "Failed to load admin dog profile."],
  ])("maps %s to the expected error message", async (code, message) => {
    useQueryMock.mockImplementation((options) => options);
    getAdminDogProfileMock.mockResolvedValue({
      ok: false,
      code,
      error: message,
      status: 500,
    });

    useAdminDogProfileQuery({ dogId: "dog-1" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message,
      errorCode: code,
      name: "AdminDogProfileQueryError",
    });
  });
});
