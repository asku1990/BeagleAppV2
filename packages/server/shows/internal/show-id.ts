const SHOW_ID_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type ShowIdPayload = {
  d: string;
  p: string;
};

export type ParsedShowId = {
  eventDateIsoDate: string;
  eventDate: Date;
  eventPlace: string;
};

function parseIsoDateOnlyToUtcDate(value: string): Date | null {
  if (!SHOW_ID_DATE_PATTERN.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const normalized = `${year}-${month}-${day}`;
  return normalized === value ? date : null;
}

export function encodeShowId(
  eventDateIsoDate: string,
  eventPlace: string,
): string {
  const payload: ShowIdPayload = {
    d: eventDateIsoDate,
    p: eventPlace,
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
  const eventPlace =
    typeof parsedPayload.p === "string" ? parsedPayload.p.trim() : "";

  if (!eventDateIsoDate || !eventPlace) {
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
