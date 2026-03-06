import { parseIsoDateOnlyToUtcDate } from "./iso-date";

type TrialIdPayload = {
  d: string;
  p: string;
};

export type ParsedTrialId = {
  eventDateIsoDate: string;
  eventDate: Date;
  eventPlace: string;
};

export function encodeTrialId(
  eventDateIsoDate: string,
  eventPlace: string,
): string {
  const payload: TrialIdPayload = {
    d: eventDateIsoDate,
    p: eventPlace,
  };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function parseTrialId(value: string): ParsedTrialId | null {
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
  };
}
