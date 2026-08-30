import type {
  BestDriverRankingRequest,
  BestDriverRankingResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

export function getBestDriverRanking(
  request: RequestFn,
  input: BestDriverRankingRequest = {},
) {
  const params = new URLSearchParams();
  if (typeof input.season === "number") {
    params.set("season", String(input.season));
  }
  const query = params.toString();
  return request<BestDriverRankingResponse>(
    `/api/beagle/competitions/best-driver${query ? `?${query}` : ""}`,
    { method: "GET" },
  );
}
