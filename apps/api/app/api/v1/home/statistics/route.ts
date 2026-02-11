import { statsService } from "@beagle/server";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return optionsResponse("GET,OPTIONS");
}

export async function GET() {
  const result = await statsService.getHomeStatistics();
  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
  });
}
