import type {
  ApiResult,
  CurrentUserDto,
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
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      credentials,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
        ...(init.headers ?? {}),
      },
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
  };
}
