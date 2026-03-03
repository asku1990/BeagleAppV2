import pino, { type Logger } from "pino";

const env = process.env.NODE_ENV ?? "development";

const REDACT_PATHS = [
  "password",
  "*.password",
  "newPassword",
  "*.newPassword",
  "token",
  "*.token",
  "authorization",
  "*.authorization",
  "cookie",
  "*.cookie",
] as const;

function createLogger(): Logger {
  return pino({
    level: process.env.LOG_LEVEL ?? (env === "production" ? "info" : "debug"),
    base: {
      service: "beagle-server",
      env,
    },
    redact: {
      paths: [...REDACT_PATHS],
      censor: "[Redacted]",
    },
    transport:
      env === "production"
        ? undefined
        : {
            target: "pino-pretty",
            options: {
              colorize: true,
              singleLine: true,
              translateTime: "SYS:standard",
            },
          },
  });
}

export const logger = createLogger();

export function withLogContext(context: Record<string, unknown>): Logger {
  return logger.child(context);
}

type ErrorLog = {
  type: string;
  message: string;
  stack?: string;
};

export function toErrorLog(error: unknown): { error: ErrorLog } {
  if (error instanceof Error) {
    return {
      error: {
        type: error.name,
        message: error.message,
        stack: error.stack,
      },
    };
  }

  if (error && typeof error === "object") {
    const message =
      "message" in error && typeof error.message === "string"
        ? error.message
        : null;
    if (!message) {
      return {
        error: {
          type: "NonErrorThrownValue",
          message: String(error),
        },
      };
    }

    const name =
      "name" in error && typeof error.name === "string"
        ? error.name
        : "UnknownObjectError";

    return {
      error: {
        type: name,
        message,
      },
    };
  }

  return {
    error: {
      type: "NonErrorThrownValue",
      message: String(error),
    },
  };
}
