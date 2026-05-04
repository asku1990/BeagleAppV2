import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { beagleTrialsQueryKeyRoot } from "@/queries/public/beagle/trials/query-keys";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "../query-keys";
import { useDeleteAdminTrialEntryMutation } from "../use-delete-admin-trial-entry-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  deleteAdminTrialEntryActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  deleteAdminTrialEntryActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/trials/manage/delete-admin-trial-entry", () => ({
  deleteAdminTrialEntryAction: deleteAdminTrialEntryActionMock,
}));

describe("useDeleteAdminTrialEntryMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    deleteAdminTrialEntryActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminTrialEntryActionMock.mockResolvedValue({
      hasError: false,
      data: {
        deletedTrialEntryId: "entry-1",
        trialEventId: "event-1",
        deletedTrialEvent: false,
      },
    });

    useDeleteAdminTrialEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = {
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    };
    await expect(options.mutationFn(input)).resolves.toEqual({
      deletedTrialEntryId: "entry-1",
      trialEventId: "event-1",
      deletedTrialEvent: false,
    });
    expect(deleteAdminTrialEntryActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    deleteAdminTrialEntryActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "ENTRY_NOT_FOUND",
      message: "Entry not found in selected trial event.",
    });

    useDeleteAdminTrialEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({ trialEventId: "event-1", trialEntryId: "entry-1" }),
    ).rejects.toBeInstanceOf(AdminMutationError);
  });

  it("invalidates admin and public trial query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useDeleteAdminTrialEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess: () => Promise<void>;
    };

    await options.onSuccess();

    expect(invalidateQueriesMock).toHaveBeenCalledTimes(3);
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminTrialEventsQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminTrialEventQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: beagleTrialsQueryKeyRoot,
    });
  });
});
