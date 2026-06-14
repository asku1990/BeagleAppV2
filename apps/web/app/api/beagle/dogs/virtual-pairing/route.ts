import { type NextRequest } from "next/server";
import { searchVirtualPairingDogs } from "@beagle/server";
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
    const field = request.nextUrl.searchParams.get("field");
    const query = request.nextUrl.searchParams.get("query") ?? "";

    const result = await searchVirtualPairingDogs({
      field:
        field === "ek" || field === "reg" || field === "name" ? field : "name",
      query,
      page: parseOptionalNumber(request.nextUrl.searchParams.get("page")),
      pageSize: parseOptionalNumber(
        request.nextUrl.searchParams.get("pageSize"),
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
        error: "Failed to load virtual pairing search results.",
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
