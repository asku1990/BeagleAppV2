import { type NextRequest } from "next/server";
import { competitionsService } from "@beagle/server";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";

function parseSeason(value: string | null): number | undefined {
  if (value == null) return undefined;
  const normalized = value.trim();
  if (!/^\d{4}$/.test(normalized)) return Number.NaN;
  return Number.parseInt(normalized, 10);
}

export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(request: NextRequest) {
  const result = await competitionsService.getBestDriverRanking(
    { season: parseSeason(request.nextUrl.searchParams.get("season")) },
    { requestId: request.headers.get("x-request-id") ?? undefined },
  );
  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
    origin: request.headers.get("origin"),
  });
}
