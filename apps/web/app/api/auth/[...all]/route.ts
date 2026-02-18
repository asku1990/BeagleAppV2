import { betterAuth } from "@beagle/server";
import { toNextJsHandler } from "better-auth/next-js";
import { optionsResponse, withCorsHeaders } from "@/lib/server/cors";

const handler = toNextJsHandler(betterAuth.handler);
const AUTH_METHODS = "GET,POST,PATCH,PUT,DELETE,OPTIONS";

async function withAuthCors(
  request: Request,
  methodHandler: (request: Request) => Promise<Response>,
) {
  const response = await methodHandler(request);
  return withCorsHeaders(response, {
    methods: AUTH_METHODS,
    origin: request.headers.get("origin"),
  });
}

export async function OPTIONS(request: Request) {
  return optionsResponse(AUTH_METHODS, {
    origin: request.headers.get("origin"),
  });
}

export async function GET(request: Request) {
  return withAuthCors(request, handler.GET);
}

export async function POST(request: Request) {
  return withAuthCors(request, handler.POST);
}

export async function PATCH(request: Request) {
  return withAuthCors(request, handler.PATCH);
}

export async function PUT(request: Request) {
  return withAuthCors(request, handler.PUT);
}

export async function DELETE(request: Request) {
  return withAuthCors(request, handler.DELETE);
}
