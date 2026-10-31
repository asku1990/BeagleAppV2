import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { applyMock, currentUserMock } = vi.hoisted(() => ({
  applyMock: vi.fn(),
  currentUserMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  applyFinnishKennelClubDogImport: applyMock,
}));
vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: currentUserMock,
}));

const user = {
  id: "admin-1",
  email: "admin@example.com",
  name: "admin",
  role: "ADMIN" as const,
  createdAt: null,
  sessionId: "session-1",
};

function requestWithForm(includeRequiredFields = true) {
  const form = new FormData();
  form.set("file", new File(["xlsx-bytes"], "dogs.xlsx"));
  if (includeRequiredFields) {
    form.set("previewDigest", "preview-1");
    form.set("sourceFileSha256", "sha-1");
  }
  return new NextRequest("http://localhost/api/admin/dogs/import/apply", {
    method: "POST",
    body: form,
    headers: { "x-request-id": "request-1", origin: "http://localhost:3000" },
  });
}

describe("Finnish Kennel Club dog import apply route", () => {
  beforeEach(() => {
    applyMock.mockReset();
    currentUserMock.mockReset();
  });

  it("rejects a form missing required fields", async () => {
    currentUserMock.mockResolvedValue(user);
    const response = await (
      await import("../route")
    ).POST(requestWithForm(false));

    expect(response.status).toBe(400);
    expect(applyMock).not.toHaveBeenCalled();
  });

  it("forwards the file, audit request context, and current user context", async () => {
    currentUserMock.mockResolvedValue(user);
    applyMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { imported: 1 } },
    });

    const response = await (await import("../route")).POST(requestWithForm());

    expect(response.status).toBe(200);
    expect(applyMock).toHaveBeenCalledWith(
      {
        bytes: Buffer.from("xlsx-bytes"),
        previewDigest: "preview-1",
        sourceFileSha256: "sha-1",
        audit: {
          actorUserId: "admin-1",
          actorSessionId: "session-1",
          requestId: "request-1",
        },
      },
      {
        id: "admin-1",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      },
    );
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: { imported: 1 },
    });
  });
});
