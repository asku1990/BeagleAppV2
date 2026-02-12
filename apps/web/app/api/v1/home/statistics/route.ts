import { statsService } from "@beagle/server";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";

export const dynamic = "force-dynamic";

// Access policy: public route.
export async function OPTIONS(request: Request) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(request: Request) {
  const result = await statsService.getHomeStatistics();
  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
    origin: request.headers.get("origin"),
  });
}
