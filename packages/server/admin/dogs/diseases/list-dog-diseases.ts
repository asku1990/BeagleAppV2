import {
  listAdminDogDiseaseDefinitionsDb,
  listAdminDogDiseasesDb,
  type AdminDogDiseaseBrowseDogDb,
  type AdminDogDiseaseBrowseItemDb,
  type AdminDogDiseaseBrowseResponseDb,
} from "@beagle/db";
import type {
  AdminDogDiseaseBrowseRequest,
  AdminDogDiseaseBrowseItem,
  AdminDogDiseaseBrowseResponse,
  AdminDogDiseaseGroup,
  CurrentUserDto,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import {
  normalizeDiseaseSearchQuery,
  parseDiseaseBrowsePage,
  parseDiseaseBrowsePageSize,
  resolveSelectedDiseaseCode,
  resolveSelectedDiseaseGroup,
} from "./internal/browse-selection";

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
    selectedDiseaseGroup:
      response.selectedDiseaseGroup as AdminDogDiseaseGroup | null,
    query: response.query,
    total: response.total,
    totalPages: response.totalPages,
    page: response.page,
    diseaseGroupOptions: response.diseaseGroupOptions,
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
    const query = normalizeDiseaseSearchQuery(input.query);
    const page = parseDiseaseBrowsePage(input.page);
    const pageSize = parseDiseaseBrowsePageSize(undefined);
    const diseaseDefinitions = await listAdminDogDiseaseDefinitionsDb();
    const selectedDiseaseCode =
      input.diseaseCode === undefined
        ? null
        : resolveSelectedDiseaseCode(input.diseaseCode, diseaseDefinitions);
    const selectedDiseaseGroup = resolveSelectedDiseaseGroup(
      input,
      selectedDiseaseCode,
      diseaseDefinitions,
    );

    log.info(
      {
        event: "start",
        diseaseCode: selectedDiseaseCode,
        diseaseGroup: selectedDiseaseGroup,
        query,
        page,
      },
      "admin dog diseases browse started",
    );

    const result = await listAdminDogDiseasesDb(
      {
        selectedDiseaseCode,
        selectedDiseaseGroup,
        query,
        page,
        pageSize,
      },
      diseaseDefinitions,
    );

    const data = mapDiseaseResponse(result);

    log.info(
      {
        event: "success",
        selectedDiseaseCode: data.selectedDiseaseCode,
        selectedDiseaseGroup: data.selectedDiseaseGroup,
        query: data.query,
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
