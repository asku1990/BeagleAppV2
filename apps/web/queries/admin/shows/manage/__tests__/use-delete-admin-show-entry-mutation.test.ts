import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminShowEventQueryKeyRoot,
  adminShowEventsQueryKeyRoot,
} from "../query-keys";
import { useDeleteAdminShowEntryMutation } from "../use-delete-admin-show-entry-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  deleteAdminShowEntryActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  deleteAdminShowEntryActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/shows/manage/delete-admin-show-entry", () => ({
  deleteAdminShowEntryAction: deleteAdminShowEntryActionMock,
}));

describe("useDeleteAdminShowEntryMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    deleteAdminShowEntryActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminShowEntryActionMock.mockResolvedValue({
      hasError: false,
      data: {
        showId: "show-1",
        entryId: "entry-1",
      },
    });

    useDeleteAdminShowEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = {
      showId: "show-1",
      entryId: "entry-1",
    };
    await expect(options.mutationFn(input)).resolves.toEqual({
      showId: "show-1",
      entryId: "entry-1",
    });
    expect(deleteAdminShowEntryActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminShowEntryActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "SHOW_ENTRY_NOT_FOUND",
      message: "Show entry not found.",
    });

    useDeleteAdminShowEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({ showId: "show-1", entryId: "entry-1" }),
    ).rejects.toBeInstanceOf(AdminMutationError);
  });

  it("invalidates show query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useDeleteAdminShowEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess: () => Promise<void>;
    };

    await options.onSuccess();

    expect(invalidateQueriesMock).toHaveBeenCalledTimes(2);
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminShowEventsQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminShowEventQueryKeyRoot,
    });
  });
});
