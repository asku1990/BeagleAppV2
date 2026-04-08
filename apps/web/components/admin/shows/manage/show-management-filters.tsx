"use client";

import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";

export function ShowManagementFilters({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const { t } = useI18n();

  return (
    <Input
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      placeholder={t("admin.shows.manage.filters.placeholder")}
      aria-label={t("admin.shows.manage.filters.aria")}
    />
  );
}
