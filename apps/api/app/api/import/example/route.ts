import { importDog } from "@beagle/domain";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("GET,POST,OPTIONS");
}

export async function GET() {
  return jsonResponse({
    ok: true,
    data: { info: "API import endpoint is active" },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; breed?: string };

  if (!body.name) {
    return jsonResponse(
      { ok: false, error: "name is required" },
      { status: 400 },
    );
  }

  const result = await importDog({ name: body.name, breed: body.breed });
  return jsonResponse({ ok: true, data: result }, { status: 201 });
}
