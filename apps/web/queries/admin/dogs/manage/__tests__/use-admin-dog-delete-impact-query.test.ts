import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminDogDeleteImpactQueryKey } from "../query-keys";
import { useAdminDogDeleteImpactQuery } from "../use-admin-dog-delete-impact-query";

const { useQueryMock, getAdminDogDeleteImpactActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getAdminDogDeleteImpactActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/admin/dogs/manage/get-delete-impact", () => ({
  getAdminDogDeleteImpactAction: getAdminDogDeleteImpactActionMock,
}));

describe("useAdminDogDeleteImpactQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminDogDeleteImpactActionMock.mockReset();
  });

  it("configures query key and enabled flag", () => {
    useAdminDogDeleteImpactQuery({ dogId: " dog_1 " });

    expect(useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: adminDogDeleteImpactQueryKey("dog_1"),
        enabled: true,
      }),
    );
  });

  it("calls action and returns impact data", async () => {
    const impact = {
      dogId: "dog_1",
      deleted: {
        registrations: 1,
        ownerships: 2,
        titles: 3,
        legacyTrialResults: 4,
      },
      detached: {
        canonicalTrialEntries: 5,
        showEntries: 6,
        diseaseRows: 7,
        sireReferences: 8,
        damReferences: 9,
      },
      orphanWarnings: { owners: [], breeder: null },
    };
    useQueryMock.mockImplementation((options) => options);
    getAdminDogDeleteImpactActionMock.mockResolvedValue({
      hasError: false,
      data: impact,
    });

    const options = useAdminDogDeleteImpactQuery({
      dogId: "dog_1",
    }) as unknown as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual(impact);
    expect(getAdminDogDeleteImpactActionMock).toHaveBeenCalledWith({
      id: "dog_1",
    });
  });
});
