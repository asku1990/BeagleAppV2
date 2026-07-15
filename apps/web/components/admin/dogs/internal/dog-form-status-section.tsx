import type { DogStatus } from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import type { MessageKey } from "@/lib/i18n/messages";

type DogFormStatusSectionProps = {
  status: DogStatus;
  onStatusChange: (status: DogStatus) => void;
  t: (key: MessageKey) => string;
};

export function DogFormStatusSection({
  status,
  onStatusChange,
  t,
}: DogFormStatusSectionProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {t("admin.dogs.form.statusLabel")}
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t("admin.dogs.form.statusAria")}
      >
        <Button
          type="button"
          size="sm"
          variant={status === "NORMAL" ? "default" : "outline"}
          onClick={() => onStatusChange("NORMAL")}
        >
          {t("admin.dogs.form.statusNormal")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={status === "REFERENCE_ONLY" ? "default" : "outline"}
          onClick={() => onStatusChange("REFERENCE_ONLY")}
        >
          {t("admin.dogs.form.statusReferenceOnly")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {status === "REFERENCE_ONLY"
          ? t("admin.dogs.form.statusReferenceOnlyHelp")
          : t("admin.dogs.form.statusNormalHelp")}
      </p>
    </div>
  );
}
