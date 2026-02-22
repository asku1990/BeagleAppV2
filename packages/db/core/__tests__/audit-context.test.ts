import { beforeEach, describe, expect, it, vi } from "vitest";

const { executeRawMock, transactionMock, prismaMock } = vi.hoisted(() => {
  const executeRaw = vi.fn();
  const transaction = vi.fn((cb) => cb(prismaMock));

  const client = {
    $executeRaw: executeRaw,
    $transaction: transaction,
  };

  return {
    executeRawMock: executeRaw,
    transactionMock: transaction,
    prismaMock: client,
  };
});

vi.mock("../prisma", () => ({
  prisma: prismaMock,
}));

import { runInAuditContextDb } from "../audit-context";

describe("runInAuditContextDb", () => {
  beforeEach(() => {
    executeRawMock.mockReset();
    transactionMock.mockClear();
  });

  it("calls set_config for actorUserId, actorSessionId, and source inside a transaction", async () => {
    const callback = vi.fn().mockResolvedValue("result");

    const result = await runInAuditContextDb(
      {
        actorUserId: "user-123",
        actorSessionId: "session-456",
        source: "WEB",
      },
      callback,
    );

    expect(result).toBe("result");

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(executeRawMock).toHaveBeenCalledTimes(3);

    const calls = executeRawMock.mock.calls;

    // Tagged template literals receive: (strings: TemplateStringsArray, ...values: any[])
    expect(calls[0]?.[0]?.join("")).toContain("app.audit.actor_user_id");
    expect(calls[0]?.[1]).toBe("user-123");

    expect(calls[1]?.[0]?.join("")).toContain("app.audit.actor_session_id");
    expect(calls[1]?.[1]).toBe("session-456");

    expect(calls[2]?.[0]?.join("")).toContain("app.audit.source");
    expect(calls[2]?.[1]).toBe("WEB");

    expect(callback).toHaveBeenCalledWith(prismaMock);
  });

  it("normalizes default or missing values", async () => {
    const callback = vi.fn().mockResolvedValue("result");

    await runInAuditContextDb({}, callback);

    expect(executeRawMock).toHaveBeenCalledTimes(3);

    const calls = executeRawMock.mock.calls;
    expect(calls[0]?.[1]).toBe("");
    expect(calls[1]?.[1]).toBe("");
    expect(calls[2]?.[1]).toBe("SYSTEM");
  });

  it("normalizes unknown source to SYSTEM", async () => {
    const callback = vi.fn().mockResolvedValue("result");

    await runInAuditContextDb(
      { source: "INVALID" as unknown as "WEB" },
      callback,
    );

    const calls = executeRawMock.mock.calls;
    expect(calls[2]?.[1]).toBe("SYSTEM");
  });
});
