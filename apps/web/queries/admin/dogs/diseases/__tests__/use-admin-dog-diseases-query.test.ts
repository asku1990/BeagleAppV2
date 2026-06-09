import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminDogDiseasesQueryKey } from "../query-keys";
import { useAdminDogDiseasesQuery } from "../use-admin-dog-diseases-query";

const { useQueryMock, listAdminDogDiseasesMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  listAdminDogDiseasesMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@beagle/api-client", () => ({
  createAdminDogsApiClient: () => ({
    listAdminDogDiseases: listAdminDogDiseasesMock,
  }),
}));

describe("useAdminDogDiseasesQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    listAdminDogDiseasesMock.mockReset();
  });

  it("uses the expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminDogDiseasesQuery({
      diseaseCode: "epi",
      diseaseGroup: "EPILEPSIA",
      query: "kide",
      page: 2,
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
      retry: boolean;
    };

    expect(options.queryKey).toEqual(
      adminDogDiseasesQueryKey({
        diseaseCode: "epi",
        diseaseGroup: "EPILEPSIA",
        query: "kide",
        page: 2,
      }),
    );
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
    expect(options.retry).toBe(false);
  });

  it("distinguishes default, all, and explicit disease keys", () => {
    expect(adminDogDiseasesQueryKey({})).toEqual([
      "admin-dogs",
      "diseases",
      "__default__",
      "__default_group__",
      "",
      1,
    ]);
    expect(adminDogDiseasesQueryKey({ diseaseCode: null })).toEqual([
      "admin-dogs",
      "diseases",
      "__all__",
      "__default_group__",
      "",
      1,
    ]);
    expect(
      adminDogDiseasesQueryKey({
        diseaseGroup: "LAFORA",
        query: "kide",
        page: 2,
      }),
    ).toEqual(["admin-dogs", "diseases", "__default__", "LAFORA", "kide", 2]);
  });

  it("returns disease results when the request succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    listAdminDogDiseasesMock.mockResolvedValue({
      ok: true,
      data: {
        selectedDiseaseCode: "epi",
        selectedDiseaseGroup: "EPILEPSIA",
        query: "kide",
        total: 1,
        totalPages: 1,
        page: 1,
        diseaseGroupOptions: [],
        diseaseOptions: [],
        items: [],
      },
    });

    useAdminDogDiseasesQuery({
      diseaseCode: "epi",
      diseaseGroup: "LAFORA",
      query: "kide",
      page: 3,
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual({
      selectedDiseaseCode: "epi",
      selectedDiseaseGroup: "EPILEPSIA",
      query: "kide",
      total: 1,
      totalPages: 1,
      page: 1,
      diseaseGroupOptions: [],
      diseaseOptions: [],
      items: [],
    });

    expect(listAdminDogDiseasesMock).toHaveBeenCalledWith({
      diseaseCode: "epi",
      diseaseGroup: "LAFORA",
      query: "kide",
      page: 3,
    });
  });

  it("maps forbidden responses to a typed query error", async () => {
    useQueryMock.mockImplementation((options) => options);
    listAdminDogDiseasesMock.mockResolvedValue({
      ok: false,
      status: 403,
      code: "FORBIDDEN",
      error: "Forbidden",
    });

    useAdminDogDiseasesQuery({});

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      name: "AdminDogDiseasesQueryError",
      message: "Admin access required.",
      errorCode: "FORBIDDEN",
    });
  });
});
