import {
  fiAdminShowsImportMessages,
  svAdminShowsImportMessages,
} from "@/lib/i18n/messages/admin/shows/import";
import {
  fiAdminShowsManageMessages,
  svAdminShowsManageMessages,
} from "@/lib/i18n/messages/admin/shows/manage";

export const fiAdminShowsMessages = {
  ...fiAdminShowsImportMessages,
  ...fiAdminShowsManageMessages,
} as const;

export const svAdminShowsMessages = {
  ...svAdminShowsImportMessages,
  ...svAdminShowsManageMessages,
} as const;
