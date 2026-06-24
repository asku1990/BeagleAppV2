// Validates admin dog color selections before persistence.
// Keeps create/update behavior aligned while preserving an existing hidden or legacy color on update.

import type { ServiceResult } from "@server/core/result";
import type {
  CreateAdminDogResponse,
  UpdateAdminDogResponse,
} from "@beagle/contracts";
import {
  colorCodeNotFoundResponse,
  hiddenColorCodeResponse,
  legacyUnknownColorCodeResponse,
} from "./manage-responses";

type AdminDogColorOption = {
  status: "SELECTABLE" | "HIDDEN" | "LEGACY_UNKNOWN";
} | null;

type ColorValidationFailure<
  T extends CreateAdminDogResponse | UpdateAdminDogResponse,
> = {
  ok: false;
  logContext: Record<string, unknown>;
  logMessage: string;
  response: ServiceResult<T>;
};

type ColorValidationSuccess = {
  ok: true;
};

export type ColorValidationResult<
  T extends CreateAdminDogResponse | UpdateAdminDogResponse,
> = ColorValidationFailure<T> | ColorValidationSuccess;

export function validateAdminDogColorSelection<
  T extends CreateAdminDogResponse | UpdateAdminDogResponse,
>(
  colorCode: number,
  colorOption: AdminDogColorOption,
  existingColorCode?: number | null,
): ColorValidationResult<T> {
  if (colorOption === null) {
    return {
      ok: false,
      logContext: {
        event: "color_code_not_found",
        colorCode,
      },
      logMessage:
        "admin dog color validation rejected because color code was not found",
      response: colorCodeNotFoundResponse(),
    };
  }

  if (colorOption.status === "HIDDEN") {
    if (existingColorCode === colorCode) {
      return { ok: true };
    }

    return {
      ok: false,
      logContext: {
        event: "color_code_hidden",
        colorCode,
      },
      logMessage:
        "admin dog color validation rejected because color code is hidden",
      response: hiddenColorCodeResponse(),
    };
  }

  if (colorOption.status === "LEGACY_UNKNOWN") {
    if (existingColorCode === colorCode) {
      return { ok: true };
    }

    return {
      ok: false,
      logContext: {
        event: "color_code_legacy_unknown",
        colorCode,
      },
      logMessage:
        "admin dog color validation rejected because color code is a legacy unknown value",
      response: legacyUnknownColorCodeResponse(),
    };
  }

  return { ok: true };
}
