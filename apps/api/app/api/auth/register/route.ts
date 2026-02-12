import { authService } from "@beagle/server";
import type { RegisterRequest } from "@beagle/contracts";
import { jsonResponse, optionsResponse } from "@/lib/cors";

// Access policy: public route.
export async function OPTIONS(request: Request) {
  return optionsResponse("POST,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  let body: Partial<RegisterRequest>;
  try {
    body = (await request.json()) as Partial<RegisterRequest>;
  } catch {
    return jsonResponse(
      { ok: false, error: "Invalid JSON body." },
      { status: 400, methods: "POST,OPTIONS", origin },
    );
  }
  const result = await authService.register(body);
  return jsonResponse(result.body, {
    status: result.status,
    methods: "POST,OPTIONS",
    origin,
  });
}
