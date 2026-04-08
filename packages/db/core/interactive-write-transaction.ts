// Shared interactive transaction budgets for write use-cases.
export const ADMIN_WRITE_TX_CONFIG = {
  maxWait: 5_000,
  timeout: 15_000,
} as const;

export const LONG_RUNNING_WRITE_TX_CONFIG = {
  maxWait: 10_000,
  timeout: 20_000,
} as const;
