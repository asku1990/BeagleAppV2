import { betterAuth } from "@beagle/server";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(betterAuth.handler);

export const GET = handler.GET;
export const POST = handler.POST;
export const PATCH = handler.PATCH;
export const PUT = handler.PUT;
export const DELETE = handler.DELETE;
