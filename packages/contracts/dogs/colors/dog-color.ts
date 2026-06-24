export type DogColorStatus = "SELECTABLE" | "HIDDEN" | "LEGACY_UNKNOWN";

export type DogColorDto = {
  code: number;
  nameFi: string;
  nameSv: string | null;
  nameEn: string | null;
  status: DogColorStatus;
};
