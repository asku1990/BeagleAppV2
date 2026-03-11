import {
  type AuditContextDb,
  isInvalidImportRunIssuesCursorError,
  getImportRunById,
  listImportRunIssues,
} from "@beagle/db";
import type { ImportIssueSeverity } from "@beagle/db";
import type {
  ImportRunIssuesResponse,
  ImportRunResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../core/result";
import { runLegacyPhase1 } from "./phase1";
import { runLegacyPhase2 } from "./phase2";
import { runLegacyPhase3 } from "./phase3";
import { toImportRunIssueResponse, toImportRunResponse } from "./transform";

export function createImportsService() {
  return {
    async runLegacyPhase1(
      createdByUserId?: string,
      options?: {
        log?: (message: string) => void;
        auditSource?: AuditContextDb["source"];
      },
    ): Promise<ServiceResult<ImportRunResponse>> {
      return runLegacyPhase1(createdByUserId, options);
    },

    async runLegacyPhase2(
      createdByUserId?: string,
      options?: {
        log?: (message: string) => void;
        auditSource?: AuditContextDb["source"];
      },
    ): Promise<ServiceResult<ImportRunResponse>> {
      return runLegacyPhase2(createdByUserId, options);
    },

    async runLegacyPhase3(
      createdByUserId?: string,
      options?: {
        log?: (message: string) => void;
        auditSource?: AuditContextDb["source"];
      },
    ): Promise<ServiceResult<ImportRunResponse>> {
      return runLegacyPhase3(createdByUserId, options);
    },

    async getImportRun(id: string): Promise<ServiceResult<ImportRunResponse>> {
      const run = await getImportRunById(id);
      if (!run) {
        return {
          status: 404,
          body: { ok: false, error: "Import run not found." },
        };
      }

      return {
        status: 200,
        body: { ok: true, data: toImportRunResponse(run) },
      };
    },

    async getImportRunIssues(
      id: string,
      options?: {
        stage?: string;
        code?: string;
        severity?: ImportIssueSeverity;
        limit?: number;
        cursor?: string;
      },
    ): Promise<ServiceResult<ImportRunIssuesResponse>> {
      const run = await getImportRunById(id);
      if (!run) {
        return {
          status: 404,
          body: { ok: false, error: "Import run not found." },
        };
      }

      try {
        const result = await listImportRunIssues(id, options);
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              items: result.items.map(toImportRunIssueResponse),
              nextCursor: result.nextCursor,
            },
          },
        };
      } catch (error) {
        if (isInvalidImportRunIssuesCursorError(error)) {
          return {
            status: 400,
            body: { ok: false, error: "Invalid cursor." },
          };
        }
        throw error;
      }
    },
  };
}

export const importsService = createImportsService();
