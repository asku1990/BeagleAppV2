import type {
  ImportIssueSeverity,
  ImportRunIssuesResponse,
} from "@beagle/contracts";
import type { RequestFn } from "../core/request";

type GetImportRunIssuesOptions = {
  stage?: string;
  code?: string;
  severity?: ImportIssueSeverity;
  cursor?: string;
  limit?: number;
};

export function getImportRunIssues(
  request: RequestFn,
  id: string,
  options?: GetImportRunIssuesOptions,
) {
  const params = new URLSearchParams();
  if (options?.stage) params.set("stage", options.stage);
  if (options?.code) params.set("code", options.code);
  if (options?.severity) params.set("severity", options.severity);
  if (options?.cursor) params.set("cursor", options.cursor);
  if (typeof options?.limit === "number") {
    params.set("limit", String(options.limit));
  }
  const query = params.toString();
  const path = `/api/v1/imports/${id}/issues${query ? `?${query}` : ""}`;

  return request<ImportRunIssuesResponse>(path, {
    method: "GET",
  });
}
