import { beforeEach, describe, expect, it, vi } from "vitest";
import { beagleShowDetailsQueryKey } from "../query-keys";
import { useBeagleShowDetailsQuery } from "../use-beagle-show-details-query";

const { useQueryMock, getBeagleShowDetailsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getBeagleShowDetailsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/public/beagle/shows/get-show-details", () => ({
  getBeagleShowDetailsAction: getBeagleShowDetailsActionMock,
}));

describe("useBeagleShowDetailsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getBeagleShowDetailsActionMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleShowDetailsQuery(" s_1 ");

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(beagleShowDetailsQueryKey("s_1"));
    expect(options.staleTime).toBe(1000 * 60 * 5);
    expect(options.enabled).toBe(true);
  });

  it("is disabled when show id is missing", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleShowDetailsQuery("   ");

    const options = useQueryMock.mock.calls[0]?.[0] as {
      enabled: boolean;
    };
    expect(options.enabled).toBe(false);
  });

  it("returns data when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    const data = {
      show: {
        showId: "s_1",
        eventDate: "2025-06-01",
        eventPlace: "Helsinki",
        judge: "Judge Main",
        dogCount: 1,
      },
      items: [],
    };
    getBeagleShowDetailsActionMock.mockResolvedValue({
      hasError: false,
      status: 200,
      data,
    });

    useBeagleShowDetailsQuery(" s_1 ");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(data);
    expect(getBeagleShowDetailsActionMock).toHaveBeenCalledWith("s_1");
  });

  it("throws mapped action error", async () => {
    useQueryMock.mockImplementation((options) => options);
    getBeagleShowDetailsActionMock.mockResolvedValue({
      hasError: true,
      status: 404,
      data: null,
      error: "Show not found.",
    });

    useBeagleShowDetailsQuery("s_missing");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Show not found.",
      status: 404,
    });
  });

  it("throws fallback message when action error text is missing", async () => {
    useQueryMock.mockImplementation((options) => options);
    getBeagleShowDetailsActionMock.mockResolvedValue({
      hasError: true,
      status: 500,
      data: null,
    });

    useBeagleShowDetailsQuery("s_1");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Failed to load show details.",
      status: 500,
    });
  });
});
