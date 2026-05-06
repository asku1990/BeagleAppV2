import { trialsService, withLogContext } from "@beagle/server";
import { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";

const METHODS = "POST,OPTIONS";
const SECRET_ENV_NAME = "KOIRATIETOKANTA_RESULTS_API_SECRET";

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function getAuthLogState(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  return {
    hasAuthorizationHeader: Boolean(authorization),
    hasBearerToken: Boolean(getBearerToken(request)),
  };
}

function verifyBearerSecret(request: NextRequest):
  | { ok: true }
  | {
      ok: false;
      status: number;
      body: { ok: false; code: string; error: string };
    } {
  const expected = process.env[SECRET_ENV_NAME]?.trim();
  if (!expected) {
    return {
      ok: false,
      status: 500,
      body: {
        ok: false,
        code: "CONFIGURATION_ERROR",
        error: "Integration API secret is not configured.",
      },
    };
  }

  if (getBearerToken(request) !== expected) {
    return {
      ok: false,
      status: 401,
      body: {
        ok: false,
        code: "UNAUTHORIZED",
        error: "Invalid integration API credentials.",
      },
    };
  }

  return { ok: true };
}

export async function OPTIONS(request: NextRequest) {
  return optionsResponse(METHODS, {
    origin: request.headers.get("origin"),
  });
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const origin = request.headers.get("origin");
  const log = withLogContext({
    layer: "api",
    route: "koiratietokanta.ajok.upsert",
  });
  const auth = verifyBearerSecret(request);
  if (!auth.ok) {
    const logPayload = {
      event:
        auth.body.code === "CONFIGURATION_ERROR"
          ? "configuration_error"
          : "unauthorized",
      code: auth.body.code,
      status: auth.status,
      origin: origin ?? undefined,
      ...getAuthLogState(request),
      durationMs: Date.now() - startedAt,
    };
    if (auth.status >= 500) {
      log.error(logPayload, "koiratietokanta AJOK upsert route misconfigured");
    } else {
      log.warn(logPayload, "koiratietokanta AJOK upsert rejected by auth");
    }
    return jsonResponse(auth.body, {
      status: auth.status,
      methods: METHODS,
      origin,
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    log.warn(
      {
        event: "invalid_json",
        code: "INVALID_JSON",
        status: 400,
        origin: origin ?? undefined,
        durationMs: Date.now() - startedAt,
      },
      "koiratietokanta AJOK upsert rejected because JSON is invalid",
    );
    return jsonResponse(
      {
        ok: false,
        code: "INVALID_JSON",
        error: "Request body must be valid JSON.",
      },
      { status: 400, methods: METHODS, origin },
    );
  }

  const result = await trialsService.upsertKoiratietokantaAjokResult(
    payload as Record<string, unknown>,
  );
  const logPayload = {
    event: result.body.ok ? "completed" : "rejected",
    status: result.status,
    code: result.body.ok ? undefined : result.body.code,
    origin: origin ?? undefined,
    durationMs: Date.now() - startedAt,
  };
  if (result.status >= 500) {
    log.error(logPayload, "koiratietokanta AJOK upsert route failed");
  } else if (!result.body.ok) {
    log.warn(logPayload, "koiratietokanta AJOK upsert route rejected request");
  } else {
    log.info(logPayload, "koiratietokanta AJOK upsert route completed");
  }
  return jsonResponse(result.body, {
    status: result.status,
    methods: METHODS,
    origin,
  });
}
