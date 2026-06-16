import {
  findVirtualPairingAncestorDetailsDb,
  findVirtualPairingDogByRegistrationNoDb,
  loadDogPedigreeAncestryForParentsDb,
  type VirtualPairingAncestorDetailsDb,
} from "@beagle/db";
import { loadDogDiseaseFactsDb } from "@beagle/db/dogs/core/epi-disease-facts";
import type { VirtualPairingDogOption } from "@beagle/contracts";
import type { DogHealthSummary } from "@server/dogs/core/disease-summary";
import {
  calculateDogHealthSummary,
  calculateInbreedingCoefficientBreakdownForParentsPct,
  getDogHealthDiseaseFactDogIds,
  getInbreedingAncestryLoadDepth,
  INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH,
} from "@server/dogs/core";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import type { InbreedingCoefficientBreakdownPct } from "@server/dogs/core/inbreeding-coefficient";
import { parseVirtualPairingGenerationDepth } from "./generation-depth";

export type VirtualPairingCalculationRequest = {
  sireRegistrationNo: string;
  damRegistrationNo: string;
  generationDepth?: number;
};

export type VirtualPairingCalculationCoreResult = {
  generationDepth: number;
  sire: VirtualPairingDogOption;
  dam: VirtualPairingDogOption;
  inbreedingCoefficientPct: number | null;
  rawInbreedingCoefficientPct: number | null;
  health: DogHealthSummary;
  diagnostics: InbreedingCoefficientBreakdownPct;
  ancestorDetailsById: Map<string, VirtualPairingAncestorDetailsDb>;
};

type CalculationResult = ServiceResult<VirtualPairingCalculationCoreResult>;

function normalizeRegistrationNo(value: string): string {
  return value.trim().toUpperCase();
}

function invalidSireRegistrationResponse(): CalculationResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Sire registration number was not found.",
      code: "INVALID_SIRE_REGISTRATION",
    },
  };
}

function invalidDamRegistrationResponse(): CalculationResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Dam registration number was not found.",
      code: "INVALID_DAM_REGISTRATION",
    },
  };
}

function invalidParentCombinationResponse(): CalculationResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Sire and dam must be different dogs.",
      code: "INVALID_PARENT_COMBINATION",
    },
  };
}

function invalidSireSexResponse(): CalculationResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Selected sire must be a male dog.",
      code: "INVALID_SIRE_SEX",
    },
  };
}

function invalidDamSexResponse(): CalculationResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Selected dam must be a female dog.",
      code: "INVALID_DAM_SEX",
    },
  };
}

function internalErrorResponse(): CalculationResult {
  return {
    status: 500,
    body: {
      ok: false,
      error: "Failed to calculate virtual pairing data.",
      code: "INTERNAL_ERROR",
    },
  };
}

function toDogOption(
  row: NonNullable<
    Awaited<ReturnType<typeof findVirtualPairingDogByRegistrationNoDb>>
  >,
): VirtualPairingDogOption {
  return {
    id: row.id,
    ekNo: row.ekNo,
    registrationNo: row.registrationNo,
    name: row.name,
    sex: row.sex === "MALE" ? "U" : row.sex === "FEMALE" ? "N" : "-",
  };
}

function buildVirtualRootAncestry(
  ancestry: Awaited<ReturnType<typeof loadDogPedigreeAncestryForParentsDb>>,
  sireId: string,
  damId: string,
) {
  const rootId = `virtual:${sireId}:${damId}`;

  return {
    rootId,
    nodes: {
      ...ancestry.nodes,
      [rootId]: {
        id: rootId,
        sireId,
        damId,
      },
    },
  };
}

export async function calculateVirtualPairing(
  input: VirtualPairingCalculationRequest,
): Promise<CalculationResult> {
  const startedAt = Date.now();
  const sireRegistrationNo = normalizeRegistrationNo(input.sireRegistrationNo);
  const damRegistrationNo = normalizeRegistrationNo(input.damRegistrationNo);
  const generationDepth = parseVirtualPairingGenerationDepth(
    input.generationDepth,
  );
  const log = withLogContext({
    layer: "service",
    useCase: "dogs.calculateVirtualPairing",
  });

  log.info(
    {
      event: "start",
      hasSireRegistrationNo: Boolean(sireRegistrationNo),
      hasDamRegistrationNo: Boolean(damRegistrationNo),
      generationDepth,
    },
    "virtual pairing calculation started",
  );

  if (!sireRegistrationNo) {
    return invalidSireRegistrationResponse();
  }

  if (!damRegistrationNo) {
    return invalidDamRegistrationResponse();
  }

  try {
    const sireRow =
      await findVirtualPairingDogByRegistrationNoDb(sireRegistrationNo);
    if (!sireRow) {
      return invalidSireRegistrationResponse();
    }

    const damRow =
      await findVirtualPairingDogByRegistrationNoDb(damRegistrationNo);
    if (!damRow) {
      return invalidDamRegistrationResponse();
    }

    if (sireRow.id === damRow.id) {
      return invalidParentCombinationResponse();
    }

    if (sireRow.sex !== "MALE") {
      return invalidSireSexResponse();
    }

    if (damRow.sex !== "FEMALE") {
      return invalidDamSexResponse();
    }

    const ancestry = await loadDogPedigreeAncestryForParentsDb(
      sireRow.id,
      damRow.id,
      getInbreedingAncestryLoadDepth(
        generationDepth,
        INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH,
      ),
    );
    const healthAncestry = buildVirtualRootAncestry(
      ancestry,
      sireRow.id,
      damRow.id,
    );
    const diseaseFacts = await loadDogDiseaseFactsDb(
      getDogHealthDiseaseFactDogIds(healthAncestry.rootId, healthAncestry),
      ["epi", "lepis", "lepik", "lepit", "pur", "ap", "yp", "rp"],
    );
    const diagnostics = calculateInbreedingCoefficientBreakdownForParentsPct(
      sireRow.id,
      damRow.id,
      ancestry,
      generationDepth,
      { ancestorInbreedingDepth: INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH },
    );
    const health = calculateDogHealthSummary(
      healthAncestry.rootId,
      healthAncestry,
      diseaseFacts,
    );
    const ancestorDetails = await findVirtualPairingAncestorDetailsDb(
      diagnostics.contributions.map((contribution) => contribution.id),
    );
    const ancestorDetailsById = new Map<
      string,
      VirtualPairingAncestorDetailsDb
    >(ancestorDetails.map((detail) => [detail.id, detail]));

    const sire = toDogOption(sireRow);
    const dam = toDogOption(damRow);
    const rawInbreedingCoefficientPct = diagnostics.contributions.reduce(
      (sum, contribution) => sum + contribution.rawContributionPct,
      0,
    );

    log.info(
      {
        event: "success",
        sireId: sire.id,
        damId: dam.id,
        generationDepth,
        durationMs: Date.now() - startedAt,
      },
      "virtual pairing calculation succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          generationDepth,
          sire,
          dam,
          inbreedingCoefficientPct: diagnostics.contributionPct,
          rawInbreedingCoefficientPct,
          health,
          diagnostics,
          ancestorDetailsById,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "virtual pairing calculation failed",
    );

    return internalErrorResponse();
  }
}
