export class AdminMutationError extends Error {
  readonly errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AdminMutationError";
    this.errorCode = errorCode;
  }
}
