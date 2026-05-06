import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { beagleTrialsQueryKeyRoot } from "@/queries/public/beagle/trials/query-keys";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "../query-keys";
import { useUpdateAdminTrialEntryMutation } from "../use-update-admin-trial-entry-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  updateAdminTrialEntryActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  updateAdminTrialEntryActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/trials/manage/update-admin-trial-entry", () => ({
  updateAdminTrialEntryAction: updateAdminTrialEntryActionMock,
}));

describe("useUpdateAdminTrialEntryMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    updateAdminTrialEntryActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminTrialEntryActionMock.mockResolvedValue({
      hasError: false,
      data: { trialEventId: "event-1", trialEntryId: "entry-1" },
    });

    useUpdateAdminTrialEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = {
      trialEventId: "event-1",
      trialEntryId: "entry-1",
      entry: { koetyyppi: "NORMAL" },
      eras: [{ era: 1 }],
      lisatiedotRows: [],
    };

    await expect(options.mutationFn(input)).resolves.toEqual({
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });
    expect(updateAdminTrialEntryActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminTrialEntryActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "ENTRY_NOT_FOUND",
      message: "Entry not found in selected trial event.",
    });

    useUpdateAdminTrialEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
        entry: { koetyyppi: "NORMAL" },
        eras: [{ era: 1 }],
        lisatiedotRows: [],
      }),
    ).rejects.toBeInstanceOf(AdminMutationError);
  });

  it("invalidates admin and public query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useUpdateAdminTrialEntryMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess: () => Promise<void>;
    };

    await options.onSuccess();

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
