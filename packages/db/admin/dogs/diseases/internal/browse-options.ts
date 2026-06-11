import type {
  AdminDogDiseaseBrowseFilterOptionDb,
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
