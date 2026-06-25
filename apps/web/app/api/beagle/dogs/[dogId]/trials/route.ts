import { type NextRequest } from "next/server";
import { dogsService } from "@beagle/server";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";

type RouteParams = {
  params: Promise<{
    dogId: string;
  }>;
};

export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { dogId } = await params;
  const result = await dogsService.getBeagleDogTrials(dogId);
  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
    origin: request.headers.get("origin"),
  });
}
