import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminShowEventQueryKey,
  adminShowEventQueryKeyRoot,
  adminShowEventsQueryKeyRoot,
} from "../query-keys";
import { useUpdateAdminShowEventMutation } from "../use-update-admin-show-event-mutation";

const {
  useMutationMock,
  useQueryClientMock,
  invalidateQueriesMock,
  cancelQueriesMock,
  removeQueriesMock,
  updateAdminShowEventActionMock,
} = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  useQueryClientMock: vi.fn(),
  invalidateQueriesMock: vi.fn(),
  cancelQueriesMock: vi.fn(),
  removeQueriesMock: vi.fn(),
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
    cancelQueriesMock.mockReset();
    removeQueriesMock.mockReset();
    updateAdminShowEventActionMock.mockReset();
    useQueryClientMock.mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
      cancelQueries: cancelQueriesMock,
      removeQueries: removeQueriesMock,
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

  it("invalidates event list and moved detail query on success", async () => {
    useMutationMock.mockImplementation((options) => options);

    useUpdateAdminShowEventMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess: (
        response: { showId: string },
        variables: { showId: string },
      ) => Promise<void>;
    };

    await options.onSuccess({ showId: "show-2" }, { showId: "show-1" });

    expect(removeQueriesMock).toHaveBeenCalledTimes(1);
    expect(cancelQueriesMock).toHaveBeenCalledTimes(1);
    expect(cancelQueriesMock).toHaveBeenCalledWith({
      queryKey: adminShowEventQueryKey("show-1"),
      exact: true,
    });
    expect(removeQueriesMock).toHaveBeenCalledWith({
      queryKey: adminShowEventQueryKey("show-1"),
      exact: true,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledTimes(2);
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminShowEventsQueryKeyRoot,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminShowEventQueryKey("show-2"),
      exact: true,
    });
  });

  it("invalidates only the current detail key when show id is unchanged", async () => {
    useMutationMock.mockImplementation((options) => options);

    useUpdateAdminShowEventMutation();
    const options = useMutationMock.mock.calls[0]?.[0] as {
      onSuccess: (
        response: { showId: string },
        variables: { showId: string },
      ) => Promise<void>;
    };

    await options.onSuccess({ showId: "show-1" }, { showId: "show-1" });

    expect(removeQueriesMock).toHaveBeenCalledWith({
      queryKey: adminShowEventQueryKey("show-1"),
      exact: true,
    });
    expect(cancelQueriesMock).toHaveBeenCalledWith({
      queryKey: adminShowEventQueryKey("show-1"),
      exact: true,
    });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: adminShowEventQueryKey("show-1"),
      exact: true,
    });
    expect(invalidateQueriesMock).not.toHaveBeenCalledWith({
      queryKey: adminShowEventQueryKeyRoot,
    });
  });
});
