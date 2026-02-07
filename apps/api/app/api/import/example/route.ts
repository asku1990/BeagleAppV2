import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("GET,POST,OPTIONS");
}

export async function GET() {
  return jsonResponse({
    ok: true,
    data: { info: "Import feature is not implemented yet." },
  });
}

export async function POST() {
  return jsonResponse(
    { ok: false, error: "Import feature is not implemented yet." },
    { status: 501 },
  );
}
