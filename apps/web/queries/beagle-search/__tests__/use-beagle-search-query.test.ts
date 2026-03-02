import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BeagleSearchQueryState } from "@/lib/public/beagle/search";
import { beagleSearchQueryKey } from "../query-keys";
import { useBeagleSearchQuery } from "../use-beagle-search-query";

const { useQueryMock, searchDogsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  searchDogsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/public/beagle/search/search-dogs", () => ({
  searchDogsAction: searchDogsActionMock,
}));

const baseState: BeagleSearchQueryState = {
  ek: "",
  reg: "",
  name: "",
  sex: "any",
  birthYearFrom: "",
  birthYearTo: "",
  ekOnly: false,
  multipleRegsOnly: false,
  page: 1,
  pageSize: 10,
  sort: "name-asc",
  adv: false,
};

describe("useBeagleSearchQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    searchDogsActionMock.mockReset();
  });

  it("disables query when there is no search input", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleSearchQuery(baseState);

    const options = useQueryMock.mock.calls[0]?.[0] as { enabled: boolean };
    expect(options.enabled).toBe(false);
  });

  it("enables query when any core field is present", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleSearchQuery({ ...baseState, name: "Meri" });

    const options = useQueryMock.mock.calls[0]?.[0] as { enabled: boolean };
    expect(options.enabled).toBe(true);
  });

  it("enables query for advanced-only search", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleSearchQuery({ ...baseState, sex: "female", adv: true });

    const options = useQueryMock.mock.calls[0]?.[0] as { enabled: boolean };
    expect(options.enabled).toBe(true);
  });

  it("includes pagination and ek-asc sort in query key", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleSearchQuery({
      ...baseState,
      ek: "100",
      page: 3,
      pageSize: 25,
      sort: "ek-asc",
      multipleRegsOnly: true,
    });

    const options = useQueryMock.mock.calls[0]?.[0] as { queryKey: unknown[] };
    expect(options.queryKey).toEqual(
      beagleSearchQueryKey({
        ...baseState,
        ek: "100",
        page: 3,
        pageSize: 25,
        sort: "ek-asc",
        multipleRegsOnly: true,
      }),
    );
  });

  it("maps payload and omits sex when value is any", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchDogsActionMock.mockResolvedValue({
      hasError: false,
      data: {
        mode: "ek",
        total: 1,
        totalPages: 1,
        page: 1,
        items: [],
      },
    });

    useBeagleSearchQuery({
      ...baseState,
      ek: "120",
      birthYearFrom: "2020",
      birthYearTo: "2022",
      sort: "created-desc",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await options.queryFn();

    expect(searchDogsActionMock).toHaveBeenCalledWith({
      ek: "120",
      reg: "",
      name: "",
      sex: undefined,
      birthYearFrom: 2020,
      birthYearTo: 2022,
      ekOnly: false,
      multipleRegsOnly: false,
      page: 1,
      pageSize: 10,
      sort: "created-desc",
    });
  });

  it("includes sex and multipleRegsOnly in payload", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchDogsActionMock.mockResolvedValue({
      hasError: false,
      data: {
        mode: "combined",
        total: 2,
        totalPages: 1,
        page: 1,
        items: [],
      },
    });

    useBeagleSearchQuery({
      ...baseState,
      reg: "FI-",
      sex: "male",
      multipleRegsOnly: true,
      birthYearFrom: "abcd",
      birthYearTo: "999",
      page: 2,
      sort: "reg-desc",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await options.queryFn();

    expect(searchDogsActionMock).toHaveBeenCalledWith({
      ek: "",
      reg: "FI-",
      name: "",
      sex: "male",
      birthYearFrom: undefined,
      birthYearTo: undefined,
      ekOnly: false,
      multipleRegsOnly: true,
      page: 2,
      pageSize: 10,
      sort: "reg-desc",
    });
  });

  it("throws action error message when action fails", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchDogsActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      error: "boom",
    });

    useBeagleSearchQuery({ ...baseState, name: "X" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow("boom");
  });

  it("throws fallback message when action has no error text", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchDogsActionMock.mockResolvedValue({
      hasError: true,
      data: null,
    });

    useBeagleSearchQuery({ ...baseState, ekOnly: true });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load beagle search results.",
    );
  });
});
