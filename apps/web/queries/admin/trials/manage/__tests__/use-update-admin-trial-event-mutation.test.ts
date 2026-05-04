import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { beagleTrialsQueryKeyRoot } from "@/queries/public/beagle/trials/query-keys";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "../query-keys";
import { useUpdateAdminTrialEventMutation } from "../use-update-admin-trial-event-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  updateAdminTrialEventActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  updateAdminTrialEventActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/trials/manage/update-admin-trial-event", () => ({
  updateAdminTrialEventAction: updateAdminTrialEventActionMock,
}));

describe("useUpdateAdminTrialEventMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    updateAdminTrialEventActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminTrialEventActionMock.mockResolvedValue({
      hasError: false,
      data: {
        trialEventId: "event-1",
      },
    });

    useUpdateAdminTrialEventMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = {
      trialEventId: "event-1",
      eventDate: "2026-04-14",
      eventPlace: "Helsinki",
      eventName: null,
      organizer: null,
      judge: null,
      sklKoeId: null,
    };

    await expect(options.mutationFn(input)).resolves.toEqual({
      trialEventId: "event-1",
    });
    expect(updateAdminTrialEventActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminTrialEventActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INVALID_EVENT_PLACE",
      message: "Event place is required.",
    });

    useUpdateAdminTrialEventMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "",
        eventName: null,
        organizer: null,
        judge: null,
        sklKoeId: null,
      }),
    ).rejects.toBeInstanceOf(AdminMutationError);
  });

  it("invalidates admin and public trial query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useUpdateAdminTrialEventMutation();
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
