export type ResolvedPagination = {
  totalPages: number;
  page: number;
  start: number;
};

export function resolvePagination(
  total: number,
  requestedPage: number,
  pageSize: number,
): ResolvedPagination {
  const totalPages = Math.ceil(total / pageSize);
  const page =
    totalPages === 0
      ? 1
      : Math.min(Math.max(1, requestedPage), Math.max(1, totalPages));

  return {
    totalPages,
    page,
    start: (page - 1) * pageSize,
  };
}
