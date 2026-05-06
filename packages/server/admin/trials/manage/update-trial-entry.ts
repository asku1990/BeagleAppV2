import type {
  CurrentUserDto,
  UpdateAdminTrialEntryRequest,
  UpdateAdminTrialEntryResponse,
} from "@beagle/contracts";
import { updateAdminTrialEntryWriteDb } from "@beagle/db";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

const VALID_KOETYYPIT = new Set(["NORMAL", "KOKOKAUDENKOE", "PITKAKOE"]);
const VALID_HUOMAUTUKSET = new Set(["LUOPUI", "SULJETTU", "KESKEYTETTY"]);

function isValidLisatietoCode(value: string): boolean {
  return /^[1-9]\d*$/.test(value.trim());
}

function normalizeRequiredId(value: string): string {
  return value.trim();
}

function normalizeNullableText(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeNullableInteger(
  value: number | null | undefined,
): number | null {
  if (value === null || typeof value === "undefined") {
    return null;
  }
  return Number.isInteger(value) ? value : null;
}

function isNullableInteger(value: unknown): value is number | null | undefined {
  return (
    value === null ||
    typeof value === "undefined" ||
    (typeof value === "number" &&
      Number.isSafeInteger(value) &&
      Number.isFinite(value))
  );
}

function normalizeNullableNumber(
  value: number | null | undefined,
): number | null {
  if (value === null || typeof value === "undefined") {
    return null;
  }
  return Number.isFinite(value) ? value : null;
}

function isNullableFiniteNumber(
  value: unknown,
): value is number | null | undefined {
  return (
    value === null ||
    typeof value === "undefined" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function hasContinuousEras(eras: number[]): boolean {
  if (eras.length === 0) {
    return false;
  }
  const sorted = [...eras].sort((left, right) => left - right);
  if (sorted[0] !== 1) {
    return false;
  }
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] !== sorted[index - 1] + 1) {
      return false;
    }
  }
  return true;
}

function badRequest(
  error: string,
  code: string,
): ServiceResult<UpdateAdminTrialEntryResponse> {
  return {
    status: 400,
    body: {
      ok: false,
      error,
      code,
    },
  };
}

export async function updateAdminTrialEntry(
  input: UpdateAdminTrialEntryRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<UpdateAdminTrialEntryResponse>> {
  const startedAt = Date.now();
  const trialEventId = normalizeRequiredId(input.trialEventId);
  const trialEntryId = normalizeRequiredId(input.trialEntryId);
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.updateAdminTrialEntry",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!trialEventId) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Trial event id is required.",
        code: "INVALID_TRIAL_EVENT_ID",
      },
    };
  }

  if (!trialEntryId) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Trial entry id is required.",
        code: "INVALID_TRIAL_ENTRY_ID",
      },
    };
  }

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  if (!input.eras.length) {
    return badRequest("At least one era is required.", "INVALID_ERAS");
  }

  const eraNumbers = input.eras.map((era) => era.era);
  if (
    eraNumbers.some(
      (era) => !Number.isSafeInteger(era) || !Number.isFinite(era) || era < 1,
    )
  ) {
    return badRequest(
      "Era numbers must be positive safe integers.",
      "INVALID_ERAS",
    );
  }

  if (new Set(eraNumbers).size !== eraNumbers.length) {
    return badRequest(
      "Duplicate era numbers are not allowed.",
      "DUPLICATE_ERAS",
    );
  }

  if (!hasContinuousEras(eraNumbers)) {
    return badRequest(
      "Eras must be continuous starting from 1.",
      "INVALID_ERAS",
    );
  }

  if (!VALID_KOETYYPIT.has(input.entry.koetyyppi)) {
    return badRequest("Unsupported koetyyppi.", "INVALID_KOETYYPPI");
  }

  if (
    input.entry.huomautus !== null &&
    typeof input.entry.huomautus !== "undefined" &&
    !VALID_HUOMAUTUKSET.has(input.entry.huomautus)
  ) {
    return badRequest("Unsupported huomautus.", "INVALID_HUOMAUTUS");
  }

  const entryIntegerFields = [
    input.entry.koiriaLuokassa,
    input.entry.hyvaksytytAjominuutit,
  ];
  if (!entryIntegerFields.every(isNullableInteger)) {
    return badRequest(
      "Integer fields must be safe integers or null.",
      "INVALID_INTEGER_FIELD",
    );
  }

  const entryNumberFields = [
    input.entry.points,
    input.entry.ajoajanPisteet,
    input.entry.haku,
    input.entry.hauk,
    input.entry.yva,
    input.entry.hlo,
    input.entry.alo,
    input.entry.tja,
    input.entry.pin,
    input.entry.ansiopisteetYhteensa,
    input.entry.tappiopisteetYhteensa,
  ];
  if (!entryNumberFields.every(isNullableFiniteNumber)) {
    return badRequest(
      "Numeric fields must be finite numbers or null.",
      "INVALID_NUMERIC_FIELD",
    );
  }

  for (const era of input.eras) {
    if (![era.hakumin, era.ajomin].every(isNullableInteger)) {
      return badRequest(
        "Era integer fields must be safe integers or null.",
        "INVALID_ERA_INTEGER_FIELD",
      );
    }
    if (
      ![era.haku, era.hauk, era.yva, era.hlo, era.alo, era.tja, era.pin].every(
        isNullableFiniteNumber,
      )
    ) {
      return badRequest(
        "Era numeric fields must be finite numbers or null.",
        "INVALID_ERA_NUMERIC_FIELD",
      );
    }
  }

  for (const row of input.lisatiedotRows) {
    const normalizedKoodi = normalizeNullableText(row.koodi);
    if (!normalizedKoodi || !isValidLisatietoCode(normalizedKoodi)) {
      return {
        status: 400,
        body: {
          ok: false,
          error: `Unsupported lisatieto code: ${row.koodi}`,
          code: "INVALID_LISATIETO_CODE",
        },
      };
    }

    for (const value of row.eraValues) {
      if (!eraNumbers.includes(value.era)) {
        return {
          status: 400,
          body: {
            ok: false,
            error: "Lisatiedot era value references unknown era.",
            code: "INVALID_LISATIETO_ERA",
          },
        };
      }
    }
  }

  const lisatiedotByEra = eraNumbers.map((era) => ({
    era,
    replaceKeys: input.lisatiedotRows.map((row) => ({
      koodi: normalizeNullableText(row.koodi) ?? row.koodi,
      osa: normalizeNullableText(row.osa) ?? "",
    })),
    items: input.lisatiedotRows
      .map((row) => {
        const eraValue = row.eraValues.find((value) => value.era === era);
        const normalizedArvo = normalizeNullableText(eraValue?.arvo ?? null);
        if (!normalizedArvo) {
          return null;
        }
        return {
          koodi: normalizeNullableText(row.koodi) ?? row.koodi,
          osa: normalizeNullableText(row.osa) ?? "",
          arvo: normalizedArvo,
          nimi: normalizeNullableText(row.nimi),
          jarjestys: normalizeNullableInteger(row.jarjestys),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  }));

  try {
    const result = await updateAdminTrialEntryWriteDb({
      trialEventId,
      trialEntryId,
      entry: {
        koemaasto: normalizeNullableText(input.entry.koemaasto),
        koemuoto: normalizeNullableText(input.entry.koemuoto),
        koetyyppi: input.entry.koetyyppi,
        ke: normalizeNullableText(input.entry.ke),
        lk: normalizeNullableText(input.entry.lk),
        award: normalizeNullableText(input.entry.award),
        rank: normalizeNullableText(input.entry.rank),
        points: normalizeNullableNumber(input.entry.points),
        koiriaLuokassa: normalizeNullableInteger(input.entry.koiriaLuokassa),
        hyvaksytytAjominuutit: normalizeNullableInteger(
          input.entry.hyvaksytytAjominuutit,
        ),
        ajoajanPisteet: normalizeNullableNumber(input.entry.ajoajanPisteet),
        haku: normalizeNullableNumber(input.entry.haku),
        hauk: normalizeNullableNumber(input.entry.hauk),
        yva: normalizeNullableNumber(input.entry.yva),
        hlo: normalizeNullableNumber(input.entry.hlo),
        alo: normalizeNullableNumber(input.entry.alo),
        tja: normalizeNullableNumber(input.entry.tja),
        pin: normalizeNullableNumber(input.entry.pin),
        ansiopisteetYhteensa: normalizeNullableNumber(
          input.entry.ansiopisteetYhteensa,
        ),
        tappiopisteetYhteensa: normalizeNullableNumber(
          input.entry.tappiopisteetYhteensa,
        ),
        judge: normalizeNullableText(input.entry.judge),
        huomautus: input.entry.huomautus ?? null,
        huomautusTeksti: normalizeNullableText(input.entry.huomautusTeksti),
        ylituomariNumeroSnapshot: normalizeNullableText(
          input.entry.ylituomariNumeroSnapshot,
        ),
        ryhmatuomariNimi: normalizeNullableText(input.entry.ryhmatuomariNimi),
        palkintotuomariNimi: normalizeNullableText(
          input.entry.palkintotuomariNimi,
        ),
        omistajaSnapshot: normalizeNullableText(input.entry.omistajaSnapshot),
        omistajanKotikuntaSnapshot: normalizeNullableText(
          input.entry.omistajanKotikuntaSnapshot,
        ),
      },
      eras: input.eras.map((era) => ({
        era: era.era,
        alkoi: normalizeNullableText(era.alkoi),
        hakumin: normalizeNullableInteger(era.hakumin),
        ajomin: normalizeNullableInteger(era.ajomin),
        haku: normalizeNullableNumber(era.haku),
        hauk: normalizeNullableNumber(era.hauk),
        yva: normalizeNullableNumber(era.yva),
        hlo: normalizeNullableNumber(era.hlo),
        alo: normalizeNullableNumber(era.alo),
        tja: normalizeNullableNumber(era.tja),
        pin: normalizeNullableNumber(era.pin),
        huomautusTeksti: normalizeNullableText(era.huomautusTeksti),
      })),
      lisatiedotByEra,
    });

    if (result.status === "not_found") {
      return {
        status: 404,
        body: {
          ok: false,
          error: "Entry not found in selected trial event.",
          code: "ENTRY_NOT_FOUND",
        },
      };
    }

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          trialEventId: result.trialEventId,
          trialEntryId: result.trialEntryId,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        trialEventId,
        trialEntryId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin trial entry update failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to update admin trial entry.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
