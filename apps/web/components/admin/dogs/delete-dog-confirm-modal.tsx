import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useI18n } from "@/hooks/i18n";
import type { GetAdminDogDeleteImpactResponse } from "@beagle/contracts";
import type { AdminDogRecord } from "./types";

type DeleteDogConfirmModalProps = {
  dog: AdminDogRecord | null;
  impact?: GetAdminDogDeleteImpactResponse | null;
  isImpactLoading?: boolean;
  isImpactError?: boolean;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ImpactLine({ count, label }: { count: number; label: string }) {
  return (
    <li>
      <strong>{count}</strong> {label}
    </li>
  );
}

function formatNames(items: Array<{ name: string }>): string {
  return items.map((item) => item.name).join(", ");
}

export function DeleteDogConfirmModal({
  dog,
  impact,
  isImpactLoading = false,
  isImpactError = false,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteDogConfirmModalProps) {
  const { t } = useI18n();

  return dog ? (
    <ConfirmModal
      open={Boolean(dog)}
      title={t("admin.dogs.delete.title")}
      description={
        <div className="space-y-3">
          <p>
            {t("admin.dogs.delete.descriptionPrefix")}{" "}
            <strong>{dog.name}</strong> ({dog.registrationNo ?? "-"}).
          </p>

          {isImpactLoading ? (
            <p>{t("admin.dogs.delete.impact.loading")}</p>
          ) : null}

          {isImpactError ? <p>{t("admin.dogs.delete.impact.error")}</p> : null}

          {impact ? (
            <>
              <div>
                <p className="font-medium text-foreground">
                  {t("admin.dogs.delete.impact.deletedTitle")}
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  <ImpactLine
                    count={impact.deleted.registrations}
                    label={t("admin.dogs.delete.impact.registrations")}
                  />
                  <ImpactLine
                    count={impact.deleted.ownerships}
                    label={t("admin.dogs.delete.impact.ownerships")}
                  />
                  <ImpactLine
                    count={impact.deleted.titles}
                    label={t("admin.dogs.delete.impact.titles")}
                  />
                  <ImpactLine
                    count={impact.deleted.legacyTrialResults}
                    label={t("admin.dogs.delete.impact.legacyTrialResults")}
                  />
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground">
                  {t("admin.dogs.delete.impact.detachedTitle")}
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  <ImpactLine
                    count={impact.detached.canonicalTrialEntries}
                    label={t("admin.dogs.delete.impact.canonicalTrialEntries")}
                  />
                  <ImpactLine
                    count={impact.detached.showEntries}
                    label={t("admin.dogs.delete.impact.showEntries")}
                  />
                  <ImpactLine
                    count={impact.detached.diseaseRows}
                    label={t("admin.dogs.delete.impact.diseaseRows")}
                  />
                  <ImpactLine
                    count={impact.detached.sireReferences}
                    label={t("admin.dogs.delete.impact.sireReferences")}
                  />
                  <ImpactLine
                    count={impact.detached.damReferences}
                    label={t("admin.dogs.delete.impact.damReferences")}
                  />
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground">
                  {t("admin.dogs.delete.impact.orphanTitle")}
                </p>
                {impact.orphanWarnings.owners.length > 0 ||
                impact.orphanWarnings.breeder ? (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-amber-700">
                    {impact.orphanWarnings.owners.length > 0 ? (
                      <li>
                        {t("admin.dogs.delete.impact.orphanOwners")}:{" "}
                        <strong>
                          {formatNames(impact.orphanWarnings.owners)}
                        </strong>
                      </li>
                    ) : null}
                    {impact.orphanWarnings.breeder ? (
                      <li>
                        {t("admin.dogs.delete.impact.orphanBreeder")}:{" "}
                        <strong>{impact.orphanWarnings.breeder.name}</strong>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="mt-1">
                    {t("admin.dogs.delete.impact.noOrphans")}
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      }
      confirmLabel={t("admin.dogs.delete.confirm")}
      cancelLabel={t("admin.dogs.delete.cancel")}
      confirmVariant="destructive"
      isConfirming={isDeleting}
      confirmingLabel={t("admin.dogs.delete.confirming")}
      ariaLabel={t("admin.dogs.delete.modalAria")}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  ) : null;
}
