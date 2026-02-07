import { authService } from "@beagle/server";
import type { RegisterRequest } from "@beagle/contracts";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("POST,OPTIONS");
}

export async function POST(request: Request) {
  let body: Partial<RegisterRequest>;
  try {
    body = (await request.json()) as Partial<RegisterRequest>;
  } catch {
    return jsonResponse(
      { ok: false, error: "Invalid JSON body." },
      { status: 400, methods: "POST,OPTIONS" },
    );
  }
  const result = await authService.register(body);
  return jsonResponse(result.body, {
    status: result.status,
    methods: "POST,OPTIONS",
  });
}
