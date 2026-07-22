import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateAdminTrialEntryMutation } from "../use-create-admin-trial-entry-mutation";

const { useMutation, invalidateQueries, action } = vi.hoisted(() => ({
  useMutation: vi.fn(),
  invalidateQueries: vi.fn(),
  action: vi.fn(),
}));
vi.mock("@tanstack/react-query", () => ({
  useMutation,
  useQueryClient: () => ({ invalidateQueries }),
}));
vi.mock("@/app/actions/admin/trials/manage/create-admin-trial-entry", () => ({
  createAdminTrialEntryAction: action,
}));

describe("useCreateAdminTrialEntryMutation", () => {
  beforeEach(() => {
    useMutation.mockReset();
    invalidateQueries.mockReset();
    action.mockReset();
    useMutation.mockImplementation((options) => options);
  });
  it("calls the R1 action and refetches all affected query roots", async () => {
    action.mockResolvedValue({
      hasError: false,
      data: { trialEventId: "event-1", trialEntryId: "entry-1" },
    });
    useCreateAdminTrialEntryMutation();
    const options = useMutation.mock.calls[0][0];
    await expect(
      options.mutationFn({ trialEventId: "event-1" }),
    ).resolves.toEqual({ trialEventId: "event-1", trialEntryId: "entry-1" });
    await options.onSuccess();
    expect(invalidateQueries).toHaveBeenCalledTimes(5);
    expect(invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ refetchType: "all" }),
    );
  });
  it("surfaces the stable action error code", async () => {
    action.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INVALID_TRIAL_ADDITIONAL_INFO",
      message: "Invalid",
      validationIssue: {
        area: "additional_info",
        reason: "invalid_lisatieto_order",
        koodi: "25",
        osa: "b",
      },
    });
    useCreateAdminTrialEntryMutation();
    await expect(
      useMutation.mock.calls[0][0].mutationFn({}),
    ).rejects.toMatchObject({
      errorCode: "INVALID_TRIAL_ADDITIONAL_INFO",
      details: { koodi: "25", osa: "b" },
    });
  });
});
