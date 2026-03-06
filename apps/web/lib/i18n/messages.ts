import type { Locale } from "@/lib/i18n/types";
import { fiCommonMessages, svCommonMessages } from "@/lib/i18n/messages/common";
import { fiHeaderMessages, svHeaderMessages } from "@/lib/i18n/messages/header";
import { fiHomeMessages, svHomeMessages } from "@/lib/i18n/messages/home";
import { fiSearchMessages, svSearchMessages } from "@/lib/i18n/messages/search";
import { fiAuthMessages, svAuthMessages } from "@/lib/i18n/messages/auth";
import {
  fiAdminHomeMessages,
  svAdminHomeMessages,
} from "@/lib/i18n/messages/admin/home";
import {
  fiAdminUsersMessages,
  svAdminUsersMessages,
} from "@/lib/i18n/messages/admin/users";
import {
  fiAdminDogsMessages,
  svAdminDogsMessages,
} from "@/lib/i18n/messages/admin/dogs";
import {
  fiAdminSettingsMessages,
  svAdminSettingsMessages,
} from "@/lib/i18n/messages/admin/settings";
import {
  fiAccountMessages,
  svAccountMessages,
} from "@/lib/i18n/messages/account";
import {
  fiSidebarMessages,
  svSidebarMessages,
} from "@/lib/i18n/messages/sidebar";
import {
  fiBeagleDogProfileMessages,
  svBeagleDogProfileMessages,
} from "@/lib/i18n/messages/beagle/dogs/profile";
import {
  fiBeagleShowsMessages,
  svBeagleShowsMessages,
} from "@/lib/i18n/messages/beagle/shows";

const fi = {
  ...fiHeaderMessages,
  ...fiSidebarMessages,
  ...fiAuthMessages,
  ...fiAdminHomeMessages,
  ...fiAdminUsersMessages,
  ...fiAdminDogsMessages,
  ...fiAdminSettingsMessages,
  ...fiAccountMessages,
  ...fiCommonMessages,
  ...fiHomeMessages,
  ...fiSearchMessages,
  ...fiBeagleDogProfileMessages,
  ...fiBeagleShowsMessages,
} as const;

export type MessageKey = keyof typeof fi;
type Messages = Record<MessageKey, string>;

const sv: Messages = {
  ...svHeaderMessages,
  ...svSidebarMessages,
  ...svAuthMessages,
  ...svAdminHomeMessages,
  ...svAdminUsersMessages,
  ...svAdminDogsMessages,
  ...svAdminSettingsMessages,
  ...svAccountMessages,
  ...svCommonMessages,
  ...svHomeMessages,
  ...svSearchMessages,
  ...svBeagleDogProfileMessages,
  ...svBeagleShowsMessages,
};

export const messages: Record<Locale, Messages> = {
  fi,
  sv,
};
