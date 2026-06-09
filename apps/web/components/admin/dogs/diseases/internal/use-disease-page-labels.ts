import { useMemo } from "react";
import { useI18n } from "@/hooks/i18n";

export function useDiseasePageLabels() {
  const { t } = useI18n();

  return useMemo(
    () => ({
      pageTitle: t("admin.dogs.diseases.page.title"),
      sectionTitle: t("admin.dogs.diseases.section.title"),
      filterLabel: t("admin.dogs.diseases.filter.label"),
      allFilterLabel: t("admin.dogs.diseases.filter.all"),
      queryLabel: t("admin.dogs.diseases.filter.queryLabel"),
      queryPlaceholder: t("admin.dogs.diseases.filter.queryPlaceholder"),
      searchButton: t("admin.dogs.diseases.filter.search"),
      countSuffix: t("admin.dogs.diseases.countSuffix"),
      summaryPrefix: t("admin.dogs.diseases.summary.prefix"),
      summarySuffix: t("admin.dogs.diseases.summary.suffix"),
      loading: t("admin.dogs.diseases.loading"),
      error: t("admin.dogs.diseases.error"),
      empty: t("admin.dogs.diseases.empty"),
      public: {
        yes: t("admin.dogs.diseases.public.yes"),
        no: t("admin.dogs.diseases.public.no"),
      },
      evidenceKind: {
        dog: t("admin.dogs.diseases.create.modeDog"),
        litter: t("admin.dogs.diseases.create.modeLitter"),
      },
      unknownName: t("admin.dogs.diseases.unknownName"),
      sex: {
        male: t("admin.dogs.sex.male"),
        female: t("admin.dogs.sex.female"),
        unknown: t("admin.dogs.sex.unknown"),
      },
      parents: {
        sire: "I",
        dam: "E",
      },
      tableHeaders: {
        disease: t("admin.dogs.diseases.columns.disease"),
        evidenceKind: t("admin.dogs.diseases.columns.evidenceKind"),
        public: t("admin.dogs.diseases.columns.public"),
        registration: t("admin.dogs.diseases.columns.registration"),
        sex: t("admin.dogs.diseases.columns.sex"),
        name: t("admin.dogs.diseases.columns.name"),
        counts: t("admin.dogs.diseases.columns.counts"),
        metadata: t("admin.dogs.diseases.columns.metadata"),
        actions: t("admin.dogs.diseases.columns.actions"),
      },
      cardLabels: {
        public: t("admin.dogs.diseases.card.public"),
        registration: t("admin.dogs.diseases.card.registration"),
        sex: t("admin.dogs.diseases.card.sex"),
        name: t("admin.dogs.diseases.card.name"),
        counts: t("admin.dogs.diseases.card.counts"),
        litter: t("admin.dogs.diseases.create.litter"),
        description: t("admin.dogs.diseases.create.description"),
        source: t("admin.dogs.diseases.create.source"),
        other: t("admin.dogs.diseases.card.other"),
      },
      actions: {
        more: t("admin.dogs.diseases.actions.more"),
        delete: t("admin.dogs.diseases.actions.delete"),
      },
      create: {
        open: t("admin.dogs.diseases.create.open"),
        title: t("admin.dogs.diseases.create.title"),
        aria: t("admin.dogs.diseases.create.aria"),
        mode: t("admin.dogs.diseases.create.mode"),
        modeDog: t("admin.dogs.diseases.create.modeDog"),
        modeLitter: t("admin.dogs.diseases.create.modeLitter"),
        disease: t("admin.dogs.diseases.create.disease"),
        registration: t("admin.dogs.diseases.create.registration"),
        sire: t("admin.dogs.diseases.create.sire"),
        dam: t("admin.dogs.diseases.create.dam"),
        litter: t("admin.dogs.diseases.create.litter"),
        description: t("admin.dogs.diseases.create.description"),
        source: t("admin.dogs.diseases.create.source"),
        public: t("admin.dogs.diseases.create.public"),
        publicNo: t("admin.dogs.diseases.create.publicNo"),
        publicYes: t("admin.dogs.diseases.create.publicYes"),
        save: t("admin.dogs.diseases.create.save"),
        saving: t("admin.dogs.diseases.create.saving"),
        cancel: t("admin.dogs.diseases.create.cancel"),
        success: t("admin.dogs.diseases.create.success"),
        error: t("admin.dogs.diseases.create.error"),
      },
      delete: {
        title: t("admin.dogs.diseases.delete.title"),
        descriptionPrefix: t("admin.dogs.diseases.delete.descriptionPrefix"),
        registrationLabel: t("admin.dogs.diseases.delete.registrationLabel"),
        dogLabel: t("admin.dogs.diseases.delete.dogLabel"),
        confirm: t("admin.dogs.diseases.delete.confirm"),
        confirming: t("admin.dogs.diseases.delete.confirming"),
        cancel: t("admin.dogs.diseases.delete.cancel"),
        aria: t("admin.dogs.diseases.delete.aria"),
        success: t("admin.dogs.diseases.delete.success"),
        error: t("admin.dogs.diseases.delete.error"),
      },
      pagination: {
        previous: t("admin.dogs.diseases.pagination.previous"),
        page: t("admin.dogs.diseases.pagination.page"),
        next: t("admin.dogs.diseases.pagination.next"),
      },
    }),
    [t],
  );
}

export type DiseasePageLabels = ReturnType<typeof useDiseasePageLabels>;
