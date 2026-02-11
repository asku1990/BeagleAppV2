import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/types";

const STORAGE_KEY = "beagle.locale";

export function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored || !isLocale(stored)) {
    return DEFAULT_LOCALE;
  }

  return stored;
}

export function writeStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, locale);
}
