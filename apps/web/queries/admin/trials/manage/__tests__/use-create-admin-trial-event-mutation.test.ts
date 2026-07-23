import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "../query-keys";
import { useCreateAdminTrialEventMutation } from "../use-create-admin-trial-event-mutation";

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
vi.mock("@/app/actions/admin/trials/manage/create-admin-trial-event", () => ({
  createAdminTrialEventAction: actionMock,
}));

describe("useCreateAdminTrialEventMutation", () => {
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
      data: { trialEventId: "event-1" },
    });
    useCreateAdminTrialEventMutation();
    const options = useMutationMock.mock.calls[0]?.[0];

    await expect(options.mutationFn({})).resolves.toEqual({
      trialEventId: "event-1",
    });
    await options.onSuccess();
    expect(invalidateMock).toHaveBeenCalledWith({
      queryKey: adminTrialEventsQueryKeyRoot,
    });
    expect(invalidateMock).toHaveBeenCalledWith({
      queryKey: adminTrialEventQueryKeyRoot,
    });
  });

  it("rejects action errors", async () => {
    actionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "SKL_KOE_ID_CONFLICT",
      message: "Conflict",
    });
    useCreateAdminTrialEventMutation();

    await expect(
      useMutationMock.mock.calls[0]?.[0].mutationFn({}),
    ).rejects.toMatchObject({ errorCode: "SKL_KOE_ID_CONFLICT" });
  });
});
