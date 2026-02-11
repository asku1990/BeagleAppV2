export const SUPPORTED_LOCALES = ["fi", "sv", "en"] as const;
export const LOCALE_COOKIE_NAME = "beagle.locale";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fi";

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}
