import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminTrialEvent } from "../delete-trial-event";

const { deleteWriteMock } = vi.hoisted(() => ({ deleteWriteMock: vi.fn() }));

vi.mock("@beagle/db", () => ({
  deleteAdminTrialEventWriteDb: deleteWriteMock,
}));

const admin = {
  id: "u_1",
  email: "admin@example.com",
  username: null,
  role: "ADMIN" as const,
};

describe("deleteAdminTrialEvent", () => {
  beforeEach(() => deleteWriteMock.mockReset());

  it("validates and authorizes the request", async () => {
    expect(
      (await deleteAdminTrialEvent({ trialEventId: " " }, admin)).status,
    ).toBe(400);
    expect(
      (
        await deleteAdminTrialEvent(
          { trialEventId: "event-1" },
          { ...admin, role: "USER" },
        )
      ).status,
    ).toBe(403);
    expect(deleteWriteMock).not.toHaveBeenCalled();
  });

  it.each([
    ["not_found", 404, "TRIAL_EVENT_NOT_FOUND"],
    ["not_empty", 409, "TRIAL_EVENT_NOT_EMPTY"],
  ] as const)("maps %s", async (status, httpStatus, code) => {
    deleteWriteMock.mockResolvedValue({ status });

    const result = await deleteAdminTrialEvent(
      { trialEventId: "event-1" },
      admin,
    );

    expect(result.status).toBe(httpStatus);
    expect(result.body).toMatchObject({ ok: false, code });
  });

  it("returns the deleted event id", async () => {
    deleteWriteMock.mockResolvedValue({
      status: "deleted",
      deletedTrialEventId: "event-1",
    });

    await expect(
      deleteAdminTrialEvent({ trialEventId: " event-1 " }, admin),
    ).resolves.toEqual({
      status: 200,
      body: { ok: true, data: { deletedTrialEventId: "event-1" } },
    });
    expect(deleteWriteMock).toHaveBeenCalledWith({ trialEventId: "event-1" });
  });
});
