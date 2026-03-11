import mariadb, { type Connection } from "mariadb";

function getLegacyDatabaseUrl(): string {
  const value = process.env.LEGACY_DATABASE_URL;
  if (!value) {
    throw new Error("LEGACY_DATABASE_URL is not configured.");
  }
  return value;
}

// Opens a legacy MariaDB connection with shared env validation.
export async function connectLegacyDatabase(): Promise<Connection> {
  return mariadb.createConnection(getLegacyDatabaseUrl());
}
