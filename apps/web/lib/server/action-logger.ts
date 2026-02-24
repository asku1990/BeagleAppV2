import { withLogContext } from "@beagle/server";
import { headers } from "next/headers";

type CreateActionLoggerInput = {
  action: string;
  actorUserId?: string | null;
};

export async function createActionLogger(
  input: CreateActionLoggerInput,
): Promise<{
  log: ReturnType<typeof withLogContext>;
  requestId: string;
}> {
  let requestId: string | null = null;
  try {
    const requestHeaders = await headers();
    requestId = requestHeaders.get("x-request-id")?.trim() || null;
  } catch {
    requestId = null;
  }
  const resolvedRequestId = requestId || crypto.randomUUID();

  const log = withLogContext({
    layer: "action",
    action: input.action,
    requestId: resolvedRequestId,
    ...(input.actorUserId ? { actorUserId: input.actorUserId } : {}),
  });

  return { log, requestId: resolvedRequestId };
}
