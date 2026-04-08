import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminShowEventQueryKeyRoot,
  adminShowEventsQueryKeyRoot,
} from "../query-keys";
import { useUpdateAdminShowEntryMutation } from "../use-update-admin-show-entry-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  updateAdminShowEntryActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  updateAdminShowEntryActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/shows/manage/update-admin-show-entry", () => ({
  updateAdminShowEntryAction: updateAdminShowEntryActionMock,
}));

describe("useUpdateAdminShowEntryMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    updateAdminShowEntryActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminShowEntryActionMock.mockResolvedValue({
      hasError: false,
      data: {
        showId: "show-1",
        entryId: "entry-1",
      },
    });

    useUpdateAdminShowEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = {
      showId: "show-1",
      entryId: "entry-1",
      classCode: "AVO",
    };
    await expect(options.mutationFn(input)).resolves.toEqual({
      showId: "show-1",
      entryId: "entry-1",
    });
    expect(updateAdminShowEntryActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminShowEntryActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INVALID_CLASS_PLACEMENT",
      message: "Class placement must be 1-4.",
    });

    useUpdateAdminShowEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({ showId: "show-1", entryId: "entry-1" }),
    ).rejects.toBeInstanceOf(AdminMutationError);
  });

  it("invalidates show query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useUpdateAdminShowEntryMutation();
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
