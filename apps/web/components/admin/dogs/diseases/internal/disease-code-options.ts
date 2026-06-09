import type { AdminDogDiseaseBrowseResponse } from "@beagle/contracts";

export type DiseaseCodeOption = {
  diseaseCode: string | "all";
  label: string;
};

export function mapDiseaseCodeOptions({
  data,
  allFilterLabel,
  countSuffix,
}: {
  data: AdminDogDiseaseBrowseResponse | null;
  allFilterLabel: string;
  countSuffix: string;
}): DiseaseCodeOption[] {
  const options = data?.diseaseOptions ?? [];
  const allDiseaseCount = options.reduce(
    (sum, option) => sum + option.count,
    0,
  );

  return [
    {
      diseaseCode: "all",
      label: `${allFilterLabel} ${allDiseaseCount} ${countSuffix}`,
    },
    ...options.map((option) => ({
      diseaseCode: option.diseaseCode,
      label: `${option.diseaseText} ${option.count} ${countSuffix}`,
    })),
  ];
}
