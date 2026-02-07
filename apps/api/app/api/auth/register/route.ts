import { authService } from "@beagle/server";
import type { RegisterRequest } from "@beagle/contracts";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("POST,OPTIONS");
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<RegisterRequest>;
  const result = await authService.register(body);
  return jsonResponse(result.body, { status: result.status });
}
