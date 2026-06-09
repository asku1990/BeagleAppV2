import type {
  AdminDogDiseaseBrowseFilterOptionDb,
  AdminDogDiseaseBrowseGroupOptionDb,
  AdminDogDiseaseDefinitionOptionDb,
} from "../types";

export function mapDiseaseOptions(
  definitions: AdminDogDiseaseDefinitionOptionDb[],
): AdminDogDiseaseBrowseFilterOptionDb[] {
  return definitions.map((definition) => ({
    diseaseCode: definition.diseaseCode,
    diseaseText: definition.diseaseText,
    count: definition.count,
  }));
}

export function mapDiseaseGroupOptions(
  definitions: AdminDogDiseaseDefinitionOptionDb[],
): AdminDogDiseaseBrowseGroupOptionDb[] {
  return definitions.reduce<AdminDogDiseaseBrowseGroupOptionDb[]>(
    (options, definition) => {
      const existing = options.find(
        (option) => option.diseaseGroup === definition.diseaseGroup,
      );
      if (existing) {
        existing.count += definition.count;
        return options;
      }

      options.push({
        diseaseGroup: definition.diseaseGroup,
        count: definition.count,
      });
      return options;
    },
    [],
  );
}
