"use client";

import type { AdminTrialDetails } from "@beagle/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import {
  evaluateTrialValidationGaps,
  type TrialValidationGapItem,
} from "@/lib/admin/trials/manage";

const GROUP_LABEL_KEYS = {
  event: "admin.trials.validation.groups.event",
  dog: "admin.trials.validation.groups.dog",
  result: "admin.trials.validation.groups.result",
  conditions: "admin.trials.validation.groups.conditions",
  status: "admin.trials.validation.groups.status",
  additional: "admin.trials.validation.groups.additional",
  judges: "admin.trials.validation.groups.judges",
} as const;

function groupLabelKey(
  group: TrialValidationGapItem["group"],
): (typeof GROUP_LABEL_KEYS)[TrialValidationGapItem["group"]] {
  return GROUP_LABEL_KEYS[group];
}

function GapList({ items }: { items: TrialValidationGapItem[] }) {
  const { t } = useI18n();

  return (
    <ul className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={`${item.status}-${item.targetField}`}>
          <span className="text-muted-foreground">
            {t(groupLabelKey(item.group))}:
          </span>{" "}
          <code>{item.targetField}</code>
          {item.sourceField ? (
            <span className="text-muted-foreground"> ({item.sourceField})</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

type AdminTrialValidationPanelProps = {
  trial?: AdminTrialDetails | null;
  context: "detail" | "search";
};

export function AdminTrialValidationPanel({
  trial,
  context,
}: AdminTrialValidationPanelProps) {
  const { t } = useI18n();
  const evaluation = evaluateTrialValidationGaps(trial);
  const isDetailContext = context === "detail";

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            {t("admin.trials.validation.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isDetailContext
              ? t("admin.trials.validation.description.detail")
              : t("admin.trials.validation.description.search")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("admin.trials.validation.summary.totalPrefix")}{" "}
            {evaluation.totalFieldCount} •{" "}
            {t("admin.trials.validation.summary.availablePrefix")}{" "}
            {evaluation.availableCount} •{" "}
            {t("admin.trials.validation.summary.missingPrefix")}{" "}
            {evaluation.missingFromModel.length}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {t("admin.trials.validation.sections.missing")}
          </h4>
          {evaluation.missingFromModel.length > 0 ? (
            <GapList items={evaluation.missingFromModel} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("admin.trials.validation.empty.missing")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {t("admin.trials.validation.sections.incomplete")}
          </h4>
          {!isDetailContext ? (
            <p className="text-sm text-muted-foreground">
              {t("admin.trials.validation.incomplete.notEvaluated")}
            </p>
          ) : evaluation.availableButIncomplete.length > 0 ? (
            <GapList items={evaluation.availableButIncomplete} />
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("admin.trials.validation.empty.incomplete")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
