import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBeagleDogProfileQuery } from "../use-beagle-dog-profile-query";
import { beagleDogProfileQueryKey } from "../query-keys";

const { useQueryMock, getDogProfileActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getDogProfileActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/public/beagle/dogs/profile/get-dog-profile", () => ({
  getDogProfileAction: getDogProfileActionMock,
}));

describe("useBeagleDogProfileQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getDogProfileActionMock.mockReset();
  });

  it("uses the expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    const dogId = "dog_123";
    useBeagleDogProfileQuery(dogId);

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(beagleDogProfileQueryKey(dogId));
    expect(options.staleTime).toBe(1000 * 60 * 5);
    expect(options.enabled).toBe(true);
  });

  it("is disabled when dogId is missing", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleDogProfileQuery("");

    const options = useQueryMock.mock.calls[0]?.[0] as {
      enabled: boolean;
    };

    expect(options.enabled).toBe(false);
  });

  it("returns data when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    const mockData = { id: "dog_123", name: "Rex" };
    getDogProfileActionMock.mockResolvedValue({
      hasError: false,
      data: mockData,
      status: 200,
    });

    useBeagleDogProfileQuery("dog_123");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(mockData);
  });

  it("throws when action returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    getDogProfileActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      status: 404,
      error: "Dog not found",
    });

    useBeagleDogProfileQuery("dog_123");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow("Dog not found");
  });

  it("throws default error message when action returns error without message", async () => {
    useQueryMock.mockImplementation((options) => options);
    getDogProfileActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      status: 500,
    });

    useBeagleDogProfileQuery("dog_123");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load dog profile.",
    );
  });
});
