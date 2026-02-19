import { afterEach, describe, expect, it, vi } from "vitest";

const { deleteMock, getMock, patchMock, postMock, putMock } = vi.hoisted(
  () => ({
    getMock: vi.fn(),
    postMock: vi.fn(),
    patchMock: vi.fn(),
    putMock: vi.fn(),
    deleteMock: vi.fn(),
  }),
);
const ORIGINAL_CORS_ORIGINS = process.env.CORS_ORIGINS;

vi.mock("@beagle/server", () => ({
  betterAuth: {
    handler: vi.fn(),
  },
}));

vi.mock("better-auth/next-js", () => ({
  toNextJsHandler: vi.fn(() => ({
    GET: getMock,
    POST: postMock,
    PATCH: patchMock,
    PUT: putMock,
    DELETE: deleteMock,
  })),
}));

describe("better auth catch-all route", () => {
  afterEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    putMock.mockReset();
    deleteMock.mockReset();

    if (ORIGINAL_CORS_ORIGINS === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = ORIGINAL_CORS_ORIGINS;
    }
  });

  it("returns preflight response with expected CORS headers", async () => {
    process.env.CORS_ORIGINS = "http://localhost:3000,http://admin.local";
    const { OPTIONS } = await import("../route");

    const response = await OPTIONS(
      new Request("http://localhost:3000/api/auth/sign-in/email", {
        method: "OPTIONS",
        headers: {
          origin: "http://admin.local",
        },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://admin.local",
    );
    expect(response.headers.get("access-control-allow-methods")).toBe(
      "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    );
  });

  it("applies CORS headers to auth handler responses", async () => {
    process.env.CORS_ORIGINS = "http://localhost:3000,http://admin.local";
    postMock.mockResolvedValue(
      new Response(
        JSON.stringify({ ok: false, error: "Invalid credentials" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );
    const { POST } = await import("../route");

    const request = new Request(
      "http://localhost:3000/api/auth/sign-in/email",
      {
        method: "POST",
        headers: {
          origin: "http://admin.local",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "bad-password",
        }),
      },
    );
    const response = await POST(request);

    expect(postMock).toHaveBeenCalledWith(request);
    expect(response.status).toBe(401);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://admin.local",
    );
    expect(response.headers.get("access-control-allow-credentials")).toBe(
      "true",
    );
  });

  it("applies CORS headers to all auth HTTP methods", async () => {
    process.env.CORS_ORIGINS = "http://localhost:3000,http://admin.local";
    getMock.mockResolvedValue(new Response("ok-get"));
    patchMock.mockResolvedValue(new Response("ok-patch"));
    putMock.mockResolvedValue(new Response("ok-put"));
    deleteMock.mockResolvedValue(new Response("ok-delete"));
    const route = await import("../route");

    const request = new Request("http://localhost:3000/api/auth/session", {
      headers: { origin: "http://admin.local" },
    });

    const getResponse = await route.GET(request);
    const patchResponse = await route.PATCH(request);
    const putResponse = await route.PUT(request);
    const deleteResponse = await route.DELETE(request);

    expect(getMock).toHaveBeenCalledWith(request);
    expect(patchMock).toHaveBeenCalledWith(request);
    expect(putMock).toHaveBeenCalledWith(request);
    expect(deleteMock).toHaveBeenCalledWith(request);

    expect(getResponse.headers.get("access-control-allow-origin")).toBe(
      "http://admin.local",
    );
    expect(patchResponse.headers.get("access-control-allow-origin")).toBe(
      "http://admin.local",
    );
    expect(putResponse.headers.get("access-control-allow-origin")).toBe(
      "http://admin.local",
    );
    expect(deleteResponse.headers.get("access-control-allow-origin")).toBe(
      "http://admin.local",
    );
  });
});
