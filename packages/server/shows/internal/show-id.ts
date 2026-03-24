import { parseIsoDateOnlyToUtcDate } from "./iso-date";

type ShowIdPayload = {
  d: string;
  p: string;
  k?: string;
};

export type ParsedShowId = {
  eventDateIsoDate: string;
  eventDate: Date;
  eventPlace: string;
  eventKey: string | null;
};

export function encodeShowId(
  eventDateIsoDate: string,
  eventPlace: string,
  eventKey?: string,
): string {
  const payload: ShowIdPayload = {
    d: eventDateIsoDate,
    p: eventPlace,
    ...(eventKey?.trim() ? { k: eventKey.trim() } : {}),
  };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function parseShowId(value: string): ParsedShowId | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  let decoded: string;
  try {
    decoded = Buffer.from(normalized, "base64url").toString("utf8");
  } catch {
    return null;
  }

  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(decoded);
  } catch {
    return null;
  }

  if (
    !parsedPayload ||
    typeof parsedPayload !== "object" ||
    !("d" in parsedPayload) ||
    !("p" in parsedPayload)
  ) {
    return null;
  }

  const eventDateIsoDate =
    typeof parsedPayload.d === "string" ? parsedPayload.d.trim() : "";
  const eventPlace = typeof parsedPayload.p === "string" ? parsedPayload.p : "";
  const eventKey =
    "k" in parsedPayload && typeof parsedPayload.k === "string"
      ? parsedPayload.k.trim() || null
      : null;

  if (!eventDateIsoDate || eventPlace.trim().length === 0) {
    return null;
  }

  const eventDate = parseIsoDateOnlyToUtcDate(eventDateIsoDate);
  if (!eventDate) {
    return null;
  }

  return {
    eventDateIsoDate,
    eventDate,
    eventPlace,
    eventKey,
  };
}
