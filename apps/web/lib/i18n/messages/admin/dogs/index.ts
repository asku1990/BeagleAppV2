import { fiAdminDogsCommonMessages, svAdminDogsCommonMessages } from "./common";
import { fiAdminDogsTableMessages, svAdminDogsTableMessages } from "./table";
import { fiAdminDogsFormMessages, svAdminDogsFormMessages } from "./form";
import { fiAdminDogsModalMessages, svAdminDogsModalMessages } from "./modals";
import {
  fiAdminDogsVirtualPairingMessages,
  svAdminDogsVirtualPairingMessages,
} from "./virtual-pairing";

export const fiAdminDogsMessages = {
  ...fiAdminDogsCommonMessages,
  ...fiAdminDogsTableMessages,
  ...fiAdminDogsFormMessages,
  ...fiAdminDogsModalMessages,
  ...fiAdminDogsVirtualPairingMessages,
} as const;

export const svAdminDogsMessages = {
  ...svAdminDogsCommonMessages,
  ...svAdminDogsTableMessages,
  ...svAdminDogsFormMessages,
  ...svAdminDogsModalMessages,
  ...svAdminDogsVirtualPairingMessages,
} as const;
