import { resolveOptionLabel, type OptionLabelLookup } from "./display";
import type {
  ManageShowAward,
  ManageShowEntry,
} from "@/components/admin/shows/manage/show-management-types";

export function getAwardLogEntries(
  awards: ManageShowAward[],
  awardLabelLookup?: OptionLabelLookup,
) {
  return awards.map((award) => ({
    awardId: award.id,
    awardCode: award.code,
    ...(awardLabelLookup
      ? { awardLabel: resolveOptionLabel(awardLabelLookup, award.code) }
      : {}),
  }));
}

export function getEntryRenderLog(
  entry: ManageShowEntry,
  awardLabelLookup: OptionLabelLookup,
) {
  return {
    entryId: entry.id,
    dogName: entry.dogName,
    awards: getAwardLogEntries(entry.awards, awardLabelLookup),
  };
}
