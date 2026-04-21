import {
  fiAdminTrialsDetailMessages,
  svAdminTrialsDetailMessages,
} from "@/lib/i18n/messages/admin/trials/detail";
import {
  fiAdminTrialsManageMessages,
  svAdminTrialsManageMessages,
} from "@/lib/i18n/messages/admin/trials/manage";

export const fiAdminTrialsMessages = {
  ...fiAdminTrialsManageMessages,
  ...fiAdminTrialsDetailMessages,
} as const;

export const svAdminTrialsMessages = {
  ...svAdminTrialsManageMessages,
  ...svAdminTrialsDetailMessages,
} as const;
