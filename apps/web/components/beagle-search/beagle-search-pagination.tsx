import { Button } from "@/components/ui/button";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { BEAGLE_PAGE_SIZE_OPTIONS } from "@/lib/public/beagle/search";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

type PaginationItem = number | "ellipsis";

function buildPaginationItems(
  page: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visiblePages = new Set<number>([
    1,
    totalPages,
    Math.max(1, page - 1),
    page,
    Math.min(totalPages, page + 1),
  ]);
  const sorted = Array.from(visiblePages).sort((a, b) => a - b);
  const items: PaginationItem[] = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const current = sorted[index];
    const previous = sorted[index - 1];
    if (previous != null && current - previous > 1) {
      items.push("ellipsis");
    }
    items.push(current);
  }

  return items;
}

export function BeagleSearchPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageSelect,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageSelect: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const { t } = useI18n();

  if (total === 0) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const items = buildPaginationItems(page, totalPages);

  return (
    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <span className={cn("text-xs", beagleTheme.mutedText)}>
          {t("search.pagination.pageSize")}
        </span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className={cn(
            "h-9 rounded-md border bg-white px-2 text-sm",
            beagleTheme.border,
            beagleTheme.focusRing,
          )}
        >
          {BEAGLE_PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center justify-start gap-1 md:gap-2 md:justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs md:h-9 md:px-4 md:text-sm"
          onClick={() => onPageSelect(page - 1)}
          disabled={page <= 1}
        >
          {t("search.pagination.previous")}
        </Button>
        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className={cn("px-1 text-sm", beagleTheme.mutedText)}
            >
              ...
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === page ? "default" : "outline"}
              size="sm"
              className="h-8 min-w-8 px-2 text-xs md:h-9 md:min-w-9 md:px-3 md:text-sm"
              onClick={() => onPageSelect(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`${t("search.pagination.page")} ${item}`}
            >
              {item}
            </Button>
          ),
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2 text-xs md:h-9 md:px-4 md:text-sm"
          onClick={() => onPageSelect(page + 1)}
          disabled={page >= totalPages}
        >
          {t("search.pagination.next")}
        </Button>
      </div>
      <p className={cn("text-sm md:text-right", beagleTheme.mutedText)}>
        {t("search.pagination.range")} {start}-{end} / {total}
      </p>
    </div>
  );
}
