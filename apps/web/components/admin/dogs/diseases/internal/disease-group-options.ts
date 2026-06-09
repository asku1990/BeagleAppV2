import type {
  AdminDogDiseaseBrowseResponse,
  AdminDogDiseaseGroup,
} from "@beagle/contracts";
import type { DiseaseGroupOption } from "./disease-search-form";

export function mapDiseaseGroupOptions({
  data,
  allDiseaseCount,
  allGroupLabel,
  countSuffix,
  groupLabels,
}: {
  data: AdminDogDiseaseBrowseResponse | null;
  allDiseaseCount: number;
  allGroupLabel: string;
  countSuffix: string;
  groupLabels: Record<AdminDogDiseaseGroup, string>;
}): DiseaseGroupOption[] {
  const options = data?.diseaseGroupOptions ?? [];
  const browseOptions: Array<{
    diseaseGroup: AdminDogDiseaseGroup | "all";
    diseaseText: string;
    count: number;
  }> = [
    {
      diseaseGroup: "all",
      diseaseText: allGroupLabel,
      count: allDiseaseCount,
    },
    ...options.map((option) => ({
      diseaseGroup: option.diseaseGroup,
      diseaseText: groupLabels[option.diseaseGroup],
      count: option.count,
    })),
  ];

  return browseOptions.map((option) => ({
    diseaseGroup: option.diseaseGroup,
    label: `${option.diseaseText} ${option.count} ${countSuffix}`,
  }));
}
