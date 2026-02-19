import type { Locale } from "@/lib/i18n/types";
import { fiCommonMessages, svCommonMessages } from "@/lib/i18n/messages/common";
import { fiHeaderMessages, svHeaderMessages } from "@/lib/i18n/messages/header";
import { fiHomeMessages, svHomeMessages } from "@/lib/i18n/messages/home";
import { fiSearchMessages, svSearchMessages } from "@/lib/i18n/messages/search";
import { fiAuthMessages, svAuthMessages } from "@/lib/i18n/messages/auth";
import {
  fiAdminHomeMessages,
  svAdminHomeMessages,
} from "@/lib/i18n/messages/admin-home";
import {
  fiAdminUsersMessages,
  svAdminUsersMessages,
} from "@/lib/i18n/messages/admin-users";
import {
  fiAdminSettingsMessages,
  svAdminSettingsMessages,
} from "@/lib/i18n/messages/admin-settings";
import {
  fiAccountMessages,
  svAccountMessages,
} from "@/lib/i18n/messages/account";
import {
  fiSidebarMessages,
  svSidebarMessages,
} from "@/lib/i18n/messages/sidebar";

const fi = {
  ...fiHeaderMessages,
  ...fiSidebarMessages,
  ...fiAuthMessages,
  ...fiAdminHomeMessages,
  ...fiAdminUsersMessages,
  ...fiAdminSettingsMessages,
  ...fiAccountMessages,
  ...fiCommonMessages,
  ...fiHomeMessages,
  ...fiSearchMessages,
} as const;

export type MessageKey = keyof typeof fi;
type Messages = Record<MessageKey, string>;

const sv: Messages = {
  ...svHeaderMessages,
  ...svSidebarMessages,
  ...svAuthMessages,
  ...svAdminHomeMessages,
  ...svAdminUsersMessages,
  ...svAdminSettingsMessages,
  ...svAccountMessages,
  ...svCommonMessages,
  ...svHomeMessages,
  ...svSearchMessages,
};

export const messages: Record<Locale, Messages> = {
  fi,
  sv,
};
