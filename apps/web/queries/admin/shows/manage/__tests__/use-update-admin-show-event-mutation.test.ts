import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminShowEventQueryKeyRoot,
  adminShowEventsQueryKeyRoot,
} from "../query-keys";
import { useUpdateAdminShowEventMutation } from "../use-update-admin-show-event-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  updateAdminShowEventActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  updateAdminShowEventActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/app/actions/admin/shows/manage/update-admin-show-event", () => ({
  updateAdminShowEventAction: updateAdminShowEventActionMock,
}));

describe("useUpdateAdminShowEventMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReset();
    invalidateQueriesMock.mockReset();
    updateAdminShowEventActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  it("calls action and returns response data", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminShowEventActionMock.mockResolvedValue({
      hasError: false,
      data: {
        showId: "show-2",
        eventDate: "2026-04-01",
        eventPlace: "Helsinki",
        eventCity: "Helsinki",
        eventName: "Spring Show",
        eventType: "N",
        organizer: "Beagle Club",
      },
    });

    useUpdateAdminShowEventMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    const input = {
      showId: "show-1",
      eventDate: "2026-04-01",
      eventPlace: "Helsinki",
    };
    await expect(options.mutationFn(input)).resolves.toEqual({
      showId: "show-2",
      eventDate: "2026-04-01",
      eventPlace: "Helsinki",
      eventCity: "Helsinki",
      eventName: "Spring Show",
      eventType: "N",
      organizer: "Beagle Club",
    });
    expect(updateAdminShowEventActionMock).toHaveBeenCalledWith(input);
  });

  it("throws AdminMutationError when action returns error", async () => {
    useMutationMock.mockImplementation((options) => options);
    updateAdminShowEventActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "SHOW_EVENT_NOT_FOUND",
      message: "Show event not found.",
    });

    useUpdateAdminShowEventMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      mutationFn: (input: unknown) => Promise<unknown>;
    };

    await expect(
      options.mutationFn({ showId: "show-1", eventPlace: "Helsinki" }),
    ).rejects.toBeInstanceOf(AdminMutationError);
  });

  it("invalidates show query roots on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useUpdateAdminShowEventMutation();
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
