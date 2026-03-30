import { parseLocalIsoDate } from "@/lib/public/beagle/dogs/profile";

export const DOG_PROFILE_SHOW_FALLBACK_VALUE = "-";

export type DogProfileShowCritique = {
  showId: string;
  place: string;
  date: string;
  text: string;
};

export type DogProfileShowsT = (
  key:
    | "dog.profile.shows.col.no"
    | "dog.profile.shows.col.showType"
    | "dog.profile.shows.col.className"
    | "dog.profile.shows.col.place"
    | "dog.profile.shows.col.date"
    | "dog.profile.shows.col.qualityGrade"
    | "dog.profile.shows.col.classResult"
    | "dog.profile.shows.col.pupn"
    | "dog.profile.shows.col.awards"
    | "dog.profile.shows.col.height"
    | "dog.profile.shows.col.judge"
    | "dog.profile.shows.col.reviewText"
    | "dog.profile.shows.copy.success"
    | "dog.profile.shows.copy.error"
    | "dog.profile.shows.copy.unsupported"
    | "dog.profile.shows.review.open"
    | "dog.profile.shows.review.modalTitle",
) => string;

export function formatDogProfileShowDate(
  value: string,
  locale: "fi" | "sv",
): string {
  const parsed = parseLocalIsoDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return DOG_PROFILE_SHOW_FALLBACK_VALUE;
  }

  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  return new Intl.DateTimeFormat(localeTag).format(parsed);
}

export function formatDogProfileShowHeight(heightCm: number | null): string {
  if (heightCm == null) {
    return DOG_PROFILE_SHOW_FALLBACK_VALUE;
  }

  return `${heightCm} cm`;
}
