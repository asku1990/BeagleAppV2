import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSessionCurrentUser } from "../current-user";

const { getSessionMock, headersMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  betterAuth: {
    api: {
      getSession: getSessionMock,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

describe("getSessionCurrentUser", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    headersMock.mockReset();
    headersMock.mockResolvedValue(new Headers());
  });

  it("returns null when session user is missing", async () => {
    getSessionMock.mockResolvedValue(null);

    await expect(getSessionCurrentUser()).resolves.toBeNull();
  });

  it("returns null when user id or email is missing", async () => {
    getSessionMock.mockResolvedValue({
      user: { id: "", email: "" },
    });

    await expect(getSessionCurrentUser()).resolves.toBeNull();
  });

  it("maps admin session user to dto", async () => {
    getSessionMock.mockResolvedValue({
      session: { id: "s_1" },
      user: {
        id: "u_1",
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN",
        createdAt: "2026-02-19T10:00:00.000Z",
      },
    });

    await expect(getSessionCurrentUser()).resolves.toEqual({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: "2026-02-19T10:00:00.000Z",
      sessionId: "s_1",
    });
  });

  it("maps unknown role to USER and nullable fields", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        id: "u_2",
        email: "user@example.com",
        name: undefined,
        role: "MANAGER",
        createdAt: null,
      },
    });

    await expect(getSessionCurrentUser()).resolves.toEqual({
      id: "u_2",
      email: "user@example.com",
      name: null,
      role: "USER",
      createdAt: null,
      sessionId: null,
    });
  });
});
