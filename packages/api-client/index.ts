import type {
  ApiResult,
  CurrentUserDto,
  ImportRunIssuesResponse,
  ImportRunResponse,
  ImportStatusResponse,
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
} from "@beagle/contracts";

type ClientOptions = {
  baseUrl?: string;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
};

async function parseJson<T>(response: Response): Promise<ApiResult<T>> {
  const payload = (await response.json()) as ApiResult<T>;
  if (!response.ok && payload.ok) {
    return { ok: false, error: "Unexpected response payload." };
  }
  return payload;
}

export function createApiClient(options: ClientOptions = {}) {
  const baseUrl =
    options.baseUrl ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001";
  const credentials = options.credentials ?? "include";

  async function request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<ApiResult<T>> {
    const headers = new Headers(options.headers ?? {});
    if (init.headers) {
      new Headers(init.headers).forEach((value, key) =>
        headers.set(key, value),
      );
    }
    if (init.body != null && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      credentials,
      headers,
    });

    return parseJson<T>(response);
  }

  return {
    login(input: LoginRequest) {
      return request<CurrentUserDto>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },

    register(input: RegisterRequest) {
      return request<{ id: string; email: string; role: string }>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      );
    },

    me() {
      return request<CurrentUserDto>("/api/auth/me", { method: "GET" });
    },

    logout() {
      return request<LogoutResponse>("/api/auth/logout", { method: "POST" });
    },

    getImportStatus() {
      return request<ImportStatusResponse>("/api/import/example", {
        method: "GET",
      });
    },

    getImportRun(id: string) {
      return request<ImportRunResponse>(`/api/v1/imports/${id}`, {
        method: "GET",
      });
    },

    getImportRunIssues(
      id: string,
      options?: {
        stage?: string;
        code?: string;
        cursor?: string;
        limit?: number;
      },
    ) {
      const params = new URLSearchParams();
      if (options?.stage) params.set("stage", options.stage);
      if (options?.code) params.set("code", options.code);
      if (options?.cursor) params.set("cursor", options.cursor);
      if (typeof options?.limit === "number") {
        params.set("limit", String(options.limit));
      }
      const query = params.toString();
      const path = `/api/v1/imports/${id}/issues${query ? `?${query}` : ""}`;
      return request<ImportRunIssuesResponse>(path, {
        method: "GET",
      });
    },
  };
}
