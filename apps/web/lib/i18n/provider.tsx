"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { messages, type MessageKey } from "@/lib/i18n/messages";
import { readStoredLocale, writeStoredLocale } from "@/lib/i18n/storage";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/types";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);
  const isLocaleResolved = useRef(Boolean(initialLocale));

  useEffect(() => {
    if (initialLocale) {
      return;
    }

    const storedLocale = readStoredLocale();
    if (storedLocale === DEFAULT_LOCALE) {
      isLocaleResolved.current = true;
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      isLocaleResolved.current = true;
      setLocale(storedLocale);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [initialLocale]);

  useEffect(() => {
    if (!isLocaleResolved.current) {
      return;
    }

    writeStoredLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: MessageKey): string => {
      return messages[locale][key] ?? messages[DEFAULT_LOCALE][key];
    };

    return {
      locale,
      setLocale,
      t,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
