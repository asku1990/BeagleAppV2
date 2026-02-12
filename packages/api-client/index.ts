import type {
  ImportIssueSeverity,
  LoginRequest,
  RegisterRequest,
} from "@beagle/contracts";
import { login } from "./auth/login";
import { logout } from "./auth/logout";
import { me } from "./auth/me";
import { register } from "./auth/register";
import type { ClientOptions } from "./core/client-options";
import { createRequest } from "./core/request";
import { getHomeStatistics } from "./home/get-home-statistics";
import { getImportRun } from "./imports/get-import-run";
import { getImportRunIssues } from "./imports/get-import-run-issues";

export function createApiClient(options: ClientOptions = {}) {
  const request = createRequest(options);

  return {
    login(input: LoginRequest) {
      return login(request, input);
    },

    register(input: RegisterRequest) {
      return register(request, input);
    },

    me() {
      return me(request);
    },

    logout() {
      return logout(request);
    },

    getHomeStatistics() {
      return getHomeStatistics(request);
    },

    getImportRun(id: string) {
      return getImportRun(request, id);
    },

    getImportRunIssues(
      id: string,
      options?: {
        stage?: string;
        code?: string;
        severity?: ImportIssueSeverity;
        cursor?: string;
        limit?: number;
      },
    ) {
      return getImportRunIssues(request, id, options);
    },
  };
}
