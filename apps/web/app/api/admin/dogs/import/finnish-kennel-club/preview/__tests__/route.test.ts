import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { previewMock, currentUserMock } = vi.hoisted(() => ({
  previewMock: vi.fn(),
  currentUserMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  previewFinnishKennelClubDogImport: previewMock,
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

function requestWithFile(name = "dogs.xlsx") {
  const form = new FormData();
  form.set("file", new File(["xlsx-bytes"], name));
  return new NextRequest("http://localhost/api/admin/dogs/import/preview", {
    method: "POST",
    body: form,
    headers: { origin: "http://localhost:3000" },
  });
}

describe("Finnish Kennel Club dog import preview route", () => {
  beforeEach(() => {
    previewMock.mockReset();
    currentUserMock.mockReset();
  });

  it("rejects a form without an xlsx file", async () => {
    currentUserMock.mockResolvedValue(user);
    const response = await (
      await import("../route")
    ).POST(requestWithFile("dogs.csv"));

    expect(response.status).toBe(400);
    expect(previewMock).not.toHaveBeenCalled();
  });

  it("forwards the file and current user context to the server", async () => {
    currentUserMock.mockResolvedValue(user);
    previewMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { previewDigest: "digest-1" } },
    });

    const response = await (await import("../route")).POST(requestWithFile());

    expect(response.status).toBe(200);
    expect(previewMock).toHaveBeenCalledWith(
      { bytes: Buffer.from("xlsx-bytes"), fileName: "dogs.xlsx" },
      {
        id: "admin-1",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      },
    );
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: { previewDigest: "digest-1" },
    });
  });
});
