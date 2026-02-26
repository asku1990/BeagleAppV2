import { fiAdminDogsCommonMessages, svAdminDogsCommonMessages } from "./common";
import { fiAdminDogsTableMessages, svAdminDogsTableMessages } from "./table";
import { fiAdminDogsFormMessages, svAdminDogsFormMessages } from "./form";
import { fiAdminDogsModalMessages, svAdminDogsModalMessages } from "./modals";

export const fiAdminDogsMessages = {
  ...fiAdminDogsCommonMessages,
  ...fiAdminDogsTableMessages,
  ...fiAdminDogsFormMessages,
  ...fiAdminDogsModalMessages,
} as const;

export const svAdminDogsMessages = {
  ...svAdminDogsCommonMessages,
  ...svAdminDogsTableMessages,
  ...svAdminDogsFormMessages,
  ...svAdminDogsModalMessages,
} as const;
