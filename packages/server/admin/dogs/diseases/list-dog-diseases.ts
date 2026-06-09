import {
  listAdminDogDiseasesDb,
  type AdminDogDiseaseBrowseDogDb,
  type AdminDogDiseaseBrowseItemDb,
  type AdminDogDiseaseBrowseResponseDb,
} from "@beagle/db";
import type {
  AdminDogDiseaseBrowseRequest,
  AdminDogDiseaseBrowseItem,
  AdminDogDiseaseBrowseResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

const UNKNOWN_NAME = "Nimi ei ole tiedossa";

function toSex(
  value: AdminDogDiseaseBrowseDogDb["sex"],
): AdminDogDiseaseBrowseItem["sex"] {
  if (value === "MALE") {
    return "MALE";
  }

  if (value === "FEMALE") {
    return "FEMALE";
  }

  if (value === "UNKNOWN") {
    return "UNKNOWN";
  }

  return null;
}

function mapDiseaseItem(
  row: AdminDogDiseaseBrowseItemDb,
): AdminDogDiseaseBrowseItem {
  const isDog = row.evidenceKind === "DOG" && Boolean(row.dog);

  return {
    id: row.id,
    evidenceKind: row.evidenceKind,
    diseaseCode: row.sairaus.koodi,
    diseaseText: row.sairaus.sairausTeksti,
    pentue: row.pentue,
    kuvaus: row.kuvaus,
    public: row.julkinen,
    registrationNo: row.rekisterinumero,
    tietolahde: row.tietolahde,
    ekNo: isDog ? (row.dog?.ekNo ?? null) : null,
    sex: isDog && row.dog ? toSex(row.dog.sex) : null,
    name: isDog ? row.dog?.name?.trim() || UNKNOWN_NAME : UNKNOWN_NAME,
    dogId: isDog ? (row.dog?.id ?? null) : null,
    trialCount: isDog ? (row.dog?._count.trialResults ?? null) : null,
    showCount: isDog ? (row.dog?._count.showEntries ?? null) : null,
    sire: row.sire,
    dam: row.dam,
  };
}

function mapDiseaseResponse(
  response: AdminDogDiseaseBrowseResponseDb,
): AdminDogDiseaseBrowseResponse {
  return {
    selectedDiseaseCode: response.selectedDiseaseCode,
    total: response.total,
    totalPages: response.totalPages,
    page: response.page,
    diseaseOptions: response.diseaseOptions,
    items: response.items.map(mapDiseaseItem),
  };
}

export async function listAdminDogDiseases(
  input: AdminDogDiseaseBrowseRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminDogDiseaseBrowseResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.listAdminDogDiseases",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  log.info(
    {
      event: "start",
      diseaseCode: input.diseaseCode ?? null,
      page: input.page ?? 1,
    },
    "admin dog diseases browse started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog diseases browse rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  try {
    const result = await listAdminDogDiseasesDb({
      diseaseCode: input.diseaseCode ?? undefined,
      page: input.page,
      pageSize: 15,
    });

    const data = mapDiseaseResponse(result);

    log.info(
      {
        event: "success",
        selectedDiseaseCode: data.selectedDiseaseCode,
        total: data.total,
        itemCount: data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "admin dog diseases browse succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data,
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog diseases browse failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin dog diseases.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
