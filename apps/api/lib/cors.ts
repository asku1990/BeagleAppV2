import { NextResponse } from "next/server";

const origin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

function corsHeaders(methods: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    Vary: "Origin",
  };
}

export function optionsResponse(methods: string) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(methods) });
}

export function jsonResponse(
  body: unknown,
  init: { status?: number; methods?: string } = {},
) {
  const methods = init.methods ?? "GET,POST,OPTIONS";
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: corsHeaders(methods),
  });
}
