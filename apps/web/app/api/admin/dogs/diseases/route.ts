import type { NextRequest } from "next/server";
import { listAdminDogDiseases } from "@beagle/server";
import { toAdminUserContext } from "@/lib/server/admin-user-context";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";
import { getSessionCurrentUser } from "@/lib/server/current-user";

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseDiseaseCode(value: string | null): string | null | undefined {
  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.toLowerCase() === "all") {
    return null;
  }

  return trimmed.length > 0 ? trimmed : undefined;
}

export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSessionCurrentUser();
    const diseaseCode = parseDiseaseCode(
      request.nextUrl.searchParams.get("diseaseCode"),
    );
    const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
    const page = parseOptionalNumber(request.nextUrl.searchParams.get("page"));

    const result = await listAdminDogDiseases(
      {
        diseaseCode,
        query,
        page,
      },
      toAdminUserContext(currentUser),
    );

    return jsonResponse(result.body, {
      status: result.status,
      methods: "GET,OPTIONS",
      origin: request.headers.get("origin"),
    });
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "Failed to load admin dog diseases.",
        code: "INTERNAL_ERROR",
      },
      {
        status: 500,
        methods: "GET,OPTIONS",
        origin: request.headers.get("origin"),
      },
    );
  }
}
