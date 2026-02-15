import type { Locale } from "@/lib/i18n/types";
import { fiCommonMessages, svCommonMessages } from "@/lib/i18n/messages/common";
import { fiHeaderMessages, svHeaderMessages } from "@/lib/i18n/messages/header";
import { fiHomeMessages, svHomeMessages } from "@/lib/i18n/messages/home";
import { fiSearchMessages, svSearchMessages } from "@/lib/i18n/messages/search";
import {
  fiSidebarMessages,
  svSidebarMessages,
} from "@/lib/i18n/messages/sidebar";

const fi = {
  ...fiHeaderMessages,
  ...fiSidebarMessages,
  ...fiCommonMessages,
  ...fiHomeMessages,
  ...fiSearchMessages,
} as const;

export type MessageKey = keyof typeof fi;
type Messages = Record<MessageKey, string>;

const sv: Messages = {
  ...svHeaderMessages,
  ...svSidebarMessages,
  ...svCommonMessages,
  ...svHomeMessages,
  ...svSearchMessages,
};

export const messages: Record<Locale, Messages> = {
  fi,
  sv,
};
