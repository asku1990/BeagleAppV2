import {
  getAdminDogProfileDb,
  loadDogEpiDiseaseFactsDb,
  loadDogPedigreeAncestryDb,
  type AdminDogProfileDb,
} from "@beagle/db";
import type {
  AdminDogProfileDto,
  AdminDogProfileResponse,
  AdminDogProfileSex,
  CurrentUserDto,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { toBusinessDateOnly } from "@server/core/date-only";
import { parseDogId } from "@server/dogs/core";
import {
  buildLitters,
  buildOffspringSummary,
} from "@db/dogs/profile/internal/offspring-litters";
import {
  getPrimaryRegistrationNo,
  mapParent,
  toSexCode,
} from "@db/dogs/profile/internal/profile-mappers";
import type { BeagleDogProfileSexDb } from "@db/dogs/profile/internal/profile-types";
import { calculateAdminDogEpiSummary } from "./internal/epi-risk";

type AdminDogProfileResult = ServiceResult<AdminDogProfileResponse>;

function mapSex(sex: BeagleDogProfileSexDb): AdminDogProfileSex {
  if (sex === "U") {
    return "MALE";
  }

  if (sex === "N") {
    return "FEMALE";
  }

  return "UNKNOWN";
}

function formatHealthSummary(
  diseases: AdminDogProfileDb["diseases"],
): string | null {
  const summary = [
    ...new Set(diseases.map((row) => row.diseaseText.trim()).filter(Boolean)),
  ];

  if (summary.length === 0) {
    return null;
  }

  return summary.join(", ");
}

function toAdminDogProfileDto(
  profile: AdminDogProfileDb,
  epiSummary: ReturnType<typeof calculateAdminDogEpiSummary>,
): AdminDogProfileDto {
  const sex = toSexCode(profile.base.sex);
  const litters = buildLitters(
    profile.base.id,
    sex,
    profile.base.whelpedPuppies,
    profile.base.siredPuppies,
  );

  return {
    id: profile.base.id,
    name: profile.base.name,
    registrationNo: getPrimaryRegistrationNo(profile.base.registrationNos),
    registrationNos: profile.base.registrationNos.map(
      (registration) => registration.registrationNo,
    ),
    birthDate: profile.base.birthDate
      ? toBusinessDateOnly(profile.base.birthDate)
      : null,
    sex: mapSex(sex),
    color: profile.base.color,
    ekNo: profile.base.ekNo,
    offspringCount: buildOffspringSummary(litters).puppyCount,
    offspringLitterCount: buildOffspringSummary(litters).litterCount,
    inbreedingCoefficientPct:
      profile.base.inbreedingCoefficientPct == null
        ? null
        : Number(profile.base.inbreedingCoefficientPct),
    epiLuku: epiSummary.epiLuku,
    epiTeksti: epiSummary.epiTeksti,
    laforaLuku: epiSummary.laforaLuku,
    epiRiskLuku: epiSummary.epiRiskLuku,
    healthSummary: formatHealthSummary(profile.diseases),
    diseases: profile.diseases,
    sire: mapParent(profile.base.sire),
    dam: mapParent(profile.base.dam),
    owners: profile.owners,
    breeder: profile.breeder,
    breederNameText: profile.base.breederNameText,
    note: profile.note,
  };
}

export async function getAdminDogProfile(
  dogId: string,
  currentUser: CurrentUserDto | null,
): Promise<AdminDogProfileResult> {
  const startedAt = Date.now();
  const parsedDogId = parseDogId(dogId);
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.getAdminDogProfile",
    ...(currentUser?.id ? { actorUserId: currentUser.id } : {}),
  });

  log.info(
    { event: "start", dogId: parsedDogId ?? dogId },
    "admin dog profile fetch started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog profile fetch rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  if (!parsedDogId) {
    return {
      status: 400,
      body: { ok: false, error: "Dog ID is required.", code: "INVALID_DOG_ID" },
    };
  }

  try {
    const profile = await getAdminDogProfileDb(parsedDogId);
    if (!profile) {
      log.info(
        {
          event: "not_found",
          dogId: parsedDogId,
          durationMs: Date.now() - startedAt,
        },
        "admin dog profile not found",
      );

      return {
        status: 404,
        body: {
          ok: false,
          error: "Dog profile not found.",
          code: "DOG_NOT_FOUND",
        },
      };
    }

    const ancestry = await loadDogPedigreeAncestryDb(parsedDogId, 5);
    const relatedDogIds = Object.keys(ancestry.nodes);
    const diseaseFacts = await loadDogEpiDiseaseFactsDb(relatedDogIds);
    const epiSummary = calculateAdminDogEpiSummary(
      parsedDogId,
      ancestry,
      diseaseFacts,
    );

    log.info(
      {
        event: "success",
        dogId: parsedDogId,
        durationMs: Date.now() - startedAt,
      },
      "admin dog profile fetch succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: { dog: toAdminDogProfileDto(profile, epiSummary) },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        dogId: parsedDogId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog profile fetch failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin dog profile.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
