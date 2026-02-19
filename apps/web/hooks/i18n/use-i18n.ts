"use client";

import { useContext } from "react";
import { messages, type MessageKey } from "@/lib/i18n/messages";
import { I18nContext } from "@/lib/i18n/provider";
import { DEFAULT_LOCALE } from "@/lib/i18n/types";

const fallbackI18nContext = {
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key: MessageKey) => messages[DEFAULT_LOCALE][key],
} as const;

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return fallbackI18nContext;
  }
  return context;
}
