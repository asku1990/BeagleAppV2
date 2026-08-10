import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "../query-keys";
import { useDeleteAdminTrialEventMutation } from "../use-delete-admin-trial-event-mutation";

const { useMutationMock, useQueryClientMock, invalidateMock, actionMock } =
  vi.hoisted(() => ({
    useMutationMock: vi.fn(),
    useQueryClientMock: vi.fn(),
    invalidateMock: vi.fn(),
    actionMock: vi.fn(),
  }));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQueryClient: useQueryClientMock,
}));
vi.mock("@/app/actions/admin/trials/manage/delete-admin-trial-event", () => ({
  deleteAdminTrialEventAction: actionMock,
}));

describe("useDeleteAdminTrialEventMutation", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useQueryClientMock.mockReturnValue({ invalidateQueries: invalidateMock });
    invalidateMock.mockReset();
    actionMock.mockReset();
    useMutationMock.mockImplementation((options) => options);
  });

  it("returns action data and invalidates admin event queries", async () => {
    actionMock.mockResolvedValue({
      hasError: false,
      data: { deletedTrialEventId: "event-1" },
    });
    useDeleteAdminTrialEventMutation();
    const options = useMutationMock.mock.calls[0]?.[0];

    await expect(
      options.mutationFn({ trialEventId: "event-1" }),
    ).resolves.toEqual({ deletedTrialEventId: "event-1" });
    await options.onSuccess();
    expect(invalidateMock).toHaveBeenCalledWith({
      queryKey: adminTrialEventsQueryKeyRoot,
    });
    expect(invalidateMock).toHaveBeenCalledWith({
      queryKey: adminTrialEventQueryKeyRoot,
    });
  });
});
