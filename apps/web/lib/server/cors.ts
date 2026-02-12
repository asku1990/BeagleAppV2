import { NextResponse } from "next/server";

function getAllowedOrigins(): string[] {
  const fromList = process.env.CORS_ORIGINS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (fromList && fromList.length > 0) {
    return fromList;
  }

  return ["http://localhost:3000"];
}

function resolveAllowedOrigin(origin: string | null): string | null {
  if (!origin) {
    return null;
  }

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin) ? origin : null;
}

function corsHeaders(methods: string, origin: string | null) {
  const allowedOrigin = resolveAllowedOrigin(origin);
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function optionsResponse(
  methods: string,
  init: { origin?: string | null } = {},
) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(methods, init.origin ?? null),
  });
}

export function jsonResponse(
  body: unknown,
  init: { status?: number; methods?: string; origin?: string | null } = {},
) {
  const methods = init.methods ?? "GET,POST,OPTIONS";
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: corsHeaders(methods, init.origin ?? null),
  });
}
