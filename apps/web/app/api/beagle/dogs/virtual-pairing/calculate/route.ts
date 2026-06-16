import { type NextRequest } from "next/server";
import { calculatePublicVirtualPairing } from "@beagle/server";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(request: NextRequest) {
  try {
    const sireRegistrationNo =
      request.nextUrl.searchParams.get("sireRegistrationNo") ?? "";
    const damRegistrationNo =
      request.nextUrl.searchParams.get("damRegistrationNo") ?? "";

    const result = await calculatePublicVirtualPairing({
      sireRegistrationNo,
      damRegistrationNo,
      generationDepth: parseOptionalNumber(
        request.nextUrl.searchParams.get("generationDepth"),
      ),
    });

    return jsonResponse(result.body, {
      status: result.status,
      methods: "GET,OPTIONS",
      origin: request.headers.get("origin"),
    });
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "Failed to calculate virtual pairing data.",
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
