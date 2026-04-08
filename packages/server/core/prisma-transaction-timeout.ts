type PrismaLikeError = {
  message?: unknown;
};

export function isPrismaTransactionTimeoutError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const prismaLikeError = error as PrismaLikeError;
  const message =
    typeof prismaLikeError.message === "string"
      ? prismaLikeError.message.toLowerCase()
      : "";

  return (
    /transaction.*expired/i.test(message) ||
    /unable to start a transaction in the given time/i.test(message)
  );
}
