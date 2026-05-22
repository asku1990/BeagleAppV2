import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { useAdminVirtualPairingSearchQuery } from "../use-admin-virtual-pairing-search-query";

const { useQueryMock, searchAdminVirtualPairingActionMock } = vi.hoisted(
  () => ({
    useQueryMock: vi.fn(),
    searchAdminVirtualPairingActionMock: vi.fn(),
  }),
);

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/admin/dogs/virtual-pairing", () => ({
  searchAdminVirtualPairingAction: searchAdminVirtualPairingActionMock,
}));

describe("useAdminVirtualPairingSearchQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    searchAdminVirtualPairingActionMock.mockReset();
  });

  it("calls the search action and returns the payload", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchAdminVirtualPairingActionMock.mockResolvedValue({
      hasError: false,
      data: {
        field: "name",
        query: "Kide",
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            id: "dog_1",
            ekNo: 5588,
            registrationNo: "FI12345/21",
            name: "Metsapolun Kide",
            sex: "N",
          },
        ],
      },
    });

    useAdminVirtualPairingSearchQuery(
      { field: "name", query: "Kide", page: 1, pageSize: 10 },
      true,
    );
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toMatchObject({
      field: "name",
      total: 1,
    });
  });

  it("throws AdminMutationError when the action fails", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchAdminVirtualPairingActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INVALID_REGISTRATION_NO",
      message: "Registration number is required.",
    });

    useAdminVirtualPairingSearchQuery(
      { field: "reg", query: "FI12345/21", page: 1, pageSize: 10 },
      true,
    );
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toBeInstanceOf(AdminMutationError);
  });
});
