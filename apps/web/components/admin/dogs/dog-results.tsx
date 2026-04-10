import { ListingResponsiveResults } from "@/components/listing";
import { AdminRowActionsMenu } from "@/components/admin";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import type { AdminDogParentPreview, AdminDogRecord } from "./types";

type DogResultsProps = {
  dogs: AdminDogRecord[];
  onEdit: (dog: AdminDogRecord) => void;
  onDelete: (dog: AdminDogRecord) => void;
};

function DogSexLabel({ sex }: { sex: AdminDogRecord["sex"] }) {
  const { t } = useI18n();

  if (sex === "MALE") {
    return t("admin.dogs.sex.male");
  }

  if (sex === "FEMALE") {
    return t("admin.dogs.sex.female");
  }

  return t("admin.dogs.sex.unknown");
}

function showDash(value: string | number | null): string {
  if (value === null) {
    return "-";
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : "-";
}

function formatBirthDate(
  value: string | null,
  locale: "fi" | "sv",
): string | null {
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
    return value;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return value;
  }

  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() + 1 !== month ||
    parsed.getDate() !== day
  ) {
    return value;
  }

  const dateLocale = locale === "fi" ? "fi-FI" : "sv-SE";
  return new Intl.DateTimeFormat(dateLocale).format(parsed);
}

function formatOwners(owners: string[]): string {
  if (owners.length === 0) {
    return "-";
  }

  return owners.join(", ");
}

function formatAdditionalRegistrations(registrationNos: string[]): string {
  if (registrationNos.length === 0) {
    return "-";
  }

  return registrationNos.join(", ");
}

function formatParent(parent: AdminDogParentPreview | null): string {
  if (!parent) {
    return "-";
  }

  const safeName = parent.name.trim();
  const safeRegistrationNo = parent.registrationNo.trim();

  if (!safeName && !safeRegistrationNo) {
    return "-";
  }

  if (safeName && safeRegistrationNo) {
    return `${safeName} (${safeRegistrationNo})`;
  }

  return safeName || safeRegistrationNo;
}

export function DogResults({ dogs, onEdit, onDelete }: DogResultsProps) {
  const { t, locale } = useI18n();

  if (dogs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("admin.dogs.empty.noResults")}
      </p>
    );
  }

  return (
    <ListingResponsiveResults
      desktopClassName="overflow-x-auto"
      mobileClassName="space-y-3"
      desktop={
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2">
                {t("admin.dogs.columns.registrationNo")}
              </th>
              <th className="px-2 py-2">{t("admin.dogs.columns.name")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.sex")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.birthDate")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.breeder")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.owners")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.sire")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.dam")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.trials")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.shows")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.titles")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.ekNo")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.note")}</th>
              <th className="px-2 py-2">{t("admin.dogs.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {dogs.map((dog) => (
              <tr key={dog.id} className="border-b align-top">
                <td className="px-2 py-2">
                  <div className="font-medium">
                    {showDash(dog.registrationNo)}
                  </div>
                  {dog.secondaryRegistrationNos.length > 0 ? (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t("admin.dogs.columns.additionalRegistrationNos")}:{" "}
                      {formatAdditionalRegistrations(
                        dog.secondaryRegistrationNos,
                      )}
                    </div>
                  ) : null}
                </td>
                <td className="px-2 py-2">{showDash(dog.name)}</td>
                <td className="px-2 py-2">
                  <DogSexLabel sex={dog.sex} />
                </td>
                <td className="px-2 py-2">
                  {showDash(formatBirthDate(dog.birthDate, locale))}
                </td>
                <td className="px-2 py-2">{showDash(dog.breederNameText)}</td>
                <td className="px-2 py-2">
                  {formatOwners(dog.ownershipPreview)}
                </td>
                <td className="px-2 py-2">{formatParent(dog.sirePreview)}</td>
                <td className="px-2 py-2">{formatParent(dog.damPreview)}</td>
                <td className="px-2 py-2">{dog.trialCount}</td>
                <td className="px-2 py-2">{dog.showCount}</td>
                <td className="px-2 py-2">{showDash(dog.titlesText)}</td>
                <td className="px-2 py-2">{showDash(dog.ekNo)}</td>
                <td className="px-2 py-2 max-w-[20rem] whitespace-pre-wrap">
                  {showDash(dog.note)}
                </td>
                <td className="px-2 py-2">
                  <AdminRowActionsMenu
                    triggerAriaLabel={t("admin.dogs.actions.more")}
                    actions={[
                      {
                        id: "edit",
                        label: t("admin.dogs.actions.edit"),
                        onSelect: () => onEdit(dog),
                      },
                      {
                        id: "delete",
                        label: t("admin.dogs.actions.delete"),
                        onSelect: () => onDelete(dog),
                        destructive: true,
                        separatorBefore: true,
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      mobile={dogs.map((dog) => (
        <Card key={dog.id}>
          <CardContent className="space-y-3 pt-4">
            <div>
              <p className="font-medium">{showDash(dog.name)}</p>
              <p className="text-sm text-muted-foreground">
                {showDash(dog.registrationNo)}
              </p>
            </div>
            <div className="text-sm space-y-1">
              <p>
                {t("admin.dogs.mobile.sexLabel")}: <DogSexLabel sex={dog.sex} />
              </p>
              <p>
                {t("admin.dogs.mobile.birthDateLabel")}:{" "}
                {showDash(formatBirthDate(dog.birthDate, locale))}
              </p>
              <p>
                {t("admin.dogs.mobile.additionalRegistrationNosLabel")}:{" "}
                {formatAdditionalRegistrations(dog.secondaryRegistrationNos)}
              </p>
              <p>
                {t("admin.dogs.mobile.breederLabel")}:{" "}
                {showDash(dog.breederNameText)}
              </p>
              <p>
                {t("admin.dogs.mobile.ownersLabel")}:{" "}
                {formatOwners(dog.ownershipPreview)}
              </p>
              <p>
                {t("admin.dogs.mobile.sireLabel")}:{" "}
                {formatParent(dog.sirePreview)}
              </p>
              <p>
                {t("admin.dogs.mobile.damLabel")}:{" "}
                {formatParent(dog.damPreview)}
              </p>
              <p>
                {t("admin.dogs.mobile.trialsLabel")}: {dog.trialCount}
              </p>
              <p>
                {t("admin.dogs.mobile.showsLabel")}: {dog.showCount}
              </p>
              <p>
                {t("admin.dogs.mobile.titlesLabel")}: {showDash(dog.titlesText)}
              </p>
              <p>
                {t("admin.dogs.mobile.ekNoLabel")}: {showDash(dog.ekNo)}
              </p>
              <p>
                {t("admin.dogs.mobile.noteLabel")}: {showDash(dog.note)}
              </p>
            </div>
            <AdminRowActionsMenu
              triggerAriaLabel={t("admin.dogs.actions.more")}
              actions={[
                {
                  id: "edit",
                  label: t("admin.dogs.actions.edit"),
                  onSelect: () => onEdit(dog),
                },
                {
                  id: "delete",
                  label: t("admin.dogs.actions.delete"),
                  onSelect: () => onDelete(dog),
                  destructive: true,
                  separatorBefore: true,
                },
              ]}
            />
          </CardContent>
        </Card>
      ))}
    />
  );
}
